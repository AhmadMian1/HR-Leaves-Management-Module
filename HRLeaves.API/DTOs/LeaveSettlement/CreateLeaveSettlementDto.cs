namespace HRLeaves.API.DTOs.LeaveSettlement;

public class CreateLeaveSettlementDto
{
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public decimal AdjustmentDays { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
