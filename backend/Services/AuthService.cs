using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace HospitalManagement.Api.Services;

public class AuthService
{
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateJwtToken(string id, string email, string role)
    {
        var secret = _config["Jwt:Secret"] ?? "HospitalManagementSuperSecretKey2026!With32BytesLongMinimumKey";
        var key = Encoding.ASCII.GetBytes(secret);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id ?? string.Empty),
                new Claim(ClaimTypes.Email, email ?? string.Empty),
                new Claim(ClaimTypes.Role, role ?? "User")
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool VerifyPassword(string inputPassword, string storedPassword)
    {
        if (string.IsNullOrEmpty(storedPassword) || string.IsNullOrEmpty(inputPassword))
            return false;

        // 1. Direct match (plain-text)
        if (storedPassword == inputPassword)
            return true;

        // 2. Demo seed password fallbacks (for seed doctors/patients in database)
        if ((storedPassword == "hashedpassword123" || storedPassword == "doctor123") && 
            (inputPassword == "hashedpassword123" || inputPassword == "doctor123" || inputPassword == "password123"))
            return true;

        if ((storedPassword == "patientpass123" || storedPassword == "patient123") && 
            (inputPassword == "patientpass123" || inputPassword == "patient123" || inputPassword == "password123"))
            return true;

        // 3. BCrypt hash verification
        if (storedPassword.StartsWith("$2"))
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(inputPassword, storedPassword);
            }
            catch
            {
                return false;
            }
        }

        return false;
    }
}
