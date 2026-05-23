namespace ConstructionClientPortal.Api.Dtos;

public sealed record LoginRequest(string Email, string Password);
public sealed record LoginResponse(string Token, string Email, string FullName, string Role);
public sealed record CurrentUserResponse(string Id, string FullName, string Email, string Role, string CompanyName);
