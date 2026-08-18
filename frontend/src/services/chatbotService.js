const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeaders() {
  const { supabase } = await import("../lib/supabaseClient");
  const { data: { session } } = await supabase.auth.getSession();
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` };
}

export const chatbotService = {
  async sendMessage(message) {
    let res;
    try {
      res = await fetch(`${API_BASE}/chatbot/message`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ message }),
      });
    } catch (networkErr) {
      throw new Error("Can't reach the backend. Is `npm run dev` running in /backend?");
    }

    let data;
    try { data = await res.json(); } catch { data = {}; }

    if (!res.ok) {
      throw new Error(data.error || `Copilot request failed (${res.status})`);
    }

    // n8n Workflow 4 may return { reply }, { message }, or { answer } depending on the last node —
    // handle all three so the frontend never silently shows "No answer returned" unnecessarily.
    const reply = data.reply ?? data.message ?? data.answer ?? data.output;
    if (!reply) {
      throw new Error("The AI didn't return an answer. Check the n8n workflow's final Respond node returns a `reply` field.");
    }
    return reply;
  },
};

export default chatbotService;