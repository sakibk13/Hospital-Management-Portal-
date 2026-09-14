using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly MongoDbService _db;

    public AppointmentsController(MongoDbService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.Appointments.Find(_ => true).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Appointment appointment)
    {
        if (appointment.Date == default)
        {
            appointment.Date = DateTime.UtcNow;
        }

        // Fill doctor info if only doctor ID is provided
        if (!string.IsNullOrEmpty(appointment.DoctorId))
        {
            var doctor = await _db.Doctors.Find(d => d.Id == appointment.DoctorId).FirstOrDefaultAsync();
            if (doctor != null)
            {
                if (string.IsNullOrEmpty(appointment.DoctorName))
                    appointment.DoctorName = $"{doctor.FirstName} {doctor.LastName}";
                if (string.IsNullOrEmpty(appointment.DoctorEmail))
                    appointment.DoctorEmail = doctor.Email;
                if (string.IsNullOrEmpty(appointment.Department))
                    appointment.Department = doctor.Department ?? string.Empty;
            }
        }

        await _db.Appointments.InsertOneAsync(appointment);
        return Ok(appointment);
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var doctors = await _db.Doctors.Find(_ => true).ToListAsync();
        var departments = doctors
            .Where(d => !string.IsNullOrEmpty(d.Department))
            .Select(d => d.Department!)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        if (departments.Count == 0)
        {
            departments = new List<string> { "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "General Medicine" };
        }

        return Ok(departments);
    }

    [HttpGet("doctors/{department}")]
    public async Task<IActionResult> GetDoctorsByDepartment(string department)
    {
        var docs = await _db.Doctors.Find(d => d.Department != null && d.Department.ToLower() == department.ToLower()).ToListAsync();
        return Ok(docs);
    }

    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetDoctorById(string doctorId)
    {
        var doc = await _db.Doctors.Find(d => d.Id == doctorId || d.Email == doctorId).FirstOrDefaultAsync();
        if (doc == null) return NotFound(new { message = "Doctor not found" });
        return Ok(doc);
    }

    [HttpGet("doctor/email/{email}")]
    public async Task<IActionResult> GetByDoctorEmail(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var appointments = await _db.Appointments.Find(a => a.DoctorEmail.ToLower() == normalized).ToListAsync();
        return Ok(appointments);
    }

    [HttpGet("patient/email/{email}")]
    public async Task<IActionResult> GetByPatientEmail(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var appointments = await _db.Appointments.Find(a => a.PatientEmail.ToLower() == normalized).ToListAsync();
        return Ok(appointments);
    }

    [HttpGet("count/patient/{email}")]
    public async Task<IActionResult> GetPatientAppointmentCount(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var count = await _db.Appointments.CountDocumentsAsync(a => a.PatientEmail.ToLower() == normalized);
        return Ok(new { count });
    }

    [HttpGet("count/{email}")]
    public async Task<IActionResult> GetDoctorAppointmentCount(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var count = await _db.Appointments.CountDocumentsAsync(a => a.DoctorEmail.ToLower() == normalized);
        return Ok(new { count });
    }

    [HttpGet("upcoming/patient/{email}")]
    public async Task<IActionResult> GetUpcomingPatientAppointments(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var appointments = await _db.Appointments
            .Find(a => a.PatientEmail.ToLower() == normalized && a.Status != "cancelled")
            .SortByDescending(a => a.Date)
            .Limit(5)
            .ToListAsync();
        return Ok(appointments);
    }

    [HttpGet("today-appointments")]
    public async Task<IActionResult> GetTodayDoctorAppointments([FromQuery] string? doctorEmail)
    {
        if (string.IsNullOrEmpty(doctorEmail))
        {
            return Ok(await _db.Appointments.Find(_ => true).Limit(10).ToListAsync());
        }

        var normalized = doctorEmail.Trim().ToLowerInvariant();
        var appointments = await _db.Appointments
            .Find(a => a.DoctorEmail.ToLower() == normalized)
            .ToListAsync();

        return Ok(appointments);
    }

    public record PaymentRequest(string? Email);

    [HttpPut("pay/{id}")]
    public async Task<IActionResult> Pay(string id, [FromBody] PaymentRequest? req)
    {
        var filter = Builders<Appointment>.Filter.Eq(a => a.Id, id);
        var update = Builders<Appointment>.Update.Set(a => a.PaidStatus, "paid");
        await _db.Appointments.UpdateOneAsync(filter, update);
        return Ok(new { message = "Appointment paid successfully" });
    }

    [HttpPut("request-payment/{id}")]
    public async Task<IActionResult> RequestPayment(string id)
    {
        var filter = Builders<Appointment>.Filter.Eq(a => a.Id, id);
        var update = Builders<Appointment>.Update.Set(a => a.PaymentRequest, "payment requested");
        await _db.Appointments.UpdateOneAsync(filter, update);
        return Ok(new { message = "Payment requested" });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] string status)
    {
        var filter = Builders<Appointment>.Filter.Eq(a => a.Id, id);
        var update = Builders<Appointment>.Update.Set(a => a.Status, status);
        await _db.Appointments.UpdateOneAsync(filter, update);
        return Ok(new { message = "Status updated" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var filter = Builders<Appointment>.Filter.Eq(a => a.Id, id);
        await _db.Appointments.DeleteOneAsync(filter);
        return Ok(new { message = "Appointment deleted" });
    }
}
