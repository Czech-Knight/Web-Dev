using System.Security.Claims;

namespace ConstructionClientPortal.Api.Services;

public static class ClaimsPrincipalExtensions
{
    public static string? UserId(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier);
    public static string? FullName(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Name);
    public static bool IsAdmin(this ClaimsPrincipal user) => user.IsInRole("Admin");
}
