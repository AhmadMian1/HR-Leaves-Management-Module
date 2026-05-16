using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveSettlement;
using HRLeaves.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaves.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeaveSettlementsController(ILeaveSettlementService service) : ControllerBase
{
    /// <summary>Get paginated list of leave settlements</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<LeaveSettlementDto>>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? employeeId = null,
        [FromQuery] int? leaveTypeId = null)
    {
        var result = await service.GetPagedAsync(pageNumber, pageSize, employeeId, leaveTypeId);
        return Ok(ApiResponse<PagedResponse<LeaveSettlementDto>>.Ok(result));
    }

    /// <summary>Get leave settlements for a specific employee</summary>
    [HttpGet("employee/{employeeId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LeaveSettlementDto>>), 200)]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var result = await service.GetByEmployeeIdAsync(employeeId);
        return Ok(ApiResponse<IEnumerable<LeaveSettlementDto>>.Ok(result));
    }

    /// <summary>Get leave settlement by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<LeaveSettlementDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result is null)
            return NotFound(ApiResponse<LeaveSettlementDto>.Fail($"Settlement with ID {id} not found."));
        return Ok(ApiResponse<LeaveSettlementDto>.Ok(result));
    }

    /// <summary>Create a new leave settlement (manual adjustment)</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeaveSettlementDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateLeaveSettlementDto dto)
    {
        var result = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<LeaveSettlementDto>.Ok(result, "Leave settlement created and balance adjusted."));
    }

    /// <summary>Delete a leave settlement</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail($"Settlement with ID {id} not found."));
        return Ok(ApiResponse.Ok("Leave settlement deleted."));
    }
}
