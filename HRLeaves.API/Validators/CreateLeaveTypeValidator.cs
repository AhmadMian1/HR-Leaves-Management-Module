using FluentValidation;
using HRLeaves.API.DTOs.LeaveType;

namespace HRLeaves.API.Validators;

public class CreateLeaveTypeValidator : AbstractValidator<CreateLeaveTypeDto>
{
    public CreateLeaveTypeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Leave type name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.DefaultDays)
            .GreaterThanOrEqualTo(0).WithMessage("Default days must be 0 or more.");

        RuleFor(x => x.AccrualRatePerMonth)
            .GreaterThanOrEqualTo(0).WithMessage("Accrual rate must be 0 or more.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}

public class UpdateLeaveTypeValidator : AbstractValidator<UpdateLeaveTypeDto>
{
    public UpdateLeaveTypeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Leave type name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.DefaultDays)
            .GreaterThanOrEqualTo(0).WithMessage("Default days must be 0 or more.");

        RuleFor(x => x.AccrualRatePerMonth)
            .GreaterThanOrEqualTo(0).WithMessage("Accrual rate must be 0 or more.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
