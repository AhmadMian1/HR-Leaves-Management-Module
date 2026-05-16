namespace HRLeaves.API.DTOs.LeaveRequest;

public class ApproveRejectDto
{
    public string? RejectionComment { get; set; }
}

public class BulkApproveRejectDto
{
    public List<int> LeaveRequestIds { get; set; } = new();
    public string? RejectionComment { get; set; }
}
