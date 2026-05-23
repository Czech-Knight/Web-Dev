using ConstructionClientPortal.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ConstructionClientPortal.Api.Data;

public sealed class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<UserAccount> Users => _database.GetCollection<UserAccount>("users");
    public IMongoCollection<Project> Projects => _database.GetCollection<Project>("projects");
    public IMongoCollection<ProjectTask> Tasks => _database.GetCollection<ProjectTask>("tasks");
    public IMongoCollection<DocumentFile> Documents => _database.GetCollection<DocumentFile>("documents");
    public IMongoCollection<CommentNote> Comments => _database.GetCollection<CommentNote>("comments");
    public IMongoCollection<ActivityLog> ActivityLogs => _database.GetCollection<ActivityLog>("activityLogs");
}
