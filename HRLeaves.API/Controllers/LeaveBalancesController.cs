using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.LeaveBalance;
using HRLeaves.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaves.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeaveBalancesController(ILeaveBalanceService service) : ControllerBase
{
    /// <summary>Get all leave balances</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LeaveBalanceDto>>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var result = await service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<LeaveBalanceDto>>.Ok(result));
    }

    /// <summary>Get leave balances for a specific employee</summary>
    [HttpGet("employee/{employeeId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LeaveBalanceDto>>), 200)]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var result = await service.GetByEmployeeIdAsync(employeeId);
        return Ok(ApiResponse<IEnumerable<LeaveBalanceDto>>.Ok(result));
    }

    /// <summary>Recalculate accrued leave for a specific employee</summary>
    [HttpPost("recalculate/{employeeId:int}")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RecalculateEmployee(int employeeId)
    {
        await service.RecalculateAccruedAsync(employeeId);
        return Ok(ApiResponse.Ok("Accrued leave recalculated successfully."));
    }

    /// <summary>Recalculate accrued leave for all active employees</summary>
    [HttpPost("recalculate-all")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public async Task<IActionResult> RecalculateAll()
    {
        await service.RecalculateAllAccruedAsync();
        return Ok(ApiResponse.Ok("Accrued leave recalculated for all active employees."));
    }
}
