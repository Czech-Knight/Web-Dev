namespace ConstructionClientPortal.Api.Dtos;

public sealed record ProjectResponse(
    string Id,
    string Name,
    string ClientName,
    string Location,
    string Status,
    int ProgressPercent,
    string BudgetSummary,
    string BimPackageReference,
    string SafetySummary,
    string Description,
    List<string> ClientUserIds,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public sealed record CreateProjectRequest(
    string Name,
    string ClientName,
    string Location,
    string Status,
    int ProgressPercent,
    string BudgetSummary,
    string BimPackageReference,
    string SafetySummary,
    string Description,
    List<string> ClientUserIds);

public sealed record UpdateProjectRequest(
    string Name,
    string ClientName,
    string Location,
    string Status,
    int ProgressPercent,
    string BudgetSummary,
    string BimPackageReference,
    string SafetySummary,
    string Description,
    List<string> ClientUserIds);
