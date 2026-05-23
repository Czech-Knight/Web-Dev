using ConstructionClientPortal.Api.Data;
using ConstructionClientPortal.Api.Dtos;
using ConstructionClientPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace ConstructionClientPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly JwtTokenService _jwt;

    public AuthController(MongoDbContext db, JwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.Find(u => u.Email == email && u.IsActive).FirstOrDefaultAsync(cancellationToken);
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = _jwt.CreateToken(user);
        return Ok(new LoginResponse(token, user.Email, user.FullName, user.Role.ToString()));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = User.UserId();
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync(cancellationToken);
        if (user is null || user.Id is null)
        {
            return Unauthorized();
        }

        return Ok(new CurrentUserResponse(user.Id, user.FullName, user.Email, user.Role.ToString(), user.CompanyName));
    }
}
