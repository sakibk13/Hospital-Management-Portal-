using Microsoft.AspNetCore.Mvc;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    private readonly GeminiChatService _chatService;

    public ChatbotController(GeminiChatService chatService)
    {
        _chatService = chatService;
    }

    public record ChatRequest(string Message);

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Message))
        {
            return BadRequest(new { response = "Please enter a valid message." });
        }

        var response = await _chatService.GenerateResponseAsync(request.Message);
        return Ok(new { response, source = "gemini-rag" });
    }
}
