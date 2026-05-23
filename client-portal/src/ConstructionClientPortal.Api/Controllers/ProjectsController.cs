using ConstructionClientPortal.Api.Data;
using ConstructionClientPortal.Api.Dtos;
using ConstructionClientPortal.Api.Models;
using ConstructionClientPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ConstructionClientPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ProjectsController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly ProjectAccessService _access;

    public ProjectsController(MongoDbContext db, ProjectAccessService access)
    {
        _db = db;
        _access = access;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectResponse>>> List(CancellationToken cancellationToken)
    {
        List<Project> projects;
        if (User.IsAdmin())
        {
            projects = await _db.Projects.Find(_ => true).SortByDescending(p => p.UpdatedAtUtc).ToListAsync(cancellationToken);
        }
        else
        {
            var userId = User.UserId();
            projects = await _db.Projects.Find(p => p.ClientUserIds.Contains(userId!)).SortByDescending(p => p.UpdatedAtUtc).ToListAsync(cancellationToken);
        }

        return Ok(projects.Select(ToResponse).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectResponse>> Get(string id, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, id, cancellationToken);
        return project is null ? NotFound() : Ok(ToResponse(project));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ProjectResponse>> Create(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var validation = ValidateProjectRequest(request.Name, request.ProgressPercent, request.Status);
        if (validation is not null)
        {
            return BadRequest(new { message = validation });
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            ClientName = request.ClientName.Trim(),
            Location = request.Location.Trim(),
            Status = Enum.Parse<ProjectStatus>(request.Status, true),
            ProgressPercent = request.ProgressPercent,
            BudgetSummary = request.BudgetSummary.Trim(),
            BimPackageReference = request.BimPackageReference.Trim(),
            SafetySummary = request.SafetySummary.Trim(),
            Description = request.Description.Trim(),
            ClientUserIds = request.ClientUserIds.Distinct().ToList(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _db.Projects.InsertOneAsync(project, cancellationToken: cancellationToken);
        await Log(project.Id!, "created project", cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = project.Id }, ToResponse(project));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ProjectResponse>> Update(string id, UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var validation = ValidateProjectRequest(request.Name, request.ProgressPercent, request.Status);
        if (validation is not null)
        {
            return BadRequest(new { message = validation });
        }

        var project = await _db.Projects.Find(p => p.Id == id).FirstOrDefaultAsync(cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        project.Name = request.Name.Trim();
        project.ClientName = request.ClientName.Trim();
        project.Location = request.Location.Trim();
        project.Status = Enum.Parse<ProjectStatus>(request.Status, true);
        project.ProgressPercent = request.ProgressPercent;
        project.BudgetSummary = request.BudgetSummary.Trim();
        project.BimPackageReference = request.BimPackageReference.Trim();
        project.SafetySummary = request.SafetySummary.Trim();
        project.Description = request.Description.Trim();
        project.ClientUserIds = request.ClientUserIds.Distinct().ToList();
        project.UpdatedAtUtc = DateTime.UtcNow;

        await _db.Projects.ReplaceOneAsync(p => p.Id == id, project, cancellationToken: cancellationToken);
        await Log(project.Id!, "updated project", cancellationToken);
        return Ok(ToResponse(project));
    }

    private async Task Log(string projectId, string action, CancellationToken cancellationToken)
    {
        await _db.ActivityLogs.InsertOneAsync(new ActivityLog
        {
            ProjectId = projectId,
            ActorUserId = User.UserId() ?? string.Empty,
            ActorName = User.FullName() ?? "Unknown user",
            Action = action,
            CreatedAtUtc = DateTime.UtcNow
        }, cancellationToken: cancellationToken);
    }

    private static string? ValidateProjectRequest(string name, int progressPercent, string status)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Project name is required.";
        }

        if (progressPercent is < 0 or > 100)
        {
            return "Progress percent must be between 0 and 100.";
        }

        if (!Enum.TryParse<ProjectStatus>(status, true, out _))
        {
            return "Status must be Planning, InProgress, OnHold, Completed, or Closed.";
        }

        return null;
    }

    private static ProjectResponse ToResponse(Project project) => new(
        project.Id ?? string.Empty,
        project.Name,
        project.ClientName,
        project.Location,
        project.Status.ToString(),
        project.ProgressPercent,
        project.BudgetSummary,
        project.BimPackageReference,
        project.SafetySummary,
        project.Description,
        project.ClientUserIds,
        project.CreatedAtUtc,
        project.UpdatedAtUtc);
}
