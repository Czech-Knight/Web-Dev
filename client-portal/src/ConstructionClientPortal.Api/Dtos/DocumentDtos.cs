namespace ConstructionClientPortal.Api.Dtos;

public sealed record DocumentResponse(
    string Id,
    string ProjectId,
    string OriginalFileName,
    string ContentType,
    long SizeBytes,
    string UploadedByName,
    DateTime UploadedAtUtc);
