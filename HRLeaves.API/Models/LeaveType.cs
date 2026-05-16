namespace HRLeaves.API.Models;

public class LeaveType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DefaultDays { get; set; }
    public bool IsAccrued { get; set; }
    public decimal AccrualRatePerMonth { get; set; } = 0;
    public string Description { get; set; } = string.Empty;

    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
    public ICollection<LeaveSettlement> LeaveSettlements { get; set; } = new List<LeaveSettlement>();
}
