using HRLeaves.API.Models;

namespace HRLeaves.API.Repositories.Interfaces;

public interface ILeaveSettlementRepository : IBaseRepository<LeaveSettlement>
{
    Task<IEnumerable<LeaveSettlement>> GetByEmployeeIdAsync(int employeeId);
    Task<(IEnumerable<LeaveSettlement> settlements, int totalCount)> GetPagedAsync(
        int pageNumber, int pageSize, int? employeeId, int? leaveTypeId);
}
