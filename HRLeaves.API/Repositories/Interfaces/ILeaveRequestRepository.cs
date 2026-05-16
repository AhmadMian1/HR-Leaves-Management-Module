using HRLeaves.API.Models;

namespace HRLeaves.API.Repositories.Interfaces;

public interface ILeaveRequestRepository : IBaseRepository<LeaveRequest>
{
    Task<IEnumerable<LeaveRequest>> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<LeaveRequest>> GetApprovedOverlappingAsync(int employeeId, DateTime start, DateTime end, int? excludeId = null);
    Task<(IEnumerable<LeaveRequest> requests, int totalCount)> GetPagedAsync(
        int pageNumber, int pageSize,
        int? employeeId, int? leaveTypeId, string? status,
        DateTime? startDateFrom, DateTime? startDateTo,
        string? sortBy, bool sortDescending);
    Task<IEnumerable<LeaveRequest>> GetAllWithDetailsAsync(
        int? employeeId, int? leaveTypeId, string? status,
        DateTime? startDateFrom, DateTime? startDateTo);
}
