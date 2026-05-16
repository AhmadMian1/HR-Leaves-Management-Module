using AutoMapper;
using HRLeaves.API.DTOs.Common;
using HRLeaves.API.DTOs.Employee;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using HRLeaves.API.Services.Interfaces;

namespace HRLeaves.API.Services;

public class EmployeeService(IEmployeeRepository repository, IMapper mapper) : IEmployeeService
{
    public async Task<PagedResponse<EmployeeDto>> GetPagedAsync(QueryParameters parameters)
    {
        var (employees, totalCount) = await repository.GetPagedAsync(
            parameters.PageNumber, parameters.PageSize,
            parameters.SearchTerm, parameters.SortBy, parameters.SortDescending);

        return PagedResponse<EmployeeDto>.Create(
            mapper.Map<List<EmployeeDto>>(employees),
            totalCount, parameters.PageNumber, parameters.PageSize);
    }

    public async Task<IEnumerable<EmployeeDto>> GetAllAsync()
    {
        var employees = await repository.GetAllAsync();
        return mapper.Map<IEnumerable<EmployeeDto>>(employees);
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await repository.GetByIdAsync(id);
        return employee is null ? null : mapper.Map<EmployeeDto>(employee);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        var existing = await repository.GetByEmailAsync(dto.Email);
        if (existing is not null)
            throw new InvalidOperationException($"An employee with email '{dto.Email}' already exists.");

        var employee = mapper.Map<Employee>(dto);
        var created = await repository.CreateAsync(employee);
        return mapper.Map<EmployeeDto>(created);
    }

    public async Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await repository.GetByIdAsync(id);
        if (employee is null) return null;

        var emailOwner = await repository.GetByEmailAsync(dto.Email);
        if (emailOwner is not null && emailOwner.Id != id)
            throw new InvalidOperationException($"Email '{dto.Email}' is already in use by another employee.");

        mapper.Map(dto, employee);
        var updated = await repository.UpdateAsync(employee);
        return mapper.Map<EmployeeDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id) =>
        await repository.DeleteAsync(id);
}
