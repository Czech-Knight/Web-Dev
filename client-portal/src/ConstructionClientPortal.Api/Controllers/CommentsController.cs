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
public sealed class CommentsController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly ProjectAccessService _access;

    public CommentsController(MongoDbContext db, ProjectAccessService access)
    {
        _db = db;
        _access = access;
    }

    [HttpGet]
    public async Task<ActionResult<List<CommentResponse>>> List([FromQuery] string projectId, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, projectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var comments = await _db.Comments.Find(c => c.ProjectId == projectId).SortByDescending(c => c.CreatedAtUtc).ToListAsync(cancellationToken);
        return Ok(comments.Select(ToResponse).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> Create(CreateCommentRequest request, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, request.ProjectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return BadRequest(new { message = "Comment body is required." });
        }

        var comment = new CommentNote
        {
            ProjectId = request.ProjectId,
            AuthorUserId = User.UserId() ?? string.Empty,
            AuthorName = User.FullName() ?? "Unknown user",
            Body = request.Body.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        await _db.Comments.InsertOneAsync(comment, cancellationToken: cancellationToken);
        await _db.ActivityLogs.InsertOneAsync(new ActivityLog
        {
            ProjectId = request.ProjectId,
            ActorUserId = comment.AuthorUserId,
            ActorName = comment.AuthorName,
            Action = "added comment",
            CreatedAtUtc = DateTime.UtcNow
        }, cancellationToken: cancellationToken);

        return CreatedAtAction(nameof(List), new { projectId = request.ProjectId }, ToResponse(comment));
    }

    private static CommentResponse ToResponse(CommentNote comment) => new(
        comment.Id ?? string.Empty,
        comment.ProjectId,
        comment.AuthorName,
        comment.Body,
        comment.CreatedAtUtc);
}
