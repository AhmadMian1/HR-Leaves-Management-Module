using AutoMapper;
using HRLeaves.API.DTOs.LeaveType;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using HRLeaves.API.Services.Interfaces;

namespace HRLeaves.API.Services;

public class LeaveTypeService(ILeaveTypeRepository repository, IMapper mapper) : ILeaveTypeService
{
    public async Task<IEnumerable<LeaveTypeDto>> GetAllAsync()
    {
        var types = await repository.GetAllAsync();
        return mapper.Map<IEnumerable<LeaveTypeDto>>(types);
    }

    public async Task<LeaveTypeDto?> GetByIdAsync(int id)
    {
        var type = await repository.GetByIdAsync(id);
        return type is null ? null : mapper.Map<LeaveTypeDto>(type);
    }

    public async Task<LeaveTypeDto> CreateAsync(CreateLeaveTypeDto dto)
    {
        var existing = await repository.GetByNameAsync(dto.Name);
        if (existing is not null)
            throw new InvalidOperationException($"A leave type with name '{dto.Name}' already exists.");

        var leaveType = mapper.Map<LeaveType>(dto);
        var created = await repository.CreateAsync(leaveType);
        return mapper.Map<LeaveTypeDto>(created);
    }

    public async Task<LeaveTypeDto?> UpdateAsync(int id, UpdateLeaveTypeDto dto)
    {
        var leaveType = await repository.GetByIdAsync(id);
        if (leaveType is null) return null;

        var nameOwner = await repository.GetByNameAsync(dto.Name);
        if (nameOwner is not null && nameOwner.Id != id)
            throw new InvalidOperationException($"Leave type name '{dto.Name}' is already in use.");

        mapper.Map(dto, leaveType);
        var updated = await repository.UpdateAsync(leaveType);
        return mapper.Map<LeaveTypeDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id) =>
        await repository.DeleteAsync(id);
}
