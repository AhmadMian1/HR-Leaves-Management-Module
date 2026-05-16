using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveSettlement;

namespace HRLeaves.API.Services.Interfaces;

public interface ILeaveSettlementService
{
    Task<PagedResponse<LeaveSettlementDto>> GetPagedAsync(int pageNumber, int pageSize, int? employeeId, int? leaveTypeId);
    Task<IEnumerable<LeaveSettlementDto>> GetByEmployeeIdAsync(int employeeId);
    Task<LeaveSettlementDto?> GetByIdAsync(int id);
    Task<LeaveSettlementDto> CreateAsync(CreateLeaveSettlementDto dto);
    Task<bool> DeleteAsync(int id);
}
