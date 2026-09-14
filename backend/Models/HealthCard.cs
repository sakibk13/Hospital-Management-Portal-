using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace HospitalManagement.Api.Models;

[BsonIgnoreExtraElements]
public class HealthCard
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("patientName")]
    [JsonPropertyName("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("email")]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("phoneNumber")]
    [JsonPropertyName("phoneNumber")]
    public string PhoneNumber { get; set; } = string.Empty;

    [BsonElement("bloodGroup")]
    [JsonPropertyName("bloodGroup")]
    public string BloodGroup { get; set; } = string.Empty;

    [BsonElement("topUpAmount")]
    [JsonPropertyName("topUpAmount")]
    public decimal TopUpAmount { get; set; } = 0;

    [BsonElement("cardNumber")]
    [JsonPropertyName("cardNumber")]
    public string CardNumber { get; set; } = string.Empty;

    [BsonElement("tier")]
    [JsonPropertyName("tier")]
    public string Tier { get; set; } = "Premier Gold";

    [BsonElement("points")]
    [JsonPropertyName("points")]
    public int Points { get; set; } = 0;

    [BsonElement("validThru")]
    [JsonPropertyName("validThru")]
    public string ValidThru { get; set; } = "12/28";

    [BsonElement("createdAt")]
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [JsonPropertyName("updatedAt")]
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
}
