namespace ConstructionClientPortal.Api.Dtos;

public sealed record UserSummaryResponse(string Id, string FullName, string Email, string Role, string CompanyName, bool IsActive);
public sealed record CreateUserRequest(string FullName, string Email, string Password, string Role, string CompanyName);
