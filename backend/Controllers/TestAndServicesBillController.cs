using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestAndServicesBillController : ControllerBase
{
    private readonly MongoDbService _mongoDb;

    public TestAndServicesBillController(MongoDbService mongoDb)
    {
        _mongoDb = mongoDb;
    }

    // GET /api/testAndServicesBill/all-bills
    [HttpGet("all-bills")]
    public async Task<IActionResult> GetAllBills()
    {
        var bills = await _mongoDb.TestAndServicesBills.Find(_ => true).SortByDescending(b => b.CreatedAt).ToListAsync();
        return Ok(bills);
    }

    public class AddBillRequest
    {
        public string DoctorName { get; set; } = string.Empty;
        public string DoctorEmail { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<TestServiceItem> SelectedItems { get; set; } = new();
    }

    // POST /api/testAndServicesBill/add
    [HttpPost("add")]
    public async Task<IActionResult> AddBill([FromBody] AddBillRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.PatientName) || string.IsNullOrWhiteSpace(req.PatientEmail) || req.SelectedItems.Count == 0)
        {
            return BadRequest(new { error = "Patient details and test items are required" });
        }

        decimal total = 0;
        foreach (var it in req.SelectedItems)
        {
            total += it.Price;
        }

        var bill = new TestAndServicesBill
        {
            DoctorName = req.DoctorName,
            DoctorEmail = req.DoctorEmail,
            PatientName = req.PatientName,
            PatientEmail = req.PatientEmail,
            Phone = req.PhoneNumber,
            SelectedItems = req.SelectedItems,
            TotalBill = total,
            Paid = false,
            CreatedAt = DateTime.UtcNow
        };

        await _mongoDb.TestAndServicesBills.InsertOneAsync(bill);
        return StatusCode(201, new { message = "Bill sent to the patient successfully", bill });
    }

    // GET /api/testAndServicesBill/bills/{email}
    [HttpGet("bills/{email}")]
    public async Task<IActionResult> GetBillsByPatientEmail(string email)
    {
        var bills = await _mongoDb.TestAndServicesBills
            .Find(b => b.PatientEmail.ToLower() == email.ToLower())
            .SortByDescending(b => b.CreatedAt)
            .ToListAsync();
        return Ok(bills);
    }

    public class PayTestBillRequest
    {
        public string Email { get; set; } = string.Empty;
        public decimal TopUpAmount { get; set; }
    }

    // PUT /api/testAndServicesBill/pay/{id}
    [HttpPut("pay/{id}")]
    public async Task<IActionResult> PayBill(string id, [FromBody] PayTestBillRequest req)
    {
        var bill = await _mongoDb.TestAndServicesBills.Find(b => b.Id == id).FirstOrDefaultAsync();
        if (bill == null)
            return NotFound(new { error = "Test bill not found" });

        if (bill.Paid)
            return BadRequest(new { error = "Bill already paid" });

        string pEmail = !string.IsNullOrWhiteSpace(req.Email) ? req.Email : bill.PatientEmail;
        var healthCard = await _mongoDb.HealthCards.Find(h => h.Email.ToLower() == pEmail.ToLower()).FirstOrDefaultAsync();
        if (healthCard == null)
            return NotFound(new { error = "Health card not found for this patient" });

        if (healthCard.TopUpAmount < bill.TotalBill)
            return BadRequest(new { error = $"Insufficient funds in Health Card. Required: {bill.TotalBill} BDT, Available: {healthCard.TopUpAmount} BDT" });

        healthCard.TopUpAmount -= bill.TotalBill;
        healthCard.UpdatedAt = DateTime.UtcNow;
        await _mongoDb.HealthCards.ReplaceOneAsync(h => h.Id == healthCard.Id, healthCard);

        bill.Paid = true;
        await _mongoDb.TestAndServicesBills.ReplaceOneAsync(b => b.Id == bill.Id, bill);

        return Ok(new { message = "Payment successful! Bill marked as Paid.", bill, balance = healthCard.TopUpAmount });
    }
}
