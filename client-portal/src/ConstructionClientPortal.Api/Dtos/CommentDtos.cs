namespace ConstructionClientPortal.Api.Dtos;

public sealed record CommentResponse(string Id, string ProjectId, string AuthorName, string Body, DateTime CreatedAtUtc);
public sealed record CreateCommentRequest(string ProjectId, string Body);
