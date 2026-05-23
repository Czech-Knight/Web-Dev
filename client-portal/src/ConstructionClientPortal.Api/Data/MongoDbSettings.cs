namespace ConstructionClientPortal.Api.Data;

public sealed class MongoDbSettings
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string DatabaseName { get; set; } = "buildtrack_portal";
}
