using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveRequest;

namespace HRLeaves.API.Services.Interfaces;

public interface ILeaveRequestService
{
    Task<PagedResponse<LeaveRequestDto>> GetPagedAsync(LeaveRequestQueryParameters parameters);
    Task<LeaveRequestDto?> GetByIdAsync(int id);
    Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto);
    Task<LeaveRequestDto?> ApproveAsync(int id);
    Task<LeaveRequestDto?> RejectAsync(int id, ApproveRejectDto dto);
    Task<LeaveRequestDto?> CancelAsync(int id);
    Task<List<LeaveRequestDto>> BulkApproveAsync(BulkApproveRejectDto dto);
    Task<List<LeaveRequestDto>> BulkRejectAsync(BulkApproveRejectDto dto);
    Task<byte[]> ExportToCsvAsync(LeaveRequestQueryParameters parameters);
}
