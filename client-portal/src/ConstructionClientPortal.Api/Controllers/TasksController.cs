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
public sealed class TasksController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly ProjectAccessService _access;

    public TasksController(MongoDbContext db, ProjectAccessService access)
    {
        _db = db;
        _access = access;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskResponse>>> List([FromQuery] string projectId, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, projectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var tasks = await _db.Tasks.Find(t => t.ProjectId == projectId).SortBy(t => t.DueDateUtc).ToListAsync(cancellationToken);
        return Ok(tasks.Select(ToResponse).ToList());
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<TaskResponse>> Create(CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var project = await _db.Projects.Find(p => p.Id == request.ProjectId).FirstOrDefaultAsync(cancellationToken);
        if (project is null)
        {
            return NotFound(new { message = "Project was not found." });
        }

        var validation = ValidateRequest(request.Title, request.Priority, request.Status);
        if (validation is not null)
        {
            return BadRequest(new { message = validation });
        }

        var task = new ProjectTask
        {
            ProjectId = request.ProjectId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            AssignedTo = request.AssignedTo.Trim(),
            Priority = Enum.Parse<TaskPriority>(request.Priority, true),
            Status = Enum.Parse<TaskWorkflowStatus>(request.Status, true),
            DueDateUtc = request.DueDateUtc,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        await _db.Tasks.InsertOneAsync(task, cancellationToken: cancellationToken);
        await Log(task.ProjectId, $"created task '{task.Title}'", cancellationToken);
        return CreatedAtAction(nameof(List), new { projectId = task.ProjectId }, ToResponse(task));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<TaskResponse>> Update(string id, UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _db.Tasks.Find(t => t.Id == id).FirstOrDefaultAsync(cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        var validation = ValidateRequest(request.Title, request.Priority, request.Status);
        if (validation is not null)
        {
            return BadRequest(new { message = validation });
        }

        task.Title = request.Title.Trim();
        task.Description = request.Description.Trim();
        task.AssignedTo = request.AssignedTo.Trim();
        task.Priority = Enum.Parse<TaskPriority>(request.Priority, true);
        task.Status = Enum.Parse<TaskWorkflowStatus>(request.Status, true);
        task.DueDateUtc = request.DueDateUtc;
        task.UpdatedAtUtc = DateTime.UtcNow;

        await _db.Tasks.ReplaceOneAsync(t => t.Id == id, task, cancellationToken: cancellationToken);
        await Log(task.ProjectId, $"updated task '{task.Title}'", cancellationToken);
        return Ok(ToResponse(task));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var task = await _db.Tasks.Find(t => t.Id == id).FirstOrDefaultAsync(cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        await _db.Tasks.DeleteOneAsync(t => t.Id == id, cancellationToken);
        await Log(task.ProjectId, $"deleted task '{task.Title}'", cancellationToken);
        return NoContent();
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

    private static string? ValidateRequest(string title, string priority, string status)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return "Task title is required.";
        }

        if (!Enum.TryParse<TaskPriority>(priority, true, out _))
        {
            return "Priority must be Low, Medium, High, or Critical.";
        }

        if (!Enum.TryParse<TaskWorkflowStatus>(status, true, out _))
        {
            return "Status must be Pending, InProgress, Blocked, or Completed.";
        }

        return null;
    }

    private static TaskResponse ToResponse(ProjectTask task) => new(
        task.Id ?? string.Empty,
        task.ProjectId,
        task.Title,
        task.Description,
        task.AssignedTo,
        task.Priority.ToString(),
        task.Status.ToString(),
        task.DueDateUtc,
        task.CreatedAtUtc,
        task.UpdatedAtUtc);
}
