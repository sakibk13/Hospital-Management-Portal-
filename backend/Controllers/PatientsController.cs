using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly MongoDbService _db;
    private readonly AuthService _auth;

    public PatientsController(MongoDbService db, AuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    public record PatientLoginRequest(string Email, string Password);
    public record ChangePasswordRequest(string Email, string CurrentPassword, string NewPassword);
    public record UpdateThemeRequest(string Email, string Theme);
    public record DeleteAccountRequest(string Email, string Password);

    [HttpPost("plogin")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] PatientLoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var patient = await _db.Patients.Find(p => p.Email.ToLower() == normalizedEmail).FirstOrDefaultAsync();

        if (patient == null)
        {
            return BadRequest(new { message = "Invalid email or password" });
        }

        if (!AuthService.VerifyPassword(req.Password, patient.Password))
        {
            return BadRequest(new { message = "Invalid email or password" });
        }

        var token = _auth.GenerateJwtToken(patient.Id ?? string.Empty, patient.Email, "Patient");

        return Ok(new
        {
            token,
            message = "Login successful",
            patient
        });
    }

    [HttpPost("register")]
    [HttpPost("pregister")]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var normalizedEmail = patient.Email.Trim().ToLowerInvariant();
        var existing = await _db.Patients.Find(p => p.Email.ToLower() == normalizedEmail).FirstOrDefaultAsync();
        if (existing != null)
        {
            return BadRequest(new { message = "Patient with this email already exists" });
        }

        if (string.IsNullOrEmpty(patient.Password))
        {
            patient.Password = AuthService.HashPassword("patient123");
        }
        else
        {
            patient.Password = AuthService.HashPassword(patient.Password);
        }

        patient.Email = normalizedEmail;
        if (patient.DateOfBirth == default)
        {
            patient.DateOfBirth = DateTime.UtcNow.AddYears(-25);
        }

        await _db.Patients.InsertOneAsync(patient);

        var token = _auth.GenerateJwtToken(patient.Id ?? string.Empty, patient.Email, "Patient");

        return Ok(new
        {
            success = true,
            message = "Registration successful",
            token,
            patient
        });
    }

    [HttpGet("pdetails/email/{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var patient = await _db.Patients.Find(p => p.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (patient == null)
        {
            return NotFound(new { message = "Patient not found" });
        }
        return Ok(patient);
    }

    [HttpGet("pdetails/search")]
    public async Task<IActionResult> Search([FromQuery] string searchQuery)
    {
        if (string.IsNullOrWhiteSpace(searchQuery))
        {
            return Ok(await _db.Patients.Find(_ => true).Limit(20).ToListAsync());
        }

        var filter = Builders<Patient>.Filter.Or(
            Builders<Patient>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(searchQuery, "i")),
            Builders<Patient>.Filter.Regex(p => p.Email, new MongoDB.Bson.BsonRegularExpression(searchQuery, "i")),
            Builders<Patient>.Filter.Regex(p => p.MobileNumber, new MongoDB.Bson.BsonRegularExpression(searchQuery, "i"))
        );

        var results = await _db.Patients.Find(filter).Limit(20).ToListAsync();
        return Ok(results);
    }

    [HttpPut("pupdate")]
    public async Task<IActionResult> UpdatePatientProfile([FromBody] Patient updated)
    {
        if (string.IsNullOrWhiteSpace(updated.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var normalized = updated.Email.Trim().ToLowerInvariant();
        var existing = await _db.Patients.Find(p => p.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (existing == null)
        {
            return NotFound(new { message = "Patient not found" });
        }

        updated.Id = existing.Id;
        updated.Email = existing.Email;
        if (string.IsNullOrEmpty(updated.Password))
        {
            updated.Password = existing.Password;
        }

        await _db.Patients.ReplaceOneAsync(p => p.Id == existing.Id, updated);
        return Ok(new { message = "Profile updated successfully", patient = updated });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest(new { message = "Email is required" });

        var normalized = req.Email.Trim().ToLowerInvariant();
        var patient = await _db.Patients.Find(p => p.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (patient == null) return NotFound(new { message = "Patient not found" });

        if (!AuthService.VerifyPassword(req.CurrentPassword, patient.Password))
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        var newHash = AuthService.HashPassword(req.NewPassword);
        var update = Builders<Patient>.Update.Set(p => p.Password, newHash);
        await _db.Patients.UpdateOneAsync(p => p.Id == patient.Id, update);

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpDelete("delete-account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest(new { message = "Email is required" });

        var normalized = req.Email.Trim().ToLowerInvariant();
        var patient = await _db.Patients.Find(p => p.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (patient == null) return NotFound(new { message = "Patient not found" });

        if (!AuthService.VerifyPassword(req.Password, patient.Password))
        {
            return BadRequest(new { message = "Password is incorrect" });
        }

        await _db.Patients.DeleteOneAsync(p => p.Id == patient.Id);
        return Ok(new { message = "Account deleted successfully" });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.Patients.Find(_ => true).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var patient = await _db.Patients.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (patient == null) return NotFound(new { message = "Patient not found" });
        return Ok(patient);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateById(string id, [FromBody] Patient patient)
    {
        patient.Id = id;
        await _db.Patients.ReplaceOneAsync(p => p.Id == id, patient);
        return Ok(patient);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _db.Patients.DeleteOneAsync(p => p.Id == id);
        return Ok(new { message = "Patient deleted" });
    }
}
