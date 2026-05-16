using HRLeaves.API.Models;

namespace HRLeaves.API.Repositories.Interfaces;

public interface IEmployeeRepository : IBaseRepository<Employee>
{
    Task<Employee?> GetByEmailAsync(string email);
    Task<IEnumerable<Employee>> GetActiveEmployeesAsync();
    Task<(IEnumerable<Employee> employees, int totalCount)> GetPagedAsync(
        int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending);
}
