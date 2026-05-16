using HRLeaves.API.DTOs.LeaveType;

namespace HRLeaves.API.Services.Interfaces;

public interface ILeaveTypeService
{
    Task<IEnumerable<LeaveTypeDto>> GetAllAsync();
    Task<LeaveTypeDto?> GetByIdAsync(int id);
    Task<LeaveTypeDto> CreateAsync(CreateLeaveTypeDto dto);
    Task<LeaveTypeDto?> UpdateAsync(int id, UpdateLeaveTypeDto dto);
    Task<bool> DeleteAsync(int id);
}
