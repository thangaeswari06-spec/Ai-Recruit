import fetch from "node-fetch";
import FormData from "form-data";

const N8N_BASE = process.env.N8N_WEBHOOK_BASE;

async function postJSON(path, body) {
  const res = await fetch(`${N8N_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error(data?.error || `n8n workflow "${path}" failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const n8nService = {
  generateJob({ title, department, location, experience_level, notes }) {
    return postJSON("job-intelligence", { title, department, location, experience_level, notes });
  },

  async uploadResume({ fileBuffer, filename, mimetype, job_id, candidate_email, candidate_name, candidate_phone }) {
    const form = new FormData();
    form.append("resume", fileBuffer, { filename, contentType: mimetype });
    if (job_id) form.append("job_id", job_id);
    if (candidate_email) form.append("candidate_email", candidate_email);
    // Forwarded so the n8n workflow can use the form values directly instead of
    // relying only on AI extraction from the PDF.
    if (candidate_name) form.append("candidate_name", candidate_name);
    if (candidate_phone) form.append("candidate_phone", candidate_phone);

    let res;
    try {
      res = await fetch(`${N8N_BASE}/resume-upload`, {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      });
    } catch (networkErr) {
      const err = new Error("Resume processing service is unreachable right now. Please try again shortly.");
      err.status = 502;
      throw err;
    }
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) {
      const err = new Error(data?.error || `Resume processing failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  },

  evaluateCandidates({ job_id }) {
    return postJSON("evaluate-candidates", { job_id });
  },

  copilotChat({ message, user_id }) {
    return postJSON("copilot-chat", { message, user_id });
  },

  triggerHiringDecision({ interview_id }) {
    return postJSON("hiring-decision", { interview_id });
  },
  submitHiringApproval({ interview_id, approved }) {
    return postJSON("hiring-decision", { interview_id, approved });
  },
};

export default n8nService;