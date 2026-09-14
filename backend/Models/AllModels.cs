using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HospitalManagement.Api.Models;

[BsonIgnoreExtraElements]
public class BloodDonor
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("firstName")]
    public string? FirstName { get; set; }

    [BsonElement("lastName")]
    public string? LastName { get; set; }

    [BsonElement("age")]
    public int Age { get; set; }

    [BsonElement("bloodGroup")]
    public string BloodGroup { get; set; } = string.Empty;

    [BsonElement("gender")]
    public string Gender { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("address")]
    public string? Address { get; set; }

    [BsonElement("donatedBefore")]
    public string? DonatedBefore { get; set; }

    [BsonElement("lastDonationDate")]
    public string? LastDonationDate { get; set; }

    [BsonElement("donationDate")]
    public DateTime DonationDate { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class BloodRecipient
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("firstName")]
    public string? FirstName { get; set; }

    [BsonElement("lastName")]
    public string? LastName { get; set; }

    [BsonElement("age")]
    public int Age { get; set; }

    [BsonElement("bloodGroup")]
    public string BloodGroup { get; set; } = string.Empty;

    [BsonElement("bloodNeeded")]
    public string? BloodNeeded { get; set; }

    [BsonElement("totalBagsNeeded")]
    public object? TotalBagsNeeded { get; set; }

    [BsonElement("gender")]
    public string Gender { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("hospital")]
    public string? Hospital { get; set; }

    [BsonElement("hospitalNotes")]
    public string? HospitalNotes { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "pending";

    [BsonElement("requiredDate")]
    public DateTime RequiredDate { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class Equipment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = "Available";

    [BsonElement("quantity")]
    public int Quantity { get; set; } = 1;

    [BsonElement("department")]
    public string? Department { get; set; }

    [BsonElement("serialNumber")]
    public string? SerialNumber { get; set; }

    [BsonElement("lastMaintenance")]
    public string? LastMaintenance { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("location")]
    public string? Location { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


[BsonIgnoreExtraElements]
public class WardBooking
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("wardType")]
    public string WardType { get; set; } = string.Empty;

    [BsonElement("floor")]
    public int Floor { get; set; }

    [BsonElement("wardNo")]
    public string WardNo { get; set; } = string.Empty;

    [BsonElement("bedNumber")]
    public string BedNumber { get; set; } = string.Empty;

    [BsonElement("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("totalDays")]
    public int TotalDays { get; set; } = 1;

    [BsonElement("bookedDate")]
    public DateTime BookedDate { get; set; } = DateTime.UtcNow;

    [BsonElement("totalBill")]
    public decimal TotalBill { get; set; }

    [BsonElement("isBooked")]
    public bool IsBooked { get; set; } = true;

    [BsonElement("paid")]
    public bool Paid { get; set; } = false;

    [BsonElement("status")]
    public string Status { get; set; } = "booked";

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class CabinBooking
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("cabinType")]
    public string CabinType { get; set; } = "single";

    [BsonElement("floor")]
    public int Floor { get; set; }

    [BsonElement("cabinNo")]
    public string CabinNo { get; set; } = string.Empty;

    [BsonElement("cabinNumber")]
    public string CabinNumber { get; set; } = string.Empty;

    [BsonElement("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("totalDays")]
    public int TotalDays { get; set; } = 1;

    [BsonElement("bookedDate")]
    public DateTime BookedDate { get; set; } = DateTime.UtcNow;

    [BsonElement("totalBill")]
    public decimal TotalBill { get; set; }

    [BsonElement("isBooked")]
    public bool IsBooked { get; set; } = true;

    [BsonElement("paid")]
    public bool Paid { get; set; } = false;

    [BsonElement("status")]
    public string Status { get; set; } = "booked";

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class Prescription
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("doctorName")]
    public string DoctorName { get; set; } = string.Empty;

    [BsonElement("doctorEmail")]
    public string DoctorEmail { get; set; } = string.Empty;

    [BsonElement("doctorId")]
    public string? DoctorId { get; set; }

    [BsonElement("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("patientEmail")]
    public string PatientEmail { get; set; } = string.Empty;

    [BsonElement("patientId")]
    public string? PatientId { get; set; }

    [BsonElement("age")]
    public int Age { get; set; }

    [BsonElement("sex")]
    public string Sex { get; set; } = string.Empty;

    [BsonElement("phoneNumber")]
    public string PhoneNumber { get; set; } = string.Empty;

    [BsonElement("prescriptionText")]
    public string PrescriptionText { get; set; } = string.Empty;

    [BsonElement("medicines")]
    public List<string> Medicines { get; set; } = new();

    [BsonElement("dosageInstructions")]
    public string DosageInstructions { get; set; } = string.Empty;

    [BsonElement("notes")]
    public string? Notes { get; set; }

    [BsonElement("date")]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class TestServiceItem
{
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("type")]
    public string Type { get; set; } = "Test";
}

[BsonIgnoreExtraElements]
public class TestAndServicesBill
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("doctorName")]
    public string DoctorName { get; set; } = string.Empty;

    [BsonElement("doctorEmail")]
    public string DoctorEmail { get; set; } = string.Empty;

    [BsonElement("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("patientEmail")]
    public string PatientEmail { get; set; } = string.Empty;

    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    [BsonElement("selectedItems")]
    public List<TestServiceItem> SelectedItems { get; set; } = new();

    [BsonElement("totalBill")]
    public decimal TotalBill { get; set; }

    [BsonElement("paid")]
    public bool Paid { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MedicineBill
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("items")]
    public List<MedicineBillItem> Items { get; set; } = new();

    [BsonElement("totalAmount")]
    public decimal TotalAmount { get; set; }

    [BsonElement("paymentStatus")]
    public string PaymentStatus { get; set; } = "Paid";

    [BsonElement("date")]
    public DateTime Date { get; set; } = DateTime.UtcNow;
}

public class MedicineBillItem
{
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("quantity")]
    public int Quantity { get; set; }

    [BsonElement("price")]
    public decimal Price { get; set; }
}
