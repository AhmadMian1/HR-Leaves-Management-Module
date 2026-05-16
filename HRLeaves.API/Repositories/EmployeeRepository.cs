using HRLeaves.API.Data;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRLeaves.API.Repositories;

public class EmployeeRepository(AppDbContext context) : BaseRepository<Employee>(context), IEmployeeRepository
{
    public async Task<Employee?> GetByEmailAsync(string email) =>
        await _dbSet.FirstOrDefaultAsync(e => e.Email.ToLower() == email.ToLower());

    public async Task<IEnumerable<Employee>> GetActiveEmployeesAsync() =>
        await _dbSet.Where(e => e.IsActive).ToListAsync();

    public async Task<(IEnumerable<Employee> employees, int totalCount)> GetPagedAsync(
        int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(e =>
                e.FullName.Contains(searchTerm) ||
                e.Email.Contains(searchTerm) ||
                e.Department.Contains(searchTerm));

        query = sortBy?.ToLower() switch
        {
            "fullname" => sortDescending ? query.OrderByDescending(e => e.FullName) : query.OrderBy(e => e.FullName),
            "department" => sortDescending ? query.OrderByDescending(e => e.Department) : query.OrderBy(e => e.Department),
            "hiredate" => sortDescending ? query.OrderByDescending(e => e.HireDate) : query.OrderBy(e => e.HireDate),
            _ => sortDescending ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id)
        };

        var totalCount = await query.CountAsync();
        var employees = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        return (employees, totalCount);
    }
}
