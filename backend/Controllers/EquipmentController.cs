using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquipmentController : ControllerBase
{
    private readonly MongoDbService _db;

    public EquipmentController(MongoDbService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Equipment.Find(_ => true)
            .SortByDescending(e => e.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("add")]
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Equipment item)
    {
        if (item == null) return BadRequest("Equipment data cannot be empty");
        item.CreatedAt = DateTime.UtcNow;
        await _db.Equipment.InsertOneAsync(item);
        return Ok(item);
    }

    [HttpPut("update/{id}")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Equipment update)
    {
        var filter = Builders<Equipment>.Filter.Eq(e => e.Id, id);
        var existing = await _db.Equipment.Find(filter).FirstOrDefaultAsync();
        if (existing == null) return NotFound(new { message = "Equipment not found" });

        var updateDef = Builders<Equipment>.Update
            .Set(e => e.Status, update.Status ?? existing.Status);

        if (!string.IsNullOrEmpty(update.Name))
            updateDef = updateDef.Set(e => e.Name, update.Name);
        if (!string.IsNullOrEmpty(update.Category))
            updateDef = updateDef.Set(e => e.Category, update.Category);
        if (!string.IsNullOrEmpty(update.SerialNumber))
            updateDef = updateDef.Set(e => e.SerialNumber, update.SerialNumber);
        if (!string.IsNullOrEmpty(update.LastMaintenance))
            updateDef = updateDef.Set(e => e.LastMaintenance, update.LastMaintenance);
        if (!string.IsNullOrEmpty(update.Location))
            updateDef = updateDef.Set(e => e.Location, update.Location);
        if (!string.IsNullOrEmpty(update.Description))
            updateDef = updateDef.Set(e => e.Description, update.Description);

        await _db.Equipment.UpdateOneAsync(filter, updateDef);
        var refreshed = await _db.Equipment.Find(filter).FirstOrDefaultAsync();
        return Ok(refreshed);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var res = await _db.Equipment.DeleteOneAsync(e => e.Id == id);
        if (res.DeletedCount == 0) return NotFound();
        return Ok(new { message = "Equipment deleted successfully" });
    }
}
