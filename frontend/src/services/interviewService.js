const API_BASE = import.meta.env.VITE_API_BASE_URL;
 
async function authHeaders() {
  const { supabase } = await import("../lib/supabaseClient");
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
}
 
export const interviewService = {
  async listInterviews() {
    const res = await fetch(`${API_BASE}/interview`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load interviews");
    const { interviews } = await res.json();
    return interviews;
  },
 
  // Real interviewer accounts (id/name/email) — used to populate the
  // "Interviewer" dropdown so we send a real UUID, not free-typed text.
  async listInterviewers() {
    const res = await fetch(`${API_BASE}/admin/interviewers`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load interviewers");
    const { interviewers } = await res.json();
    return interviewers;
  },
 
  async scheduleInterview({ application_id, interviewer_id, interviewer_email, scheduled_at, questions }) {
    const res = await fetch(`${API_BASE}/interview`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ application_id, interviewer_id, interviewer_email, scheduled_at, questions }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to schedule interview");
    const { interview } = await res.json();
    return interview;
  },
 
  // Completing feedback triggers backend -> n8n Workflow 5 (hiring-decision)
  async submitFeedback(interviewId, { rating, feedback, recommendation }) {
    const res = await fetch(`${API_BASE}/interview/${interviewId}/feedback`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ rating, feedback, recommendation }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to submit feedback");
    return res.json();
  },
 
  // Recruiter approval callback -> n8n Wait node resumes Workflow 5
  async submitApproval(interviewId, approved) {
    const res = await fetch(`${API_BASE}/interview/${interviewId}/approve`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to submit approval");
    return res.json();
  },
};
 
export default interviewService;
 