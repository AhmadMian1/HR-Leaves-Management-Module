namespace HRLeaves.API.DTOs.Employee;

public class CreateEmployeeDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string Department { get; set; } = string.Empty;
}
