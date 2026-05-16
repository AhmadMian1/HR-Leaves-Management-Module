using HRLeaves.API.Models;

namespace HRLeaves.API.Repositories.Interfaces;

public interface ILeaveTypeRepository : IBaseRepository<LeaveType>
{
    Task<LeaveType?> GetByNameAsync(string name);
    Task<IEnumerable<LeaveType>> GetAccruedTypesAsync();
}
