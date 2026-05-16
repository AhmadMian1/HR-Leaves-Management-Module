namespace HRLeaves.API.DTOs.Employee;

public class UpdateEmployeeDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string Department { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
