using AutoMapper;
using HRLeaves.API.DTOs.LeaveBalance;
using HRLeaves.API.Helpers;
using HRLeaves.API.Repositories.Interfaces;
using HRLeaves.API.Services.Interfaces;

namespace HRLeaves.API.Services;

public class LeaveBalanceService(
    ILeaveBalanceRepository balanceRepo,
    IEmployeeRepository employeeRepo,
    ILeaveTypeRepository leaveTypeRepo,
    IMapper mapper) : ILeaveBalanceService
{
    public async Task<IEnumerable<LeaveBalanceDto>> GetAllAsync()
    {
        var balances = await balanceRepo.GetAllAsync();
        return mapper.Map<IEnumerable<LeaveBalanceDto>>(balances);
    }

    public async Task<IEnumerable<LeaveBalanceDto>> GetByEmployeeIdAsync(int employeeId)
    {
        var balances = await balanceRepo.GetByEmployeeIdAsync(employeeId);
        return mapper.Map<IEnumerable<LeaveBalanceDto>>(balances);
    }

    public async Task RecalculateAccruedAsync(int employeeId)
    {
        var employee = await employeeRepo.GetByIdAsync(employeeId)
            ?? throw new KeyNotFoundException($"Employee with ID {employeeId} not found.");

        var accruedTypes = await leaveTypeRepo.GetAccruedTypesAsync();

        foreach (var lt in accruedTypes)
        {
            var balance = await balanceRepo.GetByEmployeeAndTypeAsync(employeeId, lt.Id);
            var accrued = LeaveCalculator.CalculateAccruedDays(employee.HireDate, lt.AccrualRatePerMonth);

            if (balance is null)
            {
                await balanceRepo.CreateAsync(new Models.LeaveBalance
                {
                    EmployeeId = employeeId,
                    LeaveTypeId = lt.Id,
                    TotalDays = accrued,
                    UsedDays = 0
                });
            }
            else
            {
                balance.TotalDays = accrued;
                await balanceRepo.UpdateAsync(balance);
            }
        }
    }

    public async Task RecalculateAllAccruedAsync()
    {
        var employees = await employeeRepo.GetActiveEmployeesAsync();
        foreach (var emp in employees)
            await RecalculateAccruedAsync(emp.Id);
    }
}
