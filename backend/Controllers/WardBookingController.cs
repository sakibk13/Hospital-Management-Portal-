using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WardBookingController : ControllerBase
{
    private readonly MongoDbService _mongoDb;

    public WardBookingController(MongoDbService mongoDb)
    {
        _mongoDb = mongoDb;
    }

    // GET /api/wardBooking/all-bills
    [HttpGet("all-bills")]
    public async Task<IActionResult> GetAllBills()
    {
        var list = await _mongoDb.WardBookings.Find(_ => true).ToListAsync();
        return Ok(list);
    }

    // GET /api/wardBooking/wavailable or /available
    [HttpGet("wavailable")]
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableWards()
    {
        var available = await _mongoDb.WardBookings.Find(w => !w.IsBooked).ToListAsync();
        return Ok(available);
    }

    public class WardBookRequest
    {
        public string WardType { get; set; } = "men";
        public int Floor { get; set; }
        public string WardNo { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int TotalDays { get; set; } = 1;
        public string BookedDate { get; set; } = string.Empty;
    }

    // POST /api/wardBooking/wbook
    [HttpPost("wbook")]
    public async Task<IActionResult> BookWard([FromBody] WardBookRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.WardNo) || string.IsNullOrWhiteSpace(req.PatientName))
        {
            return BadRequest(new { error = "Please provide all required ward details" });
        }

        // Check if already booked
        var existing = await _mongoDb.WardBookings.Find(w =>
            w.WardType.ToLower() == req.WardType.ToLower() &&
            w.Floor == req.Floor &&
            w.WardNo.ToLower() == req.WardNo.ToLower() &&
            w.IsBooked
        ).FirstOrDefaultAsync();

        if (existing != null)
        {
            return BadRequest(new { error = "Selected ward bed is already booked." });
        }

        decimal ratePerDay = 1500m;
        decimal totalBill = req.TotalDays * ratePerDay;

        DateTime parsedDate = DateTime.TryParse(req.BookedDate, out var dt) ? dt : DateTime.UtcNow;

        var booking = new WardBooking
        {
            WardType = req.WardType,
            Floor = req.Floor,
            WardNo = req.WardNo,
            BedNumber = req.WardNo,
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

        await _mongoDb.WardBookings.InsertOneAsync(booking);
        return Ok(new { message = "Ward booked successfully!", booking });
    }

    // GET /api/wardBooking/ward-bills/{email}
    [HttpGet("ward-bills/{email}")]
    public async Task<IActionResult> GetWardBillsByEmail(string email)
    {
        var bills = await _mongoDb.WardBookings.Find(w => w.Email.ToLower() == email.ToLower()).ToListAsync();
        return Ok(bills);
    }

    public class WardPaymentRequest
    {
        public string? Email { get; set; }
        public decimal TopUpAmount { get; set; }
    }

    // PUT /api/wardBooking/pay-ward-bill/{id}
    [HttpPut("pay-ward-bill/{id}")]
    public async Task<IActionResult> PayWardBill(string id, [FromBody] WardPaymentRequest req)
    {
        var booking = await _mongoDb.WardBookings.Find(w => w.Id == id).FirstOrDefaultAsync();
        if (booking == null)
            return NotFound(new { error = "Ward booking not found" });

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
        await _mongoDb.WardBookings.ReplaceOneAsync(w => w.Id == booking.Id, booking);

        return Ok(new { message = "Ward bill paid successfully using Health Card!", booking, balance = healthCard.TopUpAmount });
    }
}
