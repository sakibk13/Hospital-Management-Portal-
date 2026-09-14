using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Text.RegularExpressions;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PrescriptionsController : ControllerBase
{
    private readonly MongoDbService _mongoDb;

    public PrescriptionsController(MongoDbService mongoDb)
    {
        _mongoDb = mongoDb;
    }

    // GET /api/prescriptions/all
    [HttpGet("all")]
    public async Task<IActionResult> GetAllPrescriptions()
    {
        var prescriptions = await _mongoDb.Prescriptions
            .Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(prescriptions);
    }

    public class PrescriptionCreateRequest
    {
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorEmail { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Sex { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PrescriptionText { get; set; } = string.Empty;
    }

    // POST /api/prescriptions/create
    [HttpPost("create")]
    public async Task<IActionResult> CreatePrescription([FromBody] PrescriptionCreateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.PatientName) || string.IsNullOrWhiteSpace(req.PrescriptionText))
        {
            return BadRequest(new { message = "Patient name and prescription details are required" });
        }

        DateTime date = DateTime.TryParse(req.Date, out var dt) ? dt : DateTime.UtcNow;

        var prescription = new Prescription
        {
            DoctorName = req.DoctorName,
            DoctorEmail = req.DoctorEmail,
            Date = date,
            PatientEmail = req.PatientEmail,
            PatientName = req.PatientName,
            Age = req.Age,
            Sex = req.Sex,
            PhoneNumber = req.PhoneNumber,
            PrescriptionText = req.PrescriptionText,
            CreatedAt = DateTime.UtcNow
        };

        await _mongoDb.Prescriptions.InsertOneAsync(prescription);
        return StatusCode(201, new { message = "Prescription sent to patient successfully", prescription });
    }

    // GET /api/prescriptions/dsearch
    [HttpGet("dsearch")]
    public async Task<IActionResult> DoctorSearchPrescriptions([FromQuery] string? query, [FromQuery] string? doctorEmail)
    {
        string? email = doctorEmail;
        if (string.IsNullOrWhiteSpace(email) && Request.Headers.TryGetValue("Doctor-Email", out var headerVal))
        {
            email = headerVal.ToString();
        }

        var filterBuilder = Builders<Prescription>.Filter;
        var filters = new List<FilterDefinition<Prescription>>();

        if (!string.IsNullOrWhiteSpace(email))
        {
            filters.Add(filterBuilder.Regex(p => p.DoctorEmail, new BsonRegularExpression($"^{Regex.Escape(email)}$", "i")));
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var regex = new BsonRegularExpression(Regex.Escape(query), "i");
            filters.Add(filterBuilder.Or(
                filterBuilder.Regex(p => p.PatientEmail, regex),
                filterBuilder.Regex(p => p.PatientName, regex),
                filterBuilder.Regex(p => p.PrescriptionText, regex)
            ));
        }

        var finalFilter = filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;
        var list = await _mongoDb.Prescriptions
            .Find(finalFilter)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(list);
    }

    // GET /api/prescriptions/psearch
    [HttpGet("psearch")]
    public async Task<IActionResult> PatientSearchPrescriptions([FromQuery] string? query, [FromQuery] string? patientEmail)
    {
        string? email = patientEmail;
        if (string.IsNullOrWhiteSpace(email) && Request.Headers.TryGetValue("Patient-Email", out var headerVal))
        {
            email = headerVal.ToString();
        }

        var filterBuilder = Builders<Prescription>.Filter;
        var filters = new List<FilterDefinition<Prescription>>();

        if (!string.IsNullOrWhiteSpace(email))
        {
            filters.Add(filterBuilder.Regex(p => p.PatientEmail, new BsonRegularExpression($"^{Regex.Escape(email)}$", "i")));
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var regex = new BsonRegularExpression(Regex.Escape(query), "i");
            filters.Add(filterBuilder.Or(
                filterBuilder.Regex(p => p.DoctorEmail, regex),
                filterBuilder.Regex(p => p.DoctorName, regex),
                filterBuilder.Regex(p => p.PrescriptionText, regex)
            ));
        }

        var finalFilter = filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;
        var list = await _mongoDb.Prescriptions
            .Find(finalFilter)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(list);
    }

    // GET /api/prescriptions/doctor/email/{email} or /api/prescriptions/doctor/{email}
    [HttpGet("doctor/email/{email}")]
    [HttpGet("doctor/{email}")]
    public async Task<IActionResult> GetPrescriptionsByDoctorEmail(string email)
    {
        var list = await _mongoDb.Prescriptions
            .Find(p => p.DoctorEmail.ToLower() == email.ToLower())
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    // GET /api/prescriptions/patient/email/{email} or /api/prescriptions/patient/{email}
    [HttpGet("patient/email/{email}")]
    [HttpGet("patient/{email}")]
    public async Task<IActionResult> GetPrescriptionsByPatientEmail(string email)
    {
        var list = await _mongoDb.Prescriptions
            .Find(p => p.PatientEmail.ToLower() == email.ToLower())
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    // GET /api/prescriptions/count-patients
    [HttpGet("count-patients")]
    public async Task<IActionResult> CountPatients([FromQuery] string? doctorEmail)
    {
        if (string.IsNullOrWhiteSpace(doctorEmail))
        {
            return BadRequest(new { message = "Doctor email required" });
        }

        var distinctPatients = await _mongoDb.Prescriptions
            .Distinct<string>("patientEmail", Builders<Prescription>.Filter.Eq("doctorEmail", doctorEmail))
            .ToListAsync();

        return Ok(new[] { new { count = distinctPatients.Count } });
    }
}
