using System.Security.Claims;
using ConstructionClientPortal.Api.Data;
using ConstructionClientPortal.Api.Models;
using MongoDB.Driver;

namespace ConstructionClientPortal.Api.Services;

public sealed class ProjectAccessService
{
    private readonly MongoDbContext _db;

    public ProjectAccessService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<Project?> GetAccessibleProjectAsync(ClaimsPrincipal user, string projectId, CancellationToken cancellationToken)
    {
        var project = await _db.Projects.Find(p => p.Id == projectId).FirstOrDefaultAsync(cancellationToken);
        if (project is null)
        {
            return null;
        }

        if (user.IsAdmin())
        {
            return project;
        }

        var userId = user.UserId();
        return userId is not null && project.ClientUserIds.Contains(userId) ? project : null;
    }
}
