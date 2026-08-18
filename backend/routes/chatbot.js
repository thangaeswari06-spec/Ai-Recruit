import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { n8nService } from "../services/n8nService.js";

const router = Router();

router.post("/message", verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "Message is required." });

  try {
    const result = await n8nService.copilotChat({ message, user_id: req.user.id });
    const reply = result.reply ?? result.message ?? result.answer ?? result.output;
    res.json({ reply, raw: result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;