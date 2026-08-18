import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { emailService } from "../services/emailService.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { email, password, name, role = "recruiter" } = req.body;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) return res.status(400).json({ error: error.message });

  await supabaseAdmin.from("users").insert({ id: data.user.id, email, name, role });
  try { await emailService.sendWelcomeEmail(email, name); } catch (e) { console.error("Welcome email failed:", e.message); }
  res.json({ user: data.user });
});

router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user, profile: req.profile });
});

router.patch("/me", verifyToken, async (req, res) => {
  const { name, phone, department, avatar_url } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (department !== undefined) updates.department = department;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data });
});

export default router;