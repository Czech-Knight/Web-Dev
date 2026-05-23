using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ConstructionClientPortal.Api.Models;

public sealed class Project
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public int ProgressPercent { get; set; }
    public string BudgetSummary { get; set; } = string.Empty;
    public string BimPackageReference { get; set; } = string.Empty;
    public string SafetySummary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> ClientUserIds { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
