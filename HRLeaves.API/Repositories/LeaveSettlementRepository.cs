using HRLeaves.API.Data;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRLeaves.API.Repositories;

public class LeaveSettlementRepository(AppDbContext context) : BaseRepository<LeaveSettlement>(context), ILeaveSettlementRepository
{
    public override async Task<IEnumerable<LeaveSettlement>> GetAllAsync() =>
        await _dbSet
            .Include(ls => ls.Employee)
            .Include(ls => ls.LeaveType)
            .OrderByDescending(ls => ls.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<LeaveSettlement>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet
            .Include(ls => ls.LeaveType)
            .Where(ls => ls.EmployeeId == employeeId)
            .OrderByDescending(ls => ls.CreatedAt)
            .ToListAsync();

    public async Task<(IEnumerable<LeaveSettlement> settlements, int totalCount)> GetPagedAsync(
        int pageNumber, int pageSize, int? employeeId, int? leaveTypeId)
    {
        var query = _dbSet
            .Include(ls => ls.Employee)
            .Include(ls => ls.LeaveType)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(ls => ls.EmployeeId == employeeId.Value);

        if (leaveTypeId.HasValue)
            query = query.Where(ls => ls.LeaveTypeId == leaveTypeId.Value);

        query = query.OrderByDescending(ls => ls.CreatedAt);

        var totalCount = await query.CountAsync();
        var settlements = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        return (settlements, totalCount);
    }
}
