using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HospitalManagement.Api.Models;

[BsonIgnoreExtraElements]
public class Patient
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("password")]
    public string Password { get; set; } = string.Empty;

    [BsonElement("sex")]
    public string Sex { get; set; } = "Male";

    [BsonElement("dateOfBirth")]
    public DateTime DateOfBirth { get; set; }

    [BsonElement("mobileNumber")]
    public string MobileNumber { get; set; } = string.Empty;

    [BsonElement("bloodGroup")]
    public string? BloodGroup { get; set; }

    [BsonElement("age")]
    public int? Age { get; set; }

    [BsonElement("difficulty")]
    public string? Difficulty { get; set; }

    [BsonElement("beendignosed")]
    public string? Beendignosed { get; set; }

    [BsonElement("condition")]
    public string? Condition { get; set; }

    [BsonElement("weight")]
    public string Weight { get; set; } = "--";

    [BsonElement("bloodPressure")]
    public string BloodPressure { get; set; } = "--";

    [BsonElement("bloodSugar")]
    public string BloodSugar { get; set; } = "--";

    [BsonElement("lastCheckup")]
    public DateTime? LastCheckup { get; set; }

    [BsonElement("diagnosis")]
    public string Diagnosis { get; set; } = "General Checkup";

    [BsonElement("status")]
    public string Status { get; set; } = "Stable";

    [BsonElement("lastVisit")]
    public string LastVisit { get; set; } = DateTime.UtcNow.ToShortDateString();

    [BsonElement("theme")]
    public string Theme { get; set; } = "light";

    [BsonElement("profilePicture")]
    public string? ProfilePicture { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
