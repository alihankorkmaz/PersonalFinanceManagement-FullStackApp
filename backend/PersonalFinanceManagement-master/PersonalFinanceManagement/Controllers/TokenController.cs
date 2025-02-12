using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class TokenController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly FinanceContext _context;

    public TokenController(IConfiguration configuration, FinanceContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest loginRequest)
    {
        // Check if the login credentials match an Admin
        var admin = _context.Admins.FirstOrDefault(a =>
            a.Email == loginRequest.Email && a.PasswordHash == loginRequest.Password);

        // Check if the login credentials match a User
        var user = _context.Users.FirstOrDefault(u =>
            u.Email == loginRequest.Email && u.PasswordHash == loginRequest.Password);

        if (admin != null)
        {
            var token = GenerateJwtToken(admin.Id, admin.Email, "Admin");
            return Ok(new { token, role = "Admin" });
        }
        else if (user != null)
        {
            var token = GenerateJwtToken(user.Id, user.Email, "User");
            return Ok(new { token, role = "User" });
        }

        return Unauthorized(new { message = "Invalid email or password." });
    }

    private string GenerateJwtToken(int id, string email, string role)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role), // Define the role (Admin or User)
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddMinutes(double.Parse(jwtSettings["TokenExpiryMinutes"]));

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}
