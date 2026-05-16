using HRLeaves.API.Data;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRLeaves.API.Repositories;

public class LeaveBalanceRepository(AppDbContext context) : BaseRepository<LeaveBalance>(context), ILeaveBalanceRepository
{
    public override async Task<IEnumerable<LeaveBalance>> GetAllAsync() =>
        await _dbSet.Include(lb => lb.Employee).Include(lb => lb.LeaveType).ToListAsync();

    public async Task<LeaveBalance?> GetByEmployeeAndTypeAsync(int employeeId, int leaveTypeId) =>
        await _dbSet.FirstOrDefaultAsync(lb =>
            lb.EmployeeId == employeeId && lb.LeaveTypeId == leaveTypeId);

    public async Task<IEnumerable<LeaveBalance>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet
            .Include(lb => lb.LeaveType)
            .Where(lb => lb.EmployeeId == employeeId)
            .ToListAsync();
}
