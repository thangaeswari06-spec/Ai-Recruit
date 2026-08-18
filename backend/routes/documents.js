import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  const { application_id, type } = req.query;
  let query = supabaseAdmin.from("documents").select("*").order("sent_at", { ascending: false });
  if (application_id) query = query.eq("application_id", application_id);
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ documents: data });
});

export default router;