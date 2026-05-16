namespace HRLeaves.API.DTOs.LeaveType;

public class LeaveTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DefaultDays { get; set; }
    public bool IsAccrued { get; set; }
    public decimal AccrualRatePerMonth { get; set; }
    public string Description { get; set; } = string.Empty;
}
