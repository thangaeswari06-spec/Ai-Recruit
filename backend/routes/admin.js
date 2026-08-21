import { Router } from "express";
import fetch from "node-fetch";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
 
const router = Router();
 
// =====================================================
// GET AUDIT LOGS
// =====================================================
router.get(
  "/audit-logs",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*, users(name, email)")
        .order("created_at", { ascending: false })
        .limit(100);
 
      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }
 
      res.json({
        logs: data || [],
      });
    } catch (error) {
      console.error("Audit logs error:", error);
 
      res.status(500).json({
        error: error.message,
      });
    }
  }
);
 
// =====================================================
// GET USERS
// =====================================================
router.get(
  "/users",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
 
      if (error) {
        return res.status(400).json({
          error: error.message,
        });
      }
 
      res.json({
        users: data || [],
      });
    } catch (error) {
      console.error("Users error:", error);
 
      res.status(500).json({
        error: error.message,
      });
    }
  }
);
 
// =====================================================
// GET INTERVIEWERS — lightweight list (id, name, email,
// role) any recruiter/admin can read, used to populate the
// "Interviewer" dropdown on the Schedule Interview form.
// Deliberately separate from /users (admin-only, full
// profile) since scheduling only needs id+name+email and
// should work for recruiters too.
// =====================================================
router.get(
  "/interviewers",
  verifyToken,
  checkRole("admin", "recruiter"),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("id, name, email, role")
        .in("role", ["interviewer", "recruiter", "admin"])
        .order("name", { ascending: true });
 
      if (error) {
        return res.status(400).json({ error: error.message });
      }
 
      res.json({ interviewers: data || [] });
    } catch (error) {
      console.error("Interviewers error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
 
// =====================================================
// GET ANALYTICS FUNNEL
// =====================================================
router.get(
  "/analytics/funnel",
  verifyToken,
  checkRole("admin", "recruiter", "hr"),
  async (req, res) => {
    try {
      const { data: applications, error } = await supabaseAdmin
        .from("applications")
        .select("stage");
 
      if (error) {
        console.error("Funnel database error:", error);
 
        return res.status(400).json({
          error: error.message,
        });
      }
 
      const STAGE_ORDER = [
        "applied",
        "screened",
        "shortlisted",
        "interview_scheduled",
        "interviewed",
        "hired",
      ];
 
      const counts = {
        applied: 0,
        screened: 0,
        shortlisted: 0,
        interview_scheduled: 0,
        interviewed: 0,
        hired: 0,
      };
 
      (applications || []).forEach((application) => {
        let status = String(application.stage || "applied")
          .trim()
          .toLowerCase()
          .replace(/-/g, "_")
          .replace(/\s+/g, "_");
 
        if (status === "scheduled") status = "interview_scheduled";
        if (status === "rejected") return; // don't count rejected in the funnel
 
        const stageIndex = STAGE_ORDER.indexOf(status);
        if (stageIndex === -1) return;
 
        // Cumulative: a "hired" candidate also counts as applied/screened/shortlisted/etc.
        for (let i = 0; i <= stageIndex; i++) {
          counts[STAGE_ORDER[i]]++;
        }
      });
 
      res.json(counts);
    } catch (error) {
      console.error("Funnel analytics error:", error);
 
      res.status(500).json({
        error: error.message,
      });
    }
  }
);
 
// =====================================================
// GET RECENT ACTIVITIES
// =====================================================
router.get(
  "/analytics/recent-activities",
  verifyToken,
  checkRole("admin", "recruiter", "hr"),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*, users(name, email)")
        .order("created_at", { ascending: false })
        .limit(10);
 
      if (error) {
        console.error("Recent activities database error:", error);
 
        return res.status(400).json({
          error: error.message,
        });
      }
 
      const ACTION_LABELS = {
        manual_create_job: "created a job",
        ai_create_job: "created a job with AI",
        update_job: "updated a job",
        delete_job: "deleted a job",
        approve_hire: "approved a hire",
        reject_hire: "rejected a hire",
        upload_resume: "uploaded a resume",
        evaluate_candidates: "ran AI candidate evaluation",
      };
 
      const activities = (data || []).map((log) => {
        const actorName = log.users?.name || log.users?.email || "Someone";
        const actionLabel = ACTION_LABELS[log.action] || log.action?.replace(/_/g, " ") || "did something";
        return {
          id: log.id,
          message: `${actorName} ${actionLabel}`,
          created_at: log.created_at,
        };
      });
 
      res.json({
        activities,
      });
    } catch (error) {
      console.error("Recent activities error:", error);
 
      res.status(500).json({
        error: error.message,
      });
    }
  }
);
// =====================================================
// INVITE A TEAM MEMBER (admin only) — the only place a
// role other than "recruiter" or "candidate" can be set.
// =====================================================
router.post(
  "/invite-user",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    const { email, name, role } = req.body;
    const allowedRoles = ["admin", "hr", "recruiter", "interviewer"];
 
    if (!email || !name || !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: `email, name and a valid role (${allowedRoles.join(", ")}) are required.`,
      });
    }
 
    try {
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { name },
      });
      if (error) return res.status(400).json({ error: error.message });
 
      const { error: profileError } = await supabaseAdmin
        .from("users")
        .upsert({ id: data.user.id, email, name, role }, { onConflict: "id" });
      if (profileError) return res.status(400).json({ error: profileError.message });
 
      res.json({ user: data.user, role });
    } catch (error) {
      console.error("Invite user error:", error);
      res.status(500).json({ error: error.message || "Failed to invite team member." });
    }
  }
);
 
// =====================================================
// LIVE N8N WEBHOOK STATUS — pings each workflow's real
// production webhook and reports whether it's actually
// active (not just a hardcoded "Connected" badge).
//
// n8n behaviour we rely on:
//  - 404 + "not registered"  -> workflow exists but is NOT Active in n8n
//  - network error/timeout   -> n8n server itself is unreachable
//  - anything else (200/400/500 from inside the workflow) -> webhook IS
//    registered and the workflow ran, i.e. it's genuinely active.
// =====================================================
const N8N_WORKFLOWS = [
  { label: "Recruiter Intake", path: "recruiter-intake" },
  { label: "Copilot Chat", path: "copilot-chat" },
];
 
router.get(
  "/n8n-status",
  verifyToken,
  checkRole("admin", "recruiter"),
  async (req, res) => {
    const base = process.env.N8N_WEBHOOK_BASE;
 
    const results = await Promise.all(
      N8N_WORKFLOWS.map(async ({ label, path }) => {
        const url = `${base}/${path}`;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ __status_check: true }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
 
          if (response.status === 404) {
            const body = await response.text().catch(() => "");
            if (/not registered/i.test(body)) {
              return { label, path, url, status: "inactive", detail: "Workflow is not Active in n8n." };
            }
          }
 
          return { label, path, url, status: "active", detail: `Responded with HTTP ${response.status}.` };
        } catch (err) {
          return { label, path, url, status: "unreachable", detail: "n8n server did not respond — check it's running and N8N_WEBHOOK_BASE is correct." };
        }
      })
    );
 
    res.json({ base, results, checked_at: new Date().toISOString() });
  }
);
 
// =====================================================
// EXPORT ROUTER
// =====================================================
export default router;
 