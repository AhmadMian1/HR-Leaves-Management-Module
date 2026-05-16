using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveRequest;
using HRLeaves.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaves.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeaveRequestsController(ILeaveRequestService service) : ControllerBase
{
    /// <summary>Get paginated leave requests with filters</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<LeaveRequestDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] LeaveRequestQueryParameters parameters)
    {
        var result = await service.GetPagedAsync(parameters);
        return Ok(ApiResponse<PagedResponse<LeaveRequestDto>>.Ok(result));
    }

    /// <summary>Get leave request by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<LeaveRequestDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result is null)
            return NotFound(ApiResponse<LeaveRequestDto>.Fail($"Leave request with ID {id} not found."));
        return Ok(ApiResponse<LeaveRequestDto>.Ok(result));
    }

    /// <summary>Submit a new leave request</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeaveRequestDto>), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Create([FromBody] CreateLeaveRequestDto dto)
    {
        var result = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<LeaveRequestDto>.Ok(result, "Leave request submitted successfully."));
    }

    /// <summary>Approve a leave request</summary>
    [HttpPatch("{id:int}/approve")]
    [ProducesResponseType(typeof(ApiResponse<LeaveRequestDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Approve(int id)
    {
        var result = await service.ApproveAsync(id);
        if (result is null)
            return NotFound(ApiResponse<LeaveRequestDto>.Fail($"Leave request with ID {id} not found."));
        return Ok(ApiResponse<LeaveRequestDto>.Ok(result, "Leave request approved successfully."));
    }

    /// <summary>Reject a leave request</summary>
    [HttpPatch("{id:int}/reject")]
    [ProducesResponseType(typeof(ApiResponse<LeaveRequestDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Reject(int id, [FromBody] ApproveRejectDto dto)
    {
        var result = await service.RejectAsync(id, dto);
        if (result is null)
            return NotFound(ApiResponse<LeaveRequestDto>.Fail($"Leave request with ID {id} not found."));
        return Ok(ApiResponse<LeaveRequestDto>.Ok(result, "Leave request rejected."));
    }

    /// <summary>Cancel a leave request</summary>
    [HttpPatch("{id:int}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<LeaveRequestDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Cancel(int id)
    {
        var result = await service.CancelAsync(id);
        if (result is null)
            return NotFound(ApiResponse<LeaveRequestDto>.Fail($"Leave request with ID {id} not found."));
        return Ok(ApiResponse<LeaveRequestDto>.Ok(result, "Leave request cancelled."));
    }

    /// <summary>Bulk approve multiple leave requests</summary>
    [HttpPost("bulk-approve")]
    [ProducesResponseType(typeof(ApiResponse<List<LeaveRequestDto>>), 200)]
    public async Task<IActionResult> BulkApprove([FromBody] BulkApproveRejectDto dto)
    {
        var result = await service.BulkApproveAsync(dto);
        return Ok(ApiResponse<List<LeaveRequestDto>>.Ok(result, $"{result.Count} leave request(s) approved."));
    }

    /// <summary>Bulk reject multiple leave requests</summary>
    [HttpPost("bulk-reject")]
    [ProducesResponseType(typeof(ApiResponse<List<LeaveRequestDto>>), 200)]
    public async Task<IActionResult> BulkReject([FromBody] BulkApproveRejectDto dto)
    {
        var result = await service.BulkRejectAsync(dto);
        return Ok(ApiResponse<List<LeaveRequestDto>>.Ok(result, $"{result.Count} leave request(s) rejected."));
    }

    /// <summary>Export leave requests to CSV</summary>
    [HttpGet("export/csv")]
    [Produces("text/csv")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> ExportCsv([FromQuery] LeaveRequestQueryParameters parameters)
    {
        var csvBytes = await service.ExportToCsvAsync(parameters);
        var fileName = $"leave-requests-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
        return File(csvBytes, "text/csv", fileName);
    }
}
