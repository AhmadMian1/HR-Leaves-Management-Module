using FluentValidation;
using HRLeaves.API.DTOs.LeaveRequest;

namespace HRLeaves.API.Validators;

public class CreateLeaveRequestValidator : AbstractValidator<CreateLeaveRequestDto>
{
    public CreateLeaveRequestValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("A valid employee must be selected.");

        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("A valid leave type must be selected.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End date must be on or after the start date.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .MaximumLength(1000).WithMessage("Reason must not exceed 1000 characters.");
    }
}

public class CreateLeaveSettlementValidator : AbstractValidator<CreateLeaveSettlementDto>
{
    public CreateLeaveSettlementValidator()
    {
        RuleFor(x => x.EmployeeId).GreaterThan(0).WithMessage("A valid employee must be selected.");
        RuleFor(x => x.LeaveTypeId).GreaterThan(0).WithMessage("A valid leave type must be selected.");
        RuleFor(x => x.Remarks).NotEmpty().WithMessage("Remarks are required.").MaximumLength(500);
    }
}
