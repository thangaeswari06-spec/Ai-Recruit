import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
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

// Builds a calendar-invite-style HTML email: date/time block, a
// "Join with Google Meet" button, and the plain meeting link underneath —
// same layout as a Google Calendar invite email.
function buildInterviewEmailHtml({ greetingName, introLine, whenText, meetLink }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a2e;">
    <p style="font-size: 15px;">Hi ${greetingName},</p>
    <p style="font-size: 15px; line-height: 1.5;">${introLine}</p>

    <table style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: .04em;">When</p>
          <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600;">${whenText}</p>

          ${meetLink ? `
          <a href="${meetLink}" style="display: inline-block; background: #4C5FD5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 6px; margin-bottom: 14px;">
            Join with Google Meet
          </a>
          <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280;">Meeting link</p>
          <p style="margin: 2px 0 0; font-size: 14px;"><a href="${meetLink}" style="color: #4C5FD5;">${meetLink}</a></p>
          ` : `<p style="font-size: 13px; color: #6b7280;">Meeting link will be shared shortly.</p>`}
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; color: #444; line-height: 1.5;">Please join a couple of minutes early to test your audio/video.</p>
    <p style="font-size: 14px; margin-top: 24px;">Best regards,<br/><strong>AI Recruit</strong></p>
  </div>`;
}

router.post("/", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  const { application_id, interviewer_id, scheduled_at, questions } = req.body;
  const { data, error } = await supabaseAdmin
    .from("interviews")
    .insert({ application_id, interviewer_id, scheduled_at, questions, status: "scheduled" })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  const { data: appRow } = await supabaseAdmin
    .from("applications")
    .select("*, candidates(name, email), jobs(title)")
    .eq("id", application_id)
    .single();

  const when = new Date(scheduled_at).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }) + " (India Standard Time)";

  const candidateName = appRow?.candidates?.name || "there";
  const jobTitle = appRow?.jobs?.title || "the role";

  // Create the Google Calendar event first (auto Google Meet link + a
  // reminder before the interview) so the link is ready for both emails.
  // Google Calendar's own invite also drops a reminder on each attendee's
  // calendar — that covers the "reminder" requirement automatically.
  let meetLink = null;
  if (req.body.google_refresh_token) {
    try {
      const attendees = [
        ...(appRow?.candidates?.email ? [appRow.candidates.email] : []),
        ...(req.body.interviewer_email ? [req.body.interviewer_email] : []),
        ...(req.body.attendee_emails || []),
      ];
      const event = await calendarService.createInterviewEvent({
        refreshToken: req.body.google_refresh_token,
        summary: `Interview — ${candidateName} for ${jobTitle}`,
        description: questions || "Candidate interview",
        startTime: scheduled_at,
        attendeeEmails: attendees,
        reminderMinutesBefore: req.body.reminder_minutes || 30,
      });
      meetLink = event.meetLink;
    } catch (e) {
      console.error("Calendar event creation failed:", e.message);
    }
  }

  try {
    if (appRow?.candidates?.email) {
      await emailService.send({
        to: appRow.candidates.email,
        subject: `Interview scheduled — ${jobTitle}`,
        text:
          `Hi ${candidateName},\n\nYour interview for ${jobTitle} is confirmed for ${when}.\n` +
          (meetLink ? `\nJoin via Google Meet: ${meetLink}\n` : "") +
          `\nPlease join a few minutes early. We look forward to speaking with you.\n\nBest regards,\nAI Recruit`,
        html: buildInterviewEmailHtml({
          greetingName: candidateName,
          introLine: `Your interview for <strong>${jobTitle}</strong> is confirmed.`,
          whenText: when,
          meetLink,
        }),
      });
    }

    if (req.body.interviewer_email) {
      await emailService.send({
        to: req.body.interviewer_email,
        subject: `Interview reminder — ${candidateName} for ${jobTitle}`,
        text:
          `Hi,\n\nYou're scheduled to interview ${candidateName} for ${jobTitle} on ${when}.\n` +
          (meetLink ? `\nJoin via Google Meet: ${meetLink}\n` : "") +
          `\nThanks,\nAI Recruit`,
        html: buildInterviewEmailHtml({
          greetingName: "there",
          introLine: `You're scheduled to interview <strong>${candidateName}</strong> for <strong>${jobTitle}</strong>.`,
          whenText: when,
          meetLink,
        }),
      });
    }
  } catch (e) {
    console.error("Interview confirmation email failed:", e.message);
  }

  res.json({ interview: data, meetLink });
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
  res.json({ interview: data });
});

export default router;