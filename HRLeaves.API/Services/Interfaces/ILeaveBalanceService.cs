using HRLeaves.API.DTOs.LeaveBalance;

namespace HRLeaves.API.Services.Interfaces;

public interface ILeaveBalanceService
{
    Task<IEnumerable<LeaveBalanceDto>> GetAllAsync();
    Task<IEnumerable<LeaveBalanceDto>> GetByEmployeeIdAsync(int employeeId);
    Task RecalculateAccruedAsync(int employeeId);
    Task RecalculateAllAccruedAsync();
}
