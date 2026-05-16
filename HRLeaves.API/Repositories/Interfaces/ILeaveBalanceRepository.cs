using HRLeaves.API.Models;

namespace HRLeaves.API.Repositories.Interfaces;

public interface ILeaveBalanceRepository : IBaseRepository<LeaveBalance>
{
    Task<LeaveBalance?> GetByEmployeeAndTypeAsync(int employeeId, int leaveTypeId);
    Task<IEnumerable<LeaveBalance>> GetByEmployeeIdAsync(int employeeId);
}
