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
[Authorize(Policy = "AdminOnly")]
public sealed class AdminController : ControllerBase
{
    private readonly MongoDbContext _db;

    public AdminController(MongoDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsResponse>> Stats(CancellationToken cancellationToken)
    {
        var projectCount = (int)await _db.Projects.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        var clientCount = (int)await _db.Users.CountDocumentsAsync(u => u.Role == UserRole.Client, cancellationToken: cancellationToken);
        var taskCount = (int)await _db.Tasks.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        var openTaskCount = (int)await _db.Tasks.CountDocumentsAsync(t => t.Status != TaskWorkflowStatus.Completed, cancellationToken: cancellationToken);
        var documentCount = (int)await _db.Documents.CountDocumentsAsync(_ => true, cancellationToken: cancellationToken);
        return Ok(new AdminStatsResponse(projectCount, clientCount, taskCount, openTaskCount, documentCount));
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserSummaryResponse>>> Users(CancellationToken cancellationToken)
    {
        var users = await _db.Users.Find(_ => true).SortBy(u => u.FullName).ToListAsync(cancellationToken);
        return Ok(users.Select(ToResponse).ToList());
    }

    [HttpPost("users")]
    public async Task<ActionResult<UserSummaryResponse>> CreateUser(CreateUserRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Full name, email, and password are required." });
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            return BadRequest(new { message = "Role must be Admin or Client." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await _db.Users.Find(u => u.Email == email).FirstOrDefaultAsync(cancellationToken);
        if (existing is not null)
        {
            return Conflict(new { message = "A user with this email already exists." });
        }

        var user = new UserAccount
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = role,
            CompanyName = request.CompanyName.Trim(),
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _db.Users.InsertOneAsync(user, cancellationToken: cancellationToken);
        return CreatedAtAction(nameof(Users), ToResponse(user));
    }

    private static UserSummaryResponse ToResponse(UserAccount user) => new(
        user.Id ?? string.Empty,
        user.FullName,
        user.Email,
        user.Role.ToString(),
        user.CompanyName,
        user.IsActive);
}
