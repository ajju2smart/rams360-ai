import { askChatbot } from "../services/chatbotService.js";

/**
 * POST /api/v1/chatbot/ask
 * Body: { message: string, history?: Array }
 */
export async function handleChatMessage(req, res, next) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ status: "fail", message: "message is required" });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ status: "fail", message: "message too long (max 2000 chars)" });
    }

    const reply = await askChatbot(message.trim(), history);

    return res.status(200).json({
      status: "success",
      data: { reply },
    });
  } catch (err) {
    console.error("[Chatbot] Error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
}
