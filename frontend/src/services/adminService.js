const API_BASE = import.meta.env.VITE_API_BASE_URL;
 
async function authHeaders() {
  const { supabase } = await import("../lib/supabaseClient");
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" };
}
 
export const adminService = {
  async listUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to load team.");
    const { users } = await res.json();
    return users;
  },
  async inviteUser({ email, name, role }) {
    const res = await fetch(`${API_BASE}/admin/invite-user`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ email, name, role }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to invite team member.");
    return res.json();
  },
  // Live n8n webhook status — pings each of the 5 workflow webhooks through
  // the backend (avoids CORS issues calling n8n directly from the browser)
  // and reports whether each one is really Active, not just configured.
  async getN8nStatus() {
    const res = await fetch(`${API_BASE}/admin/n8n-status`, { headers: await authHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to check n8n status.");
    return res.json();
  },
};
 
export default adminService;
 