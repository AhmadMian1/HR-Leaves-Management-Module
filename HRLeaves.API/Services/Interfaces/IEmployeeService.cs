using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.Employee;

namespace HRLeaves.API.Services.Interfaces;

public interface IEmployeeService
{
    Task<PagedResponse<EmployeeDto>> GetPagedAsync(QueryParameters parameters);
    Task<IEnumerable<EmployeeDto>> GetAllAsync();
    Task<EmployeeDto?> GetByIdAsync(int id);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);
    Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto);
    Task<bool> DeleteAsync(int id);
}
