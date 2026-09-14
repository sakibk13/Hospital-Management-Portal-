using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodDonorController : ControllerBase
{
    private readonly MongoDbService _db;

    public BloodDonorController(MongoDbService db)
    {
        _db = db;
    }

    [HttpGet]
    [HttpGet("details")]
    public async Task<IActionResult> GetAll()
    {
        var donors = await _db.BloodDonors.Find(_ => true)
            .SortByDescending(d => d.CreatedAt)
            .ToListAsync();
        return Ok(donors);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BloodDonor donor)
    {
        if (donor == null) return BadRequest("Invalid donor info");

        if (string.IsNullOrEmpty(donor.Name) && !string.IsNullOrEmpty(donor.FirstName))
        {
            donor.Name = $"{donor.FirstName} {donor.LastName}".Trim();
        }

        if (string.IsNullOrEmpty(donor.Phone) && !string.IsNullOrEmpty(donor.PhoneNumber))
        {
            donor.Phone = donor.PhoneNumber;
        }

        donor.CreatedAt = DateTime.UtcNow;
        donor.DonationDate = DateTime.UtcNow;

        await _db.BloodDonors.InsertOneAsync(donor);

        if (!string.IsNullOrEmpty(donor.BloodGroup))
        {
            await _db.BloodAvailability.UpdateOneAsync(
                b => b.BloodGroup == donor.BloodGroup,
                Builders<BloodAvailability>.Update.Inc(b => b.Count, 1),
                new UpdateOptions { IsUpsert = true }
            );
        }

        return Ok(new { message = "Registration successful!", donor });
    }
}
