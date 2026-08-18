const API_BASE = import.meta.env.VITE_API_BASE_URL;
async function authHeaders() {
  const { supabase } = await import("../lib/supabaseClient");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    Authorization: `Bearer ${session?.access_token || ""}`,
    "Content-Type": "application/json",
  };
}

// Get dashboard funnel counts
export async function getFunnelCounts() {
  const res = await fetch(`${API_BASE}/admin/analytics/funnel`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load funnel counts");
  }

  const data = await res.json();

  return data.counts || data;
}

// Get recent activities
export async function getRecentActivities() {
  const res = await fetch(`${API_BASE}/admin/analytics/recent-activities`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load recent activities");
  }

  const data = await res.json();

  return data.activities || data;
}

// Existing functions
export async function getAuditLogs() {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load audit logs");
  }

  const { logs } = await res.json();

  return logs;
}

export async function getDocuments(applicationId) {
  const params = applicationId
    ? `?application_id=${applicationId}`
    : "";

  const res = await fetch(`${API_BASE}/documents${params}`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load documents");
  }

  const { documents } = await res.json();

  return documents;
}

const analyticsService = {
  getFunnelCounts,
  getRecentActivities,
  getAuditLogs,
  getDocuments,
};

export default analyticsService;