const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeaders(json = true) {
  const { supabase } = await import("../lib/supabaseClient");
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { Authorization: `Bearer ${session?.access_token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export const candidateService = {
  async listApplications({ jobId, stage, search } = {}) {
    const params = new URLSearchParams();
    if (jobId) params.set("job_id", jobId);
    if (stage) params.set("stage", stage);
    if (search) params.set("search", search);
    const res = await fetch(`${API_BASE}/candidates?${params}`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load candidates");
    const { applications } = await res.json();
    return applications;
  },

  async getApplication(id) {
    const res = await fetch(`${API_BASE}/candidates/${id}`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load application");
    const { application } = await res.json();
    return application;
  },

  // Calls backend -> n8n Workflow 2 (resume-upload): extraction, parsing, embedding, insert
  // Calls backend -> n8n Workflow 2 (resume-upload): extraction, parsing, embedding, insert
  async uploadResume(file, { jobId, candidateEmail, candidateName, candidatePhone } = {}) {
    const form = new FormData();
    form.append("resume", file);
    if (jobId) form.append("job_id", jobId);
    if (candidateEmail) form.append("candidate_email", candidateEmail);
    if (candidateName) form.append("candidate_name", candidateName);
    if (candidatePhone) form.append("candidate_phone", candidatePhone);

    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: "POST",
      headers: await authHeaders(false),
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).error || "Resume processing failed");
    return res.json();
  },
  async updateStage(applicationId, stage) {
    const res = await fetch(`${API_BASE}/candidates/${applicationId}/stage`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to update stage");
    const { application } = await res.json();
    return application;
  },

  async addNote(applicationId, { note, tags }) {
    const res = await fetch(`${API_BASE}/candidates/${applicationId}/notes`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ note, tags }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to add note");
    return res.json();
  },

  // Calls backend -> n8n Workflow 3 (evaluate-candidates): vector search, AI score, rerank top 5
  async evaluateCandidates(jobId) {
    const res = await fetch(`${API_BASE}/matching/evaluate`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ job_id: jobId }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Evaluation failed");
    return res.json();
  },
};

export default candidateService;