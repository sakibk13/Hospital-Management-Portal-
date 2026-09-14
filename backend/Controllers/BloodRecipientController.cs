using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodRecipientController : ControllerBase
{
    private readonly MongoDbService _db;

    public BloodRecipientController(MongoDbService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.BloodRecipients.Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BloodRecipient request)
    {
        if (request == null) return BadRequest("Invalid request");

        if (string.IsNullOrEmpty(request.Name) && !string.IsNullOrEmpty(request.FirstName))
        {
            request.Name = $"{request.FirstName} {request.LastName}".Trim();
        }

        if (string.IsNullOrEmpty(request.Phone) && !string.IsNullOrEmpty(request.PhoneNumber))
        {
            request.Phone = request.PhoneNumber;
        }

        if (string.IsNullOrEmpty(request.BloodGroup) && !string.IsNullOrEmpty(request.BloodNeeded))
        {
            request.BloodGroup = request.BloodNeeded;
        }

        request.CreatedAt = DateTime.UtcNow;

        await _db.BloodRecipients.InsertOneAsync(request);
        return Ok(new { message = "Request successfully submitted!", item = request });
    }
}
