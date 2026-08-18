import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";
import { n8nService } from "../services/n8nService.js";
import { logAudit } from "../services/auditLogger.js";
import { resumeParser } from "../services/resumeParser.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
 
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Only PDF resumes are accepted."));
    cb(null, true);
  },
});
 
const router = Router();
 
// verifyToken made optional here: the public /portal/jobs/:jobId/apply page calls
// this route WITHOUT being logged in (candidates aren't authenticated yet at that point).
// Recruiter-side manual uploads (from Candidates page) DO send a token if the user is logged in.
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return next();
  return verifyToken(req, res, next);
}
 
router.post("/upload", optionalAuth, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No resume file uploaded." });
 
  const candidate_name = req.body.candidate_name?.trim();
  const candidate_email = req.body.candidate_email?.trim();
  const candidate_phone = req.body.candidate_phone?.trim();
 
  if (!candidate_email) {
    return res.status(400).json({ error: "candidate_email is required." });
  }
 
  try {
    // Local fallback check — fail fast on unreadable PDFs before hitting n8n
    const text = await resumeParser.extractText(req.file.buffer);
    if (!resumeParser.looksLikeResume(text)) {
      return res.status(400).json({ error: "This file doesn't look like a resume." });
    }
 
    const result = await n8nService.uploadResume({
      fileBuffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      job_id: req.body.job_id,
      candidate_email,
      candidate_name,
      candidate_phone,
    });
 
    // Safety net: guarantee the name/phone typed on the form actually lands on the
    // candidate record, even if the n8n AI-extraction step didn't return one.
    if (candidate_name) {
      const existingName = result?.candidate?.name;
      if (!existingName) {
        const { error: fallbackErr } = await supabaseAdmin
          .from("candidates")
          .update({ name: candidate_name, ...(candidate_phone ? { phone: candidate_phone } : {}) })
          .eq("email", candidate_email);
        if (fallbackErr) console.error("Candidate name fallback update failed:", fallbackErr.message);
      }
    }
 
    // Notify every admin/recruiter that a new candidate applied, so it shows
    // up in the NotificationBell in real time (it already listens on the
    // "notifications" table). This is what makes "applicants list -> admin" work.
    if (req.body.job_id) {
      try {
        const { data: staff } = await supabaseAdmin
          .from("users")
          .select("id")
          .in("role", ["admin", "recruiter"]);
 
        const { data: jobRow } = await supabaseAdmin
          .from("jobs")
          .select("title")
          .eq("id", req.body.job_id)
          .single();
 
        if (staff?.length) {
          await supabaseAdmin.from("notifications").insert(
            staff.map((u) => ({
              user_id: u.id,
              message: `${candidate_name || candidate_email} applied for ${jobRow?.title || "a role"}.`,
              type: "new_application",
            }))
          );
        }
      } catch (notifyErr) {
        console.error("Admin notification insert failed:", notifyErr.message);
      }
    }
 
    await logAudit({ userId: req.user?.id || null, action: "upload_resume", targetTable: "candidates", targetId: result?.candidate?.id });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});
 
export default router;
 