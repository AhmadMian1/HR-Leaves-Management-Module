using AutoMapper;
using HRLeaves.API.DTOs.Employee;
using HRLeaves.API.DTOs.LeaveBalance;
using HRLeaves.API.DTOs.LeaveRequest;
using HRLeaves.API.DTOs.LeaveSettlement;
using HRLeaves.API.DTOs.LeaveType;
using HRLeaves.API.Models;

namespace HRLeaves.API.Mappings;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // Employee
        CreateMap<Employee, EmployeeDto>();
        CreateMap<CreateEmployeeDto, Employee>();
        CreateMap<UpdateEmployeeDto, Employee>();

        // LeaveType
        CreateMap<LeaveType, LeaveTypeDto>();
        CreateMap<CreateLeaveTypeDto, LeaveType>();
        CreateMap<UpdateLeaveTypeDto, LeaveType>();

        // LeaveBalance
        CreateMap<LeaveBalance, LeaveBalanceDto>()
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee.FullName))
            .ForMember(d => d.LeaveTypeName, o => o.MapFrom(s => s.LeaveType.Name))
            .ForMember(d => d.RemainingDays, o => o.MapFrom(s => s.RemainingDays));

        // LeaveRequest
        CreateMap<LeaveRequest, LeaveRequestDto>()
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee.FullName))
            .ForMember(d => d.LeaveTypeName, o => o.MapFrom(s => s.LeaveType.Name))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<CreateLeaveRequestDto, LeaveRequest>();

        // LeaveSettlement
        CreateMap<LeaveSettlement, LeaveSettlementDto>()
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s => s.Employee.FullName))
            .ForMember(d => d.LeaveTypeName, o => o.MapFrom(s => s.LeaveType.Name));
        CreateMap<CreateLeaveSettlementDto, LeaveSettlement>();
    }
}
