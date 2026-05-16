namespace HRLeaves.API.Helpers;

public static class LeaveCalculator
{
    public static decimal CalculateBusinessDays(DateTime startDate, DateTime endDate)
    {
        if (startDate > endDate) return 0;

        decimal count = 0;
        var current = startDate.Date;
        var end = endDate.Date;

        while (current <= end)
        {
            if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
                count++;
            current = current.AddDays(1);
        }

        return count;
    }

    public static decimal CalculateAccruedDays(DateTime hireDate, decimal ratePerMonth)
    {
        var now = DateTime.UtcNow;
        if (now < hireDate) return 0;

        var months = ((now.Year - hireDate.Year) * 12) + now.Month - hireDate.Month;
        return Math.Round(Math.Max(0, months * ratePerMonth), 2);
    }
}
