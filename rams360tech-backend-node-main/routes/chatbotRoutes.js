import { Router } from "express";
import { handleChatMessage } from "../controllers/chatbotController.js";
import { verifyToken } from "../utils/tokenAuth.js";

const router = Router();

router.post("/ask", verifyToken, handleChatMessage);

export default router;
