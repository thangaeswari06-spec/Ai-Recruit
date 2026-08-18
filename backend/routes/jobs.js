import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { n8nService } from "../services/n8nService.js";
import { logAudit } from "../services/auditLogger.js";

const router = Router();

// PUBLIC — candidate portal uses this to browse open jobs (no login needed)
router.get("/public/open", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("id, title, department, location, description, experience_level, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ jobs: data });
});

// PUBLIC — single open job details for the apply page
router.get("/public/:id", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("id, title, department, location, description, experience_level, status")
    .eq("id", req.params.id)
    .eq("status", "open")
    .single();
  if (error) return res.status(404).json({ error: "Job not found or closed." });
  res.json({ job: data });
});

router.get("/", verifyToken, async (req, res) => {
  const { status, search } = req.query;
  let query = supabaseAdmin.from("jobs").select("*, applications(count)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("title", `%${search}%`);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ jobs: data });
});

router.get("/:id", verifyToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*, applications(*, candidates(*))")
    .eq("id", req.params.id)
    .single();
  if (error) return res.status(404).json({ error: "Job not found." });
  res.json({ job: data });
});

// Manual job creation (no AI) — used by CreateJob.jsx manual save button
router.post("/", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  const payload = { ...req.body, status: req.body.status || "open" };
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert(payload)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  await logAudit({ userId: req.user.id, action: "manual_create_job", targetTable: "jobs", targetId: data.id });
  res.json({ job: data });
});

router.post("/ai-create", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  try {
    const { title, department, location, experience_level, notes } = req.body;
    const result = await n8nService.generateJob({ title, department, location, experience_level, notes });
    await logAudit({ userId: req.user.id, action: "ai_create_job", targetTable: "jobs", targetId: result?.job?.id });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.patch("/:id", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  await logAudit({ userId: req.user.id, action: "update_job", targetTable: "jobs", targetId: req.params.id });
  res.json({ job: data });
});

router.delete("/:id", verifyToken, checkRole("admin"), async (req, res) => {
  const { error } = await supabaseAdmin.from("jobs").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  await logAudit({ userId: req.user.id, action: "delete_job", targetTable: "jobs", targetId: req.params.id });
  res.json({ success: true });
});

export default router;