import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export async function logAudit({ userId, action, targetTable, targetId }) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userId,
      action,
      target_table: targetTable,
      target_id: targetId,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}

export default logAudit;