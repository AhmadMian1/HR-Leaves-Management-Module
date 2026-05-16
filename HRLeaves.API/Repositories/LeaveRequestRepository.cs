using HRLeaves.API.Data;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRLeaves.API.Repositories;

public class LeaveRequestRepository(AppDbContext context) : BaseRepository<LeaveRequest>(context), ILeaveRequestRepository
{
    public override async Task<LeaveRequest?> GetByIdAsync(int id) =>
        await _dbSet
            .Include(lr => lr.Employee)
            .Include(lr => lr.LeaveType)
            .FirstOrDefaultAsync(lr => lr.Id == id);

    public async Task<IEnumerable<LeaveRequest>> GetByEmployeeIdAsync(int employeeId) =>
        await _dbSet
            .Include(lr => lr.LeaveType)
            .Where(lr => lr.EmployeeId == employeeId)
            .OrderByDescending(lr => lr.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<LeaveRequest>> GetApprovedOverlappingAsync(
        int employeeId, DateTime start, DateTime end, int? excludeId = null)
    {
        var query = _dbSet.Where(lr =>
            lr.EmployeeId == employeeId &&
            lr.Status == LeaveStatus.Approved &&
            lr.StartDate <= end &&
            lr.EndDate >= start);

        if (excludeId.HasValue)
            query = query.Where(lr => lr.Id != excludeId.Value);

        return await query.ToListAsync();
    }

    public async Task<(IEnumerable<LeaveRequest> requests, int totalCount)> GetPagedAsync(
        int pageNumber, int pageSize,
        int? employeeId, int? leaveTypeId, string? status,
        DateTime? startDateFrom, DateTime? startDateTo,
        string? sortBy, bool sortDescending)
    {
        var query = BuildFilteredQuery(employeeId, leaveTypeId, status, startDateFrom, startDateTo);

        query = sortBy?.ToLower() switch
        {
            "startdate" => sortDescending ? query.OrderByDescending(lr => lr.StartDate) : query.OrderBy(lr => lr.StartDate),
            "enddate" => sortDescending ? query.OrderByDescending(lr => lr.EndDate) : query.OrderBy(lr => lr.EndDate),
            "status" => sortDescending ? query.OrderByDescending(lr => lr.Status) : query.OrderBy(lr => lr.Status),
            "employeename" => sortDescending ? query.OrderByDescending(lr => lr.Employee.FullName) : query.OrderBy(lr => lr.Employee.FullName),
            _ => sortDescending ? query.OrderByDescending(lr => lr.CreatedAt) : query.OrderBy(lr => lr.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var requests = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        return (requests, totalCount);
    }

    public async Task<IEnumerable<LeaveRequest>> GetAllWithDetailsAsync(
        int? employeeId, int? leaveTypeId, string? status,
        DateTime? startDateFrom, DateTime? startDateTo) =>
        await BuildFilteredQuery(employeeId, leaveTypeId, status, startDateFrom, startDateTo)
            .OrderByDescending(lr => lr.CreatedAt)
            .ToListAsync();

    private IQueryable<LeaveRequest> BuildFilteredQuery(
        int? employeeId, int? leaveTypeId, string? status,
        DateTime? startDateFrom, DateTime? startDateTo)
    {
        var query = _dbSet
            .Include(lr => lr.Employee)
            .Include(lr => lr.LeaveType)
            .AsQueryable();

        if (employeeId.HasValue)
            query = query.Where(lr => lr.EmployeeId == employeeId.Value);

        if (leaveTypeId.HasValue)
            query = query.Where(lr => lr.LeaveTypeId == leaveTypeId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<LeaveStatus>(status, true, out var parsedStatus))
            query = query.Where(lr => lr.Status == parsedStatus);

        if (startDateFrom.HasValue)
            query = query.Where(lr => lr.StartDate >= startDateFrom.Value);

        if (startDateTo.HasValue)
            query = query.Where(lr => lr.StartDate <= startDateTo.Value);

        return query;
    }
}
