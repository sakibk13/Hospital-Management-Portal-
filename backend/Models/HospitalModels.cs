using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HospitalManagement.Api.Models;

[BsonIgnoreExtraElements]
public class BloodAvailability
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("bloodGroup")]
    public string BloodGroup { get; set; } = string.Empty;

    [BsonElement("count")]
    public int Count { get; set; } = 0;
}

[BsonIgnoreExtraElements]
public class Medicine
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("genericName")]
    public string GenericName { get; set; } = string.Empty;

    [BsonElement("dosageForm")]
    public string DosageForm { get; set; } = string.Empty;

    [BsonElement("strength")]
    public string Strength { get; set; } = string.Empty;

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("strip")]
    public int Strip { get; set; } = 10;

    [BsonElement("manufacturer")]
    public string Manufacturer { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("image")]
    public string Image { get; set; } = string.Empty;
}

[BsonIgnoreExtraElements]
public class ChatbotLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("userMessage")]
    public string UserMessage { get; set; } = string.Empty;

    [BsonElement("botMessage")]
    public string BotMessage { get; set; } = string.Empty;

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
