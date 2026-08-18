import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { n8nService } from "../services/n8nService.js";
import { logAudit } from "../services/auditLogger.js";
import { calendarService } from "../services/calendarservice.js";
import { emailService } from "../services/emailService.js";
 
const router = Router();
 
router.get("/", verifyToken, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("interviews")
    .select("*, applications(*, candidates(*), jobs(title))")
    .order("scheduled_at", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ interviews: data });
});
 
router.post("/", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  const { application_id, interviewer_id, scheduled_at, questions } = req.body;
  const { data, error } = await supabaseAdmin
    .from("interviews")
    .insert({ application_id, interviewer_id, scheduled_at, questions, status: "scheduled" })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
 
  // Optional: create a Google Calendar event with a reminder, if the user connected a Google account
  if (req.body.google_refresh_token) {
    try {
      await calendarService.createInterviewEvent({
        refreshToken: req.body.google_refresh_token,
        summary: "Candidate interview",
        description: questions,
        startTime: scheduled_at,
        attendeeEmails: req.body.attendee_emails || [],
        reminderMinutesBefore: req.body.reminder_minutes || 30,
      });
    } catch (e) {
      console.error("Calendar event creation failed:", e.message);
    }
  }
 
  // Always send an immediate confirmation email to the candidate (and the
  // interviewer, if an email was passed) with the interview date/time — this
  // is the reminder that "whoever's interview is scheduled" now gets.
  try {
    const { data: appRow } = await supabaseAdmin
      .from("applications")
      .select("*, candidates(name, email), jobs(title)")
      .eq("id", application_id)
      .single();
 
    const when = new Date(scheduled_at).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });
 
    if (appRow?.candidates?.email) {
      await emailService.send({
        to: appRow.candidates.email,
        subject: `Interview scheduled — ${appRow.jobs?.title || "your application"}`,
        text: `Hi ${appRow.candidates.name || ""},\n\nYour interview for ${appRow.jobs?.title || "the role"} is scheduled on ${when}.\n\nWe'll be in touch with any further details before then.\n\n— AI Recruit`,
      });
    }
 
    if (req.body.interviewer_email) {
      await emailService.send({
        to: req.body.interviewer_email,
        subject: `Interview reminder — ${appRow?.candidates?.name || "candidate"} for ${appRow?.jobs?.title || "a role"}`,
        text: `You're scheduled to interview ${appRow?.candidates?.name || "a candidate"} for ${appRow?.jobs?.title || "a role"} on ${when}.`,
      });
    }
  } catch (e) {
    console.error("Interview confirmation email failed:", e.message);
  }
 
  res.json({ interview: data });
});
 
router.post("/:id/feedback", verifyToken, async (req, res) => {
  const { rating, feedback, recommendation } = req.body;
  const { data, error } = await supabaseAdmin
    .from("interviews")
    .update({ rating, feedback, recommendation, status: "completed" })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
 
  try {
    const decision = await n8nService.triggerHiringDecision({ interview_id: req.params.id });
    res.json({ interview: data, decision });
  } catch (err) {
    res.json({ interview: data, decisionError: err.message });
  }
});
 
router.post("/:id/approve", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  const { approved } = req.body;
  try {
    const result = await n8nService.submitHiringApproval({ interview_id: req.params.id, approved });
    await logAudit({
      userId: req.user.id,
      action: approved ? "approve_hire" : "reject_hire",
      targetTable: "interviews",
      targetId: req.params.id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});
 
export default router;
 