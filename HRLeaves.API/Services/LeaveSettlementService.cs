using AutoMapper;
using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveSettlement;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using HRLeaves.API.Services.Interfaces;

namespace HRLeaves.API.Services;

public class LeaveSettlementService(
    ILeaveSettlementRepository settlementRepo,
    ILeaveBalanceRepository balanceRepo,
    IEmployeeRepository employeeRepo,
    ILeaveTypeRepository leaveTypeRepo,
    IMapper mapper) : ILeaveSettlementService
{
    public async Task<PagedResponse<LeaveSettlementDto>> GetPagedAsync(
        int pageNumber, int pageSize, int? employeeId, int? leaveTypeId)
    {
        var (settlements, totalCount) = await settlementRepo.GetPagedAsync(
            pageNumber, pageSize, employeeId, leaveTypeId);

        return PagedResponse<LeaveSettlementDto>.Create(
            mapper.Map<List<LeaveSettlementDto>>(settlements),
            totalCount, pageNumber, pageSize);
    }

    public async Task<IEnumerable<LeaveSettlementDto>> GetByEmployeeIdAsync(int employeeId)
    {
        var settlements = await settlementRepo.GetByEmployeeIdAsync(employeeId);
        return mapper.Map<IEnumerable<LeaveSettlementDto>>(settlements);
    }

    public async Task<LeaveSettlementDto?> GetByIdAsync(int id)
    {
        var settlement = await settlementRepo.GetByIdAsync(id);
        return settlement is null ? null : mapper.Map<LeaveSettlementDto>(settlement);
    }

    public async Task<LeaveSettlementDto> CreateAsync(CreateLeaveSettlementDto dto)
    {
        var employee = await employeeRepo.GetByIdAsync(dto.EmployeeId)
            ?? throw new KeyNotFoundException($"Employee with ID {dto.EmployeeId} not found.");

        var leaveType = await leaveTypeRepo.GetByIdAsync(dto.LeaveTypeId)
            ?? throw new KeyNotFoundException($"Leave type with ID {dto.LeaveTypeId} not found.");

        var settlement = mapper.Map<LeaveSettlement>(dto);
        settlement.CreatedAt = DateTime.UtcNow;

        var created = await settlementRepo.CreateAsync(settlement);

        // Apply adjustment to balance
        var balance = await balanceRepo.GetByEmployeeAndTypeAsync(dto.EmployeeId, dto.LeaveTypeId);
        if (balance is null)
        {
            await balanceRepo.CreateAsync(new LeaveBalance
            {
                EmployeeId = dto.EmployeeId,
                LeaveTypeId = dto.LeaveTypeId,
                TotalDays = Math.Max(0, dto.AdjustmentDays),
                UsedDays = 0
            });
        }
        else
        {
            balance.TotalDays = Math.Max(0, balance.TotalDays + dto.AdjustmentDays);
            await balanceRepo.UpdateAsync(balance);
        }

        // Reload with navigation properties
        created.Employee = employee;
        created.LeaveType = leaveType;

        return mapper.Map<LeaveSettlementDto>(created);
    }

    public async Task<bool> DeleteAsync(int id) =>
        await settlementRepo.DeleteAsync(id);
}
