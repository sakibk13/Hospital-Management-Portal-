using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly MongoDbService _db;
    private readonly AuthService _auth;

    public DoctorsController(MongoDbService db, AuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    public record DoctorLoginRequest(string Email, string Password);
    public record ChangePasswordRequest(string OldPassword, string NewPassword);

    [HttpPost("dlogin")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] DoctorLoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var doctor = await _db.Doctors.Find(d => d.Email.ToLower() == normalizedEmail).FirstOrDefaultAsync();

        if (doctor == null)
        {
            return BadRequest(new { message = "Invalid email or password" });
        }

        if (!AuthService.VerifyPassword(req.Password, doctor.Password))
        {
            return BadRequest(new { message = "Invalid email or password" });
        }

        var token = _auth.GenerateJwtToken(doctor.Id ?? string.Empty, doctor.Email, "Doctor");

        return Ok(new
        {
            token,
            message = "Login successful",
            doctor = new
            {
                id = doctor.Id,
                doctor.FirstName,
                doctor.LastName,
                doctor.Email,
                doctor.Specialty,
                doctor.Department
            }
        });
    }

    [HttpPost("dregister")]
    [HttpPost("register")]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] Doctor doctor)
    {
        if (string.IsNullOrWhiteSpace(doctor.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var normalizedEmail = doctor.Email.Trim().ToLowerInvariant();
        var existing = await _db.Doctors.Find(d => d.Email.ToLower() == normalizedEmail).FirstOrDefaultAsync();
        if (existing != null)
        {
            return BadRequest(new { message = "Doctor with this email already exists" });
        }

        if (string.IsNullOrEmpty(doctor.Password))
        {
            doctor.Password = AuthService.HashPassword("doctor123");
        }
        else
        {
            doctor.Password = AuthService.HashPassword(doctor.Password);
        }

        doctor.Email = normalizedEmail;
        await _db.Doctors.InsertOneAsync(doctor);

        var token = _auth.GenerateJwtToken(doctor.Id ?? string.Empty, doctor.Email, "Doctor");

        return Ok(new
        {
            message = "Doctor registered successfully",
            token,
            doctor
        });
    }

    [HttpGet("all")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var doctors = await _db.Doctors.Find(_ => true).ToListAsync();
        return Ok(doctors);
    }

    [HttpGet("ddetails/email/{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var doctor = await _db.Doctors.Find(d => d.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found" });
        }
        return Ok(doctor);
    }

    [HttpPut("update/{email}")]
    public async Task<IActionResult> UpdateByEmail(string email, [FromBody] Doctor updated)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var existing = await _db.Doctors.Find(d => d.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (existing == null)
        {
            return NotFound(new { message = "Doctor not found" });
        }

        updated.Id = existing.Id;
        updated.Email = existing.Email;
        if (string.IsNullOrEmpty(updated.Password))
        {
            updated.Password = existing.Password;
        }

        await _db.Doctors.ReplaceOneAsync(d => d.Id == existing.Id, updated);
        return Ok(new { message = "Profile updated successfully", doctor = updated });
    }

    [HttpPut("dupdate")]
    public async Task<IActionResult> DUpdate([FromBody] Doctor updated)
    {
        if (string.IsNullOrEmpty(updated.Email)) return BadRequest(new { message = "Email is required" });
        return await UpdateByEmail(updated.Email, updated);
    }

    [HttpPut("change-password/{email}")]
    public async Task<IActionResult> ChangePassword(string email, [FromBody] ChangePasswordRequest req)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var doctor = await _db.Doctors.Find(d => d.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (doctor == null) return NotFound(new { message = "Doctor not found" });

        if (!AuthService.VerifyPassword(req.OldPassword, doctor.Password))
        {
            return BadRequest(new { message = "Incorrect current password" });
        }

        var newHash = AuthService.HashPassword(req.NewPassword);
        var update = Builders<Doctor>.Update.Set(d => d.Password, newHash);
        await _db.Doctors.UpdateOneAsync(d => d.Id == doctor.Id, update);

        return Ok(new { message = "Password updated successfully" });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var doctor = await _db.Doctors.Find(d => d.Id == id).FirstOrDefaultAsync();
        if (doctor == null) return NotFound(new { message = "Doctor not found" });
        return Ok(doctor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateById(string id, [FromBody] Doctor doctor)
    {
        doctor.Id = id;
        await _db.Doctors.ReplaceOneAsync(d => d.Id == id, doctor);
        return Ok(doctor);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _db.Doctors.DeleteOneAsync(d => d.Id == id);
        return Ok(new { message = "Doctor deleted" });
    }
}
