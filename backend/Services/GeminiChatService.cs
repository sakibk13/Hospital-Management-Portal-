using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using MongoDB.Driver;
using HospitalManagement.Api.Models;

namespace HospitalManagement.Api.Services;

public class GeminiChatService
{
    private readonly MongoDbService _db;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    private static readonly Dictionary<string, string> Fallbacks = new(StringComparer.OrdinalIgnoreCase)
    {
        ["blood donate"] = "Thank you for your interest in donating blood. Visit our Blood Bank page at /blood-bank to learn more.",
        ["blood bank"] = "Our Blood Bank service at /blood-bank offers real-time blood stock, donor registration, and recipient tracking.",
        ["blood group"] = "Understanding blood compatibility: O- is universal donor, AB+ is universal recipient.",
        ["appointment"] = "To book an appointment, please visit the Doctors page at /doctors, choose a specialist, and click Book Appointment.",
        ["health card"] = "Our Health Card allows you to pay bills, buy medicines, and earn reward points. Sign in to your patient account to access it.",
        ["pharmacy"] = "Our Pharmacy at /pharmacy features all essential medicines with transparent pricing and direct ordering."
    };

    public GeminiChatService(MongoDbService db, HttpClient httpClient, IConfiguration config)
    {
        _db = db;
        _httpClient = httpClient;
        _apiKey = config["Gemini:ApiKey"] ?? string.Empty;
        _model = config["Gemini:Model"] ?? "gemini-1.5-flash";
    }

    public async Task<string> GenerateResponseAsync(string userMessage)
    {
        // 1. Build live grounded context from MongoDB
        string liveContext = await BuildLiveContextAsync();

        // 2. Prepare system prompt with safety rules
        string systemPrompt = $@"You are HealingWave Assistant, a friendly and highly knowledgeable virtual assistant for the HealingWave Hospital Web Portal.
Answer the user's question concisely (2-4 sentences) using the LIVE HOSPITAL DATA provided below.
Guidelines:
1. Always use markdown links in the format [Page Name](/route), e.g., [Doctors](/doctors), [Blood Bank](/blood-bank), [Pharmacy](/pharmacy), [Support](/support).
2. Do NOT invent fake doctor names, medicine prices, or stock counts that are not in the context.
3. You are not a medical doctor: never prescribe medicine or give definitive clinical diagnoses. Always advise consulting a specialist.

LIVE HOSPITAL DATA:
{liveContext}";

        // 3. Call Gemini API
        try
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = systemPrompt },
                            new { text = $"User: {userMessage}" }
                        }
                    }
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            var response = await _httpClient.PostAsync(url, jsonContent);
            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseString);
                var candidates = doc.RootElement.GetProperty("candidates");
                if (candidates.GetArrayLength() > 0)
                {
                    var text = candidates[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        await LogChatAsync(userMessage, text);
                        return text.Trim();
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GeminiChatService] API error: {ex.Message}");
        }

        // 4. Rule-based fallback if API call fails or quota is exceeded
        string fallbackReply = "I am here to assist you with HealingWave services. You can explore [Doctors](/doctors), check [Blood Bank](/blood-bank), or visit [Support](/support) for immediate inquiries.";
        foreach (var entry in Fallbacks)
        {
            if (userMessage.Contains(entry.Key, StringComparison.OrdinalIgnoreCase))
            {
                fallbackReply = entry.Value;
                break;
            }
        }

        await LogChatAsync(userMessage, fallbackReply);
        return fallbackReply;
    }

    private async Task<string> BuildLiveContextAsync()
    {
        var sb = new StringBuilder();

        // Aggregate statistics
        long doctorCount = await _db.Doctors.CountDocumentsAsync(_ => true);
        long medicineCount = await _db.Medicines.CountDocumentsAsync(_ => true);
        var bloodStock = await _db.BloodAvailability.Find(_ => true).ToListAsync();

        sb.AppendLine($"Hospital Overview: Total Doctors: {doctorCount}, Total Medicines in Pharmacy: {medicineCount}.");

        if (bloodStock.Count > 0)
        {
            sb.AppendLine("Live Blood Units: " + string.Join(", ", bloodStock.Select(b => $"{b.BloodGroup}: {b.Count} units")));
        }

        // Sample doctors
        var doctors = await _db.Doctors.Find(_ => true).Limit(5).ToListAsync();
        if (doctors.Count > 0)
        {
            sb.AppendLine("Specialist Doctors Available:");
            foreach (var d in doctors)
            {
                sb.AppendLine($"- Dr. {d.FirstName} {d.LastName} ({d.Specialty}, {d.Department}), Degrees: {d.Degrees}, Schedule: {d.Availability}");
            }
        }

        return sb.ToString();
    }

    private async Task LogChatAsync(string userMsg, string botMsg)
    {
        try
        {
            await _db.ChatbotLogs.InsertOneAsync(new ChatbotLog
            {
                UserMessage = userMsg,
                BotMessage = botMsg,
                Timestamp = DateTime.UtcNow
            });
        }
        catch { /* Non-blocking */ }
    }
}
