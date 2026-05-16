using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveType;
using HRLeaves.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaves.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeaveTypesController(ILeaveTypeService service) : ControllerBase
{
    /// <summary>Get all leave types</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LeaveTypeDto>>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var result = await service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<LeaveTypeDto>>.Ok(result));
    }

    /// <summary>Get leave type by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<LeaveTypeDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result is null)
            return NotFound(ApiResponse<LeaveTypeDto>.Fail($"Leave type with ID {id} not found."));
        return Ok(ApiResponse<LeaveTypeDto>.Ok(result));
    }

    /// <summary>Create a new leave type</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeaveTypeDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateLeaveTypeDto dto)
    {
        var result = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<LeaveTypeDto>.Ok(result, "Leave type created successfully."));
    }

    /// <summary>Update an existing leave type</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<LeaveTypeDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLeaveTypeDto dto)
    {
        var result = await service.UpdateAsync(id, dto);
        if (result is null)
            return NotFound(ApiResponse<LeaveTypeDto>.Fail($"Leave type with ID {id} not found."));
        return Ok(ApiResponse<LeaveTypeDto>.Ok(result, "Leave type updated successfully."));
    }

    /// <summary>Delete a leave type</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail($"Leave type with ID {id} not found."));
        return Ok(ApiResponse.Ok("Leave type deleted successfully."));
    }
}
