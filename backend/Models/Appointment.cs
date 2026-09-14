using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace HospitalManagement.Api.Models;

[BsonIgnoreExtraElements]
public class Appointment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("department")]
    public string Department { get; set; } = string.Empty;

    [BsonElement("doctor")]
    [JsonPropertyName("doctor")]
    public string? DoctorId { get; set; }

    [BsonElement("doctorName")]
    public string DoctorName { get; set; } = string.Empty;

    [BsonElement("doctorEmail")]
    public string DoctorEmail { get; set; } = string.Empty;

    [BsonElement("date")]
    public DateTime Date { get; set; }

    [BsonElement("timeSlot")]
    public string TimeSlot { get; set; } = string.Empty;

    [BsonElement("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [BsonElement("patientEmail")]
    public string PatientEmail { get; set; } = string.Empty;

    [BsonElement("patientPhone")]
    public string PatientPhone { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = "pending";

    [BsonElement("paymentRequest")]
    public string PaymentRequest { get; set; } = "request payment";

    [BsonElement("paidStatus")]
    public string PaidStatus { get; set; } = "unpaid";
}
