import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();

// Recruiter-only: full candidate pipeline with scores
router.get("/", verifyToken, checkRole("admin", "recruiter", "hr"), async (req, res) => {
  const { job_id, stage, search, export: exportCsv } = req.query;
  let query = supabaseAdmin
    .from("applications")
    .select("*, candidates(*), jobs(title)")
    .order("score", { ascending: false });
  if (job_id) query = query.eq("job_id", job_id);
  if (stage) query = query.eq("stage", stage);
  if (search) query = query.ilike("candidates.name", `%${search}%`);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  if (exportCsv === "csv") {
    const rows = data || [];
    const headers = ["candidate_name", "email", "job_title", "stage", "score", "created_at"];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push([r.candidates?.name, r.candidates?.email, r.jobs?.title, r.stage, r.score, r.created_at].map((v) => JSON.stringify(v ?? "")).join(","));
    }
    res.setHeader("Content-Type", "text/csv");
    return res.send(lines.join("\n"));
  }

  res.json({ applications: data });
});

// Candidate-safe: a logged-in candidate can see only their OWN applications
// (uses their verified email from the auth token, never a client-supplied one)
// NOTE: this must come BEFORE "/:id" or Express will treat "mine" as an :id
router.get("/mine", verifyToken, async (req, res) => {
  const email = req.user.email;
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("*, jobs(title), candidates!inner(email)")
    .eq("candidates.email", email);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ applications: data || [] });
});

router.get("/:id", verifyToken, checkRole("admin", "recruiter", "hr"), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("*, candidates(*), jobs(*), notes(*)")
    .eq("id", req.params.id)
    .single();
  if (error) return res.status(404).json({ error: "Application not found." });
  res.json({ application: data });
});

router.patch("/:id/stage", verifyToken, checkRole("admin", "recruiter", "hr"), async (req, res) => {
  const { stage } = req.body;
  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({ stage })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ application: data });
});

router.post("/:id/notes", verifyToken, checkRole("admin", "recruiter", "hr"), async (req, res) => {
  const { note, tags } = req.body;
  const { data, error } = await supabaseAdmin
    .from("notes")
    .insert({ application_id: req.params.id, author_id: req.user.id, note, tags })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ note: data });
});

router.patch("/profile", verifyToken, async (req, res) => {
  const { email, name, phone, location } = req.body;
  const { data, error } = await supabaseAdmin
    .from("candidates")
    .update({ name, phone, location })
    .eq("email", email)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ candidate: data });
});

export default router;