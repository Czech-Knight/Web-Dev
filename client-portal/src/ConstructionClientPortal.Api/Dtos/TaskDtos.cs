namespace ConstructionClientPortal.Api.Dtos;

public sealed record TaskResponse(
    string Id,
    string ProjectId,
    string Title,
    string Description,
    string AssignedTo,
    string Priority,
    string Status,
    DateTime? DueDateUtc,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public sealed record CreateTaskRequest(
    string ProjectId,
    string Title,
    string Description,
    string AssignedTo,
    string Priority,
    string Status,
    DateTime? DueDateUtc);

public sealed record UpdateTaskRequest(
    string Title,
    string Description,
    string AssignedTo,
    string Priority,
    string Status,
    DateTime? DueDateUtc);
