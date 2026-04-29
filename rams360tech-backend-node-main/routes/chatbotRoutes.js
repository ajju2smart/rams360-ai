import { Router } from "express";
import { handleChatMessage } from "../controllers/chatbotController.js";

const router = Router();

// Public route — chatbot is accessible on login page (no auth required)
router.post("/ask", handleChatMessage);

export default router;
