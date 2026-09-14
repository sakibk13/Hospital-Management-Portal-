using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CabinBookingController : ControllerBase
{
    private readonly MongoDbService _mongoDb;

    public CabinBookingController(MongoDbService mongoDb)
    {
        _mongoDb = mongoDb;
    }

    // GET /api/cabinBooking/all-bills
    [HttpGet("all-bills")]
    public async Task<IActionResult> GetAllBills()
    {
        var list = await _mongoDb.CabinBookings.Find(_ => true).ToListAsync();
        return Ok(list);
    }

    // GET /api/cabinBooking/cavailable
    [HttpGet("cavailable")]
    public async Task<IActionResult> GetAvailableCabins()
    {
        var available = await _mongoDb.CabinBookings.Find(c => !c.IsBooked).ToListAsync();
        return Ok(available);
    }

    public class CabinBookRequest
    {
        public string CabinType { get; set; } = "single";
        public int Floor { get; set; }
        public string CabinNo { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int TotalDays { get; set; } = 1;
        public string BookedDate { get; set; } = string.Empty;
    }

    // POST /api/cabinBooking/cbook
    [HttpPost("cbook")]
    public async Task<IActionResult> BookCabin([FromBody] CabinBookRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.CabinNo) || string.IsNullOrWhiteSpace(req.PatientName))
        {
            return BadRequest(new { error = "Please provide all required cabin details" });
        }

        // Check if already booked
        var existing = await _mongoDb.CabinBookings.Find(c =>
            c.CabinType.ToLower() == req.CabinType.ToLower() &&
            c.Floor == req.Floor &&
            c.CabinNo.ToLower() == req.CabinNo.ToLower() &&
            c.IsBooked
        ).FirstOrDefaultAsync();

        if (existing != null)
        {
            return BadRequest(new { error = "Selected cabin is already occupied/booked." });
        }

        decimal ratePerDay = req.CabinType.ToLower() == "double" ? 2500m : 2000m;
        decimal totalBill = req.TotalDays * ratePerDay;

        DateTime parsedDate = DateTime.TryParse(req.BookedDate, out var dt) ? dt : DateTime.UtcNow;

        var booking = new CabinBooking
        {
            CabinType = req.CabinType,
            Floor = req.Floor,
            CabinNo = req.CabinNo,
            CabinNumber = req.CabinNo,
            PatientName = req.PatientName,
            Email = req.Email,
            Phone = req.Phone,
            TotalDays = req.TotalDays,
            BookedDate = parsedDate,
            TotalBill = totalBill,
            IsBooked = true,
            Paid = false,
            Status = "booked",
            CreatedAt = DateTime.UtcNow
        };

        await _mongoDb.CabinBookings.InsertOneAsync(booking);
        return Ok(new { message = "Cabin booked successfully!", booking });
    }

    // GET /api/cabinBooking/cabin-bills/{email}
    [HttpGet("cabin-bills/{email}")]
    public async Task<IActionResult> GetCabinBillsByEmail(string email)
    {
        var bills = await _mongoDb.CabinBookings.Find(c => c.Email.ToLower() == email.ToLower()).ToListAsync();
        return Ok(bills);
    }

    public class CabinPaymentRequest
    {
        public string? Email { get; set; }
        public decimal TopUpAmount { get; set; }
    }

    // PUT /api/cabinBooking/pay-cabin-bill/{id}
    [HttpPut("pay-cabin-bill/{id}")]
    public async Task<IActionResult> PayCabinBill(string id, [FromBody] CabinPaymentRequest req)
    {
        var booking = await _mongoDb.CabinBookings.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (booking == null)
            return NotFound(new { error = "Cabin booking not found" });

        if (booking.Paid)
            return BadRequest(new { error = "Bill already paid" });

        string patientEmail = req.Email ?? booking.Email;
        var healthCard = await _mongoDb.HealthCards.Find(h => h.Email.ToLower() == patientEmail.ToLower()).FirstOrDefaultAsync();
        if (healthCard == null)
            return NotFound(new { error = "Health card not found for this patient" });

        if (healthCard.TopUpAmount < booking.TotalBill)
            return BadRequest(new { error = $"Insufficient balance. Available: {healthCard.TopUpAmount} BDT, Required: {booking.TotalBill} BDT" });

        healthCard.TopUpAmount -= booking.TotalBill;
        healthCard.UpdatedAt = DateTime.UtcNow;
        await _mongoDb.HealthCards.ReplaceOneAsync(h => h.Id == healthCard.Id, healthCard);

        booking.Paid = true;
        await _mongoDb.CabinBookings.ReplaceOneAsync(c => c.Id == booking.Id, booking);

        return Ok(new { message = "Cabin bill paid successfully using Health Card!", booking, balance = healthCard.TopUpAmount });
    }
}
