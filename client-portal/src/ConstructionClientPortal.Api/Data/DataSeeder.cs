using ConstructionClientPortal.Api.Models;
using ConstructionClientPortal.Api.Services;
using MongoDB.Driver;

namespace ConstructionClientPortal.Api.Data;

public sealed class DataSeeder : IHostedService
{
    private readonly MongoDbContext _db;

    public DataSeeder(MongoDbContext db)
    {
        _db = db;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var emailIndex = Builders<UserAccount>.IndexKeys.Ascending(u => u.Email);
        await _db.Users.Indexes.CreateOneAsync(new CreateIndexModel<UserAccount>(emailIndex, new CreateIndexOptions { Unique = true }), cancellationToken: cancellationToken);

        var admin = await _db.Users.Find(u => u.Email == "admin@buildtrack.local").FirstOrDefaultAsync(cancellationToken);
        if (admin is null)
        {
            admin = new UserAccount
            {
                FullName = "BuildTrack Admin",
                Email = "admin@buildtrack.local",
                Role = UserRole.Admin,
                CompanyName = "BuildTrack Internal",
                PasswordHash = PasswordHasher.Hash("Admin@12345"),
                CreatedAtUtc = DateTime.UtcNow,
                IsActive = true
            };
            await _db.Users.InsertOneAsync(admin, cancellationToken: cancellationToken);
        }

        var client = await _db.Users.Find(u => u.Email == "client@buildtrack.local").FirstOrDefaultAsync(cancellationToken);
        if (client is null)
        {
            client = new UserAccount
            {
                FullName = "Jordan Lee",
                Email = "client@buildtrack.local",
                Role = UserRole.Client,
                CompanyName = "Northside Developments",
                PasswordHash = PasswordHasher.Hash("Client@12345"),
                CreatedAtUtc = DateTime.UtcNow,
                IsActive = true
            };
            await _db.Users.InsertOneAsync(client, cancellationToken: cancellationToken);
        }

        var existingProject = await _db.Projects.Find(p => p.Name == "North Melbourne Site Upgrade").FirstOrDefaultAsync(cancellationToken);
        if (existingProject is null && client.Id is not null)
        {
            var project = new Project
            {
                Name = "North Melbourne Site Upgrade",
                ClientName = "Northside Developments",
                Location = "North Melbourne, VIC",
                Status = ProjectStatus.InProgress,
                ProgressPercent = 42,
                BudgetSummary = "$1.4M allocated / $590K used",
                BimPackageReference = "BIM-NM-2026-04",
                SafetySummary = "No open high-risk safety issues. Two medium-priority site access items under review.",
                Description = "Client-facing portal pilot for construction progress updates, digital handover documentation, and action tracking.",
                ClientUserIds = new List<string> { client.Id },
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            await _db.Projects.InsertOneAsync(project, cancellationToken: cancellationToken);

            var tasks = new[]
            {
                new ProjectTask
                {
                    ProjectId = project.Id!,
                    Title = "Confirm revised access plan",
                    Description = "Client to review updated site access instructions before next delivery window.",
                    AssignedTo = "Client Representative",
                    Priority = TaskPriority.High,
                    Status = TaskWorkflowStatus.Pending,
                    DueDateUtc = DateTime.UtcNow.AddDays(5),
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                },
                new ProjectTask
                {
                    ProjectId = project.Id!,
                    Title = "Upload latest services drawing",
                    Description = "Internal team to upload the latest coordinated services drawing for client review.",
                    AssignedTo = "Project Coordinator",
                    Priority = TaskPriority.Medium,
                    Status = TaskWorkflowStatus.InProgress,
                    DueDateUtc = DateTime.UtcNow.AddDays(8),
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                }
            };

            await _db.Tasks.InsertManyAsync(tasks, cancellationToken: cancellationToken);

            await _db.Comments.InsertOneAsync(new CommentNote
            {
                ProjectId = project.Id!,
                AuthorUserId = admin.Id!,
                AuthorName = admin.FullName,
                Body = "Initial portal setup completed. Client can now track project updates, tasks, and documents from one place.",
                CreatedAtUtc = DateTime.UtcNow
            }, cancellationToken: cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
