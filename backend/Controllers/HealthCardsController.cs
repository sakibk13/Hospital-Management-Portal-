using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthCardsController : ControllerBase
{
    private readonly MongoDbService _db;

    public HealthCardsController(MongoDbService db)
    {
        _db = db;
    }

    [HttpGet("{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var normalized = email.Trim().ToLowerInvariant();
        var card = await _db.HealthCards.Find(c => c.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (card == null)
        {
            return NotFound(new { message = "Health card not found" });
        }

        return Ok(card);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] HealthCard request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var normalized = request.Email.Trim().ToLowerInvariant();
        var existing = await _db.HealthCards.Find(c => c.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (existing != null)
        {
            // Update existing card details if provided
            existing.PatientName = !string.IsNullOrWhiteSpace(request.PatientName) ? request.PatientName : existing.PatientName;
            existing.PhoneNumber = !string.IsNullOrWhiteSpace(request.PhoneNumber) ? request.PhoneNumber : existing.PhoneNumber;
            existing.BloodGroup = !string.IsNullOrWhiteSpace(request.BloodGroup) ? request.BloodGroup : existing.BloodGroup;
            await _db.HealthCards.ReplaceOneAsync(c => c.Id == existing.Id, existing);
            return Ok(existing);
        }

        // Generate card number if missing
        if (string.IsNullOrWhiteSpace(request.CardNumber))
        {
            var rand = new Random();
            request.CardNumber = $"4532 {rand.Next(1000, 9999)} {rand.Next(1000, 9999)} {rand.Next(1000, 9999)}";
        }

        request.Email = normalized;
        request.Tier = string.IsNullOrWhiteSpace(request.Tier) ? "Premier Gold" : request.Tier;
        request.ValidThru = "12/28";
        request.CreatedAt = DateTime.UtcNow;

        await _db.HealthCards.InsertOneAsync(request);
        return CreatedAtAction(nameof(GetByEmail), new { email = request.Email }, request);
    }

    public class TopUpRequest
    {
        public decimal TopUpAmount { get; set; }
        public string? Email { get; set; }
    }

    [HttpPut("topup")]
    public async Task<IActionResult> TopUp([FromBody] TopUpRequest request)
    {
        var email = request.Email;
        if (string.IsNullOrWhiteSpace(email) && Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            email = authHeader.ToString().Replace("Bearer ", "").Trim();
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email identifier is required for top-up" });
        }

        var normalized = email.Trim().ToLowerInvariant();
        var card = await _db.HealthCards.Find(c => c.Email.ToLower() == normalized).FirstOrDefaultAsync();
        if (card == null)
        {
            return NotFound(new { message = "Health card not found for this patient" });
        }

        if (request.TopUpAmount <= 0)
        {
            return BadRequest(new { message = "Top-up amount must be greater than zero" });
        }

        card.TopUpAmount += request.TopUpAmount;
        card.Points += (int)(request.TopUpAmount / 10); // 1 point per 10 BDT spent

        await _db.HealthCards.ReplaceOneAsync(c => c.Id == card.Id, card);
        return Ok(new
        {
            message = $"Top-up of {request.TopUpAmount} BDT completed successfully!",
            card
        });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var cards = await _db.HealthCards.Find(_ => true).ToListAsync();
        return Ok(cards);
    }
}
