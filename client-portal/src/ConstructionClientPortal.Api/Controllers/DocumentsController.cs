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
public sealed class DocumentsController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly ProjectAccessService _access;
    private readonly IWebHostEnvironment _environment;

    public DocumentsController(MongoDbContext db, ProjectAccessService access, IWebHostEnvironment environment)
    {
        _db = db;
        _access = access;
        _environment = environment;
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<List<DocumentResponse>>> List(string projectId, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, projectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var documents = await _db.Documents.Find(d => d.ProjectId == projectId).SortByDescending(d => d.UploadedAtUtc).ToListAsync(cancellationToken);
        return Ok(documents.Select(ToResponse).ToList());
    }

    [HttpPost("upload")]
    [RequestSizeLimit(25_000_000)]
    public async Task<ActionResult<DocumentResponse>> Upload([FromForm] string projectId, [FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        var project = await _access.GetAccessibleProjectAsync(User, projectId, cancellationToken);
        if (project is null)
        {
            return NotFound(new { message = "Project was not found." });
        }

        if (file.Length <= 0)
        {
            return BadRequest(new { message = "File is empty." });
        }

        var safeFileName = Path.GetFileName(file.FileName);
        var storedFileName = $"{Guid.NewGuid():N}_{safeFileName}";
        var uploadRoot = Path.Combine(_environment.ContentRootPath, "uploads", projectId);
        Directory.CreateDirectory(uploadRoot);
        var fullPath = Path.Combine(uploadRoot, storedFileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var document = new DocumentFile
        {
            ProjectId = projectId,
            OriginalFileName = safeFileName,
            StoredFileName = storedFileName,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            SizeBytes = file.Length,
            UploadedByUserId = User.UserId() ?? string.Empty,
            UploadedByName = User.FullName() ?? "Unknown user",
            UploadedAtUtc = DateTime.UtcNow
        };

        await _db.Documents.InsertOneAsync(document, cancellationToken: cancellationToken);
        await _db.ActivityLogs.InsertOneAsync(new ActivityLog
        {
            ProjectId = projectId,
            ActorUserId = document.UploadedByUserId,
            ActorName = document.UploadedByName,
            Action = $"uploaded document '{document.OriginalFileName}'",
            CreatedAtUtc = DateTime.UtcNow
        }, cancellationToken: cancellationToken);

        return CreatedAtAction(nameof(List), new { projectId }, ToResponse(document));
    }

    [HttpGet("download/{documentId}")]
    public async Task<IActionResult> Download(string documentId, CancellationToken cancellationToken)
    {
        var document = await _db.Documents.Find(d => d.Id == documentId).FirstOrDefaultAsync(cancellationToken);
        if (document is null)
        {
            return NotFound();
        }

        var project = await _access.GetAccessibleProjectAsync(User, document.ProjectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var fullPath = Path.Combine(_environment.ContentRootPath, "uploads", document.ProjectId, document.StoredFileName);
        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound(new { message = "Stored file was not found on the server." });
        }

        var stream = System.IO.File.OpenRead(fullPath);
        return File(stream, document.ContentType, document.OriginalFileName);
    }

    private static DocumentResponse ToResponse(DocumentFile document) => new(
        document.Id ?? string.Empty,
        document.ProjectId,
        document.OriginalFileName,
        document.ContentType,
        document.SizeBytes,
        document.UploadedByName,
        document.UploadedAtUtc);
}
