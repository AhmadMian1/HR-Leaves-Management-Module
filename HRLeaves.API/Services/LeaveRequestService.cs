using AutoMapper;
using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveRequest;
using HRLeaves.API.Helpers;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using HRLeaves.API.Services.Interfaces;

namespace HRLeaves.API.Services;

public class LeaveRequestService(
    ILeaveRequestRepository leaveRequestRepo,
    ILeaveBalanceRepository leaveBalanceRepo,
    IEmployeeRepository employeeRepo,
    ILeaveTypeRepository leaveTypeRepo,
    IMapper mapper) : ILeaveRequestService
{
    public async Task<PagedResponse<LeaveRequestDto>> GetPagedAsync(LeaveRequestQueryParameters parameters)
    {
        var (requests, totalCount) = await leaveRequestRepo.GetPagedAsync(
            parameters.PageNumber, parameters.PageSize,
            parameters.EmployeeId, parameters.LeaveTypeId, parameters.Status,
            parameters.StartDateFrom, parameters.StartDateTo,
            parameters.SortBy, parameters.SortDescending);

        return PagedResponse<LeaveRequestDto>.Create(
            mapper.Map<List<LeaveRequestDto>>(requests),
            totalCount, parameters.PageNumber, parameters.PageSize);
    }

    public async Task<LeaveRequestDto?> GetByIdAsync(int id)
    {
        var request = await leaveRequestRepo.GetByIdAsync(id);
        return request is null ? null : mapper.Map<LeaveRequestDto>(request);
    }

    public async Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto)
    {
        if (dto.StartDate > dto.EndDate)
            throw new ArgumentException("Start date must be before or equal to end date.");

        if (dto.StartDate.Date < DateTime.UtcNow.Date)
            throw new ArgumentException("Start date cannot be in the past.");

        var employee = await employeeRepo.GetByIdAsync(dto.EmployeeId)
            ?? throw new KeyNotFoundException($"Employee with ID {dto.EmployeeId} not found.");

        var leaveType = await leaveTypeRepo.GetByIdAsync(dto.LeaveTypeId)
            ?? throw new KeyNotFoundException($"Leave type with ID {dto.LeaveTypeId} not found.");

        var overlapping = await leaveRequestRepo.GetApprovedOverlappingAsync(
            dto.EmployeeId, dto.StartDate, dto.EndDate);

        if (overlapping.Any())
            throw new InvalidOperationException("You have an overlapping approved leave request for this period.");

        var daysRequested = LeaveCalculator.CalculateBusinessDays(dto.StartDate, dto.EndDate);

        var balance = await leaveBalanceRepo.GetByEmployeeAndTypeAsync(dto.EmployeeId, dto.LeaveTypeId);
        if (balance is not null && balance.RemainingDays < daysRequested)
            throw new InvalidOperationException($"Insufficient leave balance. Available: {balance.RemainingDays} days, Requested: {daysRequested} days.");

        var request = mapper.Map<LeaveRequest>(dto);
        request.DaysRequested = daysRequested;
        request.Status = LeaveStatus.Pending;
        request.CreatedAt = DateTime.UtcNow;

        var created = await leaveRequestRepo.CreateAsync(request);

        // Reload with navigation properties
        var loaded = await leaveRequestRepo.GetByIdAsync(created.Id);
        return mapper.Map<LeaveRequestDto>(loaded!);
    }

    public async Task<LeaveRequestDto?> ApproveAsync(int id)
    {
        var request = await leaveRequestRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Leave request with ID {id} not found.");

        if (request.Status != LeaveStatus.Pending)
            throw new InvalidOperationException($"Cannot approve a request with status '{request.Status}'.");

        var balance = await leaveBalanceRepo.GetByEmployeeAndTypeAsync(request.EmployeeId, request.LeaveTypeId);
        if (balance is null)
            throw new InvalidOperationException("Leave balance record not found for this employee and leave type.");

        if (balance.RemainingDays < request.DaysRequested)
            throw new InvalidOperationException($"Insufficient balance. Available: {balance.RemainingDays}, Required: {request.DaysRequested}.");

        balance.UsedDays += request.DaysRequested;
        await leaveBalanceRepo.UpdateAsync(balance);

        request.Status = LeaveStatus.Approved;
        request.RejectionComment = null;
        await leaveRequestRepo.UpdateAsync(request);

        return mapper.Map<LeaveRequestDto>(request);
    }

    public async Task<LeaveRequestDto?> RejectAsync(int id, ApproveRejectDto dto)
    {
        var request = await leaveRequestRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Leave request with ID {id} not found.");

        if (request.Status == LeaveStatus.Cancelled)
            throw new InvalidOperationException("Cannot reject a cancelled request.");

        // Rollback balance if previously approved
        if (request.Status == LeaveStatus.Approved)
            await RollbackBalance(request);

        request.Status = LeaveStatus.Rejected;
        request.RejectionComment = dto.RejectionComment;
        await leaveRequestRepo.UpdateAsync(request);

        return mapper.Map<LeaveRequestDto>(request);
    }

    public async Task<LeaveRequestDto?> CancelAsync(int id)
    {
        var request = await leaveRequestRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Leave request with ID {id} not found.");

        if (request.Status == LeaveStatus.Cancelled)
            throw new InvalidOperationException("Request is already cancelled.");

        if (request.Status == LeaveStatus.Approved)
            await RollbackBalance(request);

        request.Status = LeaveStatus.Cancelled;
        await leaveRequestRepo.UpdateAsync(request);

        return mapper.Map<LeaveRequestDto>(request);
    }

    public async Task<List<LeaveRequestDto>> BulkApproveAsync(BulkApproveRejectDto dto)
    {
        var results = new List<LeaveRequestDto>();
        foreach (var requestId in dto.LeaveRequestIds)
        {
            try
            {
                var result = await ApproveAsync(requestId);
                if (result is not null) results.Add(result);
            }
            catch
            {
                // Continue processing remaining requests
            }
        }
        return results;
    }

    public async Task<List<LeaveRequestDto>> BulkRejectAsync(BulkApproveRejectDto dto)
    {
        var results = new List<LeaveRequestDto>();
        foreach (var requestId in dto.LeaveRequestIds)
        {
            try
            {
                var result = await RejectAsync(requestId, new ApproveRejectDto { RejectionComment = dto.RejectionComment });
                if (result is not null) results.Add(result);
            }
            catch
            {
                // Continue processing remaining requests
            }
        }
        return results;
    }

    public async Task<byte[]> ExportToCsvAsync(LeaveRequestQueryParameters parameters)
    {
        var requests = await leaveRequestRepo.GetAllWithDetailsAsync(
            parameters.EmployeeId, parameters.LeaveTypeId, parameters.Status,
            parameters.StartDateFrom, parameters.StartDateTo);

        var dtos = mapper.Map<IEnumerable<LeaveRequestDto>>(requests);
        return CsvExporter.ExportLeaveRequests(dtos);
    }

    private async Task RollbackBalance(LeaveRequest request)
    {
        var balance = await leaveBalanceRepo.GetByEmployeeAndTypeAsync(request.EmployeeId, request.LeaveTypeId);
        if (balance is not null)
        {
            balance.UsedDays = Math.Max(0, balance.UsedDays - request.DaysRequested);
            await leaveBalanceRepo.UpdateAsync(balance);
        }
    }
}
