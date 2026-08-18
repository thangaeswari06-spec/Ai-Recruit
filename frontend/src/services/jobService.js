const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeaders() {
  const { supabase } = await import("../lib/supabaseClient");
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export const jobService = {
  async listJobs({ status, search } = {}) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const res = await fetch(`${API_BASE}/jobs?${params}`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load jobs");
    const { jobs } = await res.json();
    return jobs;
  },

  async getJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load job");
    const { job } = await res.json();
    return job;
  },

  // Calls backend -> n8n Workflow 1 (job-intelligence): AI JD + skills + bias check + publish
  async createJobWithAI({ title, department, location, experience_level, notes }) {
    const res = await fetch(`${API_BASE}/jobs/ai-create`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ title, department, location, experience_level, notes }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "AI job creation failed");
    return res.json();
  },

  // Manual create (no AI) — used by CreateJob.jsx's manual save button
  async createJob(job) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to create job");
    const { job: created } = await res.json();
    return created;
  },

  async updateJob(id, updates) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to update job");
    const { job } = await res.json();
    return job;
  },

  async closeJob(id) {
    return this.updateJob(id, { status: "closed" });
  },

  async deleteJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to delete job");
  },
};

export default jobService;