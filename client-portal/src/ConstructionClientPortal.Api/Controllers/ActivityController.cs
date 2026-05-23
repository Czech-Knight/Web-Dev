using ConstructionClientPortal.Api.Data;
using ConstructionClientPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ConstructionClientPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ActivityController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly ProjectAccessService _access;

    public ActivityController(MongoDbContext db, ProjectAccessService access)
    {
        _db = db;
        _access = access;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string projectId, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, projectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var logs = await _db.ActivityLogs.Find(l => l.ProjectId == projectId).SortByDescending(l => l.CreatedAtUtc).Limit(20).ToListAsync(cancellationToken);
        return Ok(logs.Select(l => new
        {
            id = l.Id,
            l.ProjectId,
            l.ActorName,
            l.Action,
            l.CreatedAtUtc
        }));
    }
}
