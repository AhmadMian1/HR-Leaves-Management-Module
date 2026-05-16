using HRLeaves.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HRLeaves.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.LeaveTypes.AnyAsync())
        {
            var leaveTypes = new List<LeaveType>
            {
                new() { Name = "Annual Leave", DefaultDays = 15, IsAccrued = false, Description = "Yearly paid leave entitlement" },
                new() { Name = "Sick Leave", DefaultDays = 10, IsAccrued = false, Description = "Leave for medical illness or injury" },
                new() { Name = "Vacation", DefaultDays = 15, IsAccrued = true, AccrualRatePerMonth = 1.25m, Description = "Accrued at 1.25 days per month after hire date" },
                new() { Name = "Unpaid Leave", DefaultDays = 0, IsAccrued = false, Description = "Leave without pay" },
                new() { Name = "Maternity Leave", DefaultDays = 90, IsAccrued = false, Description = "Leave for maternity" },
                new() { Name = "Paternity Leave", DefaultDays = 5, IsAccrued = false, Description = "Leave for paternity" }
            };

            await context.LeaveTypes.AddRangeAsync(leaveTypes);
            await context.SaveChangesAsync();
        }

        if (!await context.Employees.AnyAsync())
        {
            var employees = new List<Employee>
            {
                new() { FullName = "Alice Johnson", Email = "alice.johnson@company.com", HireDate = new DateTime(2020, 3, 15), Department = "Engineering", IsActive = true },
                new() { FullName = "Bob Smith", Email = "bob.smith@company.com", HireDate = new DateTime(2019, 7, 1), Department = "Human Resources", IsActive = true },
                new() { FullName = "Carol White", Email = "carol.white@company.com", HireDate = new DateTime(2021, 1, 10), Department = "Finance", IsActive = true },
                new() { FullName = "David Brown", Email = "david.brown@company.com", HireDate = new DateTime(2022, 5, 20), Department = "Marketing", IsActive = true },
                new() { FullName = "Eva Davis", Email = "eva.davis@company.com", HireDate = new DateTime(2018, 11, 5), Department = "Engineering", IsActive = true }
            };

            await context.Employees.AddRangeAsync(employees);
            await context.SaveChangesAsync();

            var leaveTypes = await context.LeaveTypes.ToListAsync();

            var balances = new List<LeaveBalance>();
            foreach (var emp in employees)
            {
                foreach (var lt in leaveTypes)
                {
                    decimal total = lt.IsAccrued
                        ? CalculateAccrued(emp.HireDate, lt.AccrualRatePerMonth)
                        : lt.DefaultDays;

                    balances.Add(new LeaveBalance
                    {
                        EmployeeId = emp.Id,
                        LeaveTypeId = lt.Id,
                        TotalDays = total,
                        UsedDays = 0
                    });
                }
            }

            await context.LeaveBalances.AddRangeAsync(balances);
            await context.SaveChangesAsync();
        }
    }

    private static decimal CalculateAccrued(DateTime hireDate, decimal ratePerMonth)
    {
        var now = DateTime.UtcNow;
        var months = ((now.Year - hireDate.Year) * 12) + now.Month - hireDate.Month;
        return Math.Max(0, months * ratePerMonth);
    }
}
