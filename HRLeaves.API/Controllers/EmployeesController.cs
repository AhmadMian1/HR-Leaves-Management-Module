using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.Employee;
using HRLeaves.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaves.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EmployeesController(IEmployeeService service) : ControllerBase
{
    /// <summary>Get paginated list of employees</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<EmployeeDto>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters)
    {
        var result = await service.GetPagedAsync(parameters);
        return Ok(ApiResponse<PagedResponse<EmployeeDto>>.Ok(result));
    }

    /// <summary>Get all active employees (for dropdowns)</summary>
    [HttpGet("list")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<EmployeeDto>>), 200)]
    public async Task<IActionResult> GetList()
    {
        var result = await service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<EmployeeDto>>.Ok(result));
    }

    /// <summary>Get employee by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        if (result is null)
            return NotFound(ApiResponse<EmployeeDto>.Fail($"Employee with ID {id} not found."));
        return Ok(ApiResponse<EmployeeDto>.Ok(result));
    }

    /// <summary>Create a new employee</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        var result = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<EmployeeDto>.Ok(result, "Employee created successfully."));
    }

    /// <summary>Update an existing employee</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        var result = await service.UpdateAsync(id, dto);
        if (result is null)
            return NotFound(ApiResponse<EmployeeDto>.Fail($"Employee with ID {id} not found."));
        return Ok(ApiResponse<EmployeeDto>.Ok(result, "Employee updated successfully."));
    }

    /// <summary>Delete an employee</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await service.DeleteAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail($"Employee with ID {id} not found."));
        return Ok(ApiResponse.Ok("Employee deleted successfully."));
    }
}
