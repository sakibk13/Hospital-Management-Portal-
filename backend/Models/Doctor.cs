using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HospitalManagement.Api.Models;

[BsonIgnoreExtraElements]
public class DoctorSettings
{
    [BsonElement("twoFactor")]
    public bool TwoFactor { get; set; } = false;

    [BsonElement("notifications")]
    public DoctorNotifications Notifications { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class DoctorNotifications
{
    [BsonElement("email")]
    public bool Email { get; set; } = true;

    [BsonElement("sms")]
    public bool Sms { get; set; } = true;

    [BsonElement("promotions")]
    public bool Promotions { get; set; } = false;
}

[BsonIgnoreExtraElements]
public class Doctor
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [BsonElement("lastName")]
    public string LastName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("sex")]
    public string? Sex { get; set; }

    [BsonElement("dateOfBirth")]
    public DateTime? DateOfBirth { get; set; }

    [BsonElement("mobileNumber")]
    public string MobileNumber { get; set; } = string.Empty;

    [BsonElement("password")]
    public string Password { get; set; } = string.Empty;

    [BsonElement("bloodGroup")]
    public string? BloodGroup { get; set; }

    [BsonElement("age")]
    public int? Age { get; set; }

    [BsonElement("degrees")]
    public string? Degrees { get; set; }

    [BsonElement("institute")]
    public string? Institute { get; set; }

    [BsonElement("specialty")]
    public string? Specialty { get; set; }

    [BsonElement("department")]
    public string? Department { get; set; }

    [BsonElement("availability")]
    public string? Availability { get; set; }

    [BsonElement("profilePicture")]
    public string? ProfilePicture { get; set; }

    [BsonElement("settings")]
    public DoctorSettings Settings { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
