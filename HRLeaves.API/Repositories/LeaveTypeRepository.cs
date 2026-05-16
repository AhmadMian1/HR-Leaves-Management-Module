using HRLeaves.API.Data;
using HRLeaves.API.Models;
using HRLeaves.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRLeaves.API.Repositories;

public class LeaveTypeRepository(AppDbContext context) : BaseRepository<LeaveType>(context), ILeaveTypeRepository
{
    public async Task<LeaveType?> GetByNameAsync(string name) =>
        await _dbSet.FirstOrDefaultAsync(lt => lt.Name.ToLower() == name.ToLower());

    public async Task<IEnumerable<LeaveType>> GetAccruedTypesAsync() =>
        await _dbSet.Where(lt => lt.IsAccrued).ToListAsync();
}
