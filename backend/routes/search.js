import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "q is required." });

  const [{ data: jobs }, { data: candidates }] = await Promise.all([
    supabaseAdmin.from("jobs").select("id, title, department").ilike("title", `%${q}%`).limit(10),
    supabaseAdmin.from("candidates").select("id, name, email").ilike("name", `%${q}%`).limit(10),
  ]);
  res.json({ jobs: jobs || [], candidates: candidates || [] });
});

export default router;