using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodAvailabilityController : ControllerBase
{
    private readonly MongoDbService _db;

    public BloodAvailabilityController(MongoDbService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stock = await _db.BloodAvailability.Find(_ => true).ToListAsync();
        return Ok(stock);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrUpdate([FromBody] BloodAvailability item)
    {
        var existing = await _db.BloodAvailability.Find(b => b.BloodGroup == item.BloodGroup).FirstOrDefaultAsync();
        if (existing != null)
        {
            await _db.BloodAvailability.UpdateOneAsync(
                b => b.BloodGroup == item.BloodGroup,
                Builders<BloodAvailability>.Update.Set(b => b.Count, item.Count)
            );
            return Ok(new { message = "Blood stock updated successfully", item });
        }

        await _db.BloodAvailability.InsertOneAsync(item);
        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStock(string id, [FromBody] BloodAvailability update)
    {
        var filter = Builders<BloodAvailability>.Filter.Eq(b => b.Id, id);
        var updateDef = Builders<BloodAvailability>.Update.Set(b => b.Count, update.Count);
        var res = await _db.BloodAvailability.UpdateOneAsync(filter, updateDef);

        if (res.MatchedCount == 0) return NotFound();
        return Ok(new { message = "Blood stock updated successfully" });
    }
}
