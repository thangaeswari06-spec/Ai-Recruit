import { supabaseAdmin } from "../lib/supabaseAdmin.js";

// Thin repository layer — routes call these instead of writing raw Supabase queries everywhere
export const supabaseService = {
  async getJobById(id) {
    const { data, error } = await supabaseAdmin.from("jobs").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async getApplicationsForJob(jobId) {
    const { data, error } = await supabaseAdmin
      .from("applications")
      .select("*, candidates(*)")
      .eq("job_id", jobId)
      .order("score", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getCandidateByEmail(email) {
    const { data } = await supabaseAdmin.from("candidates").select("*").eq("email", email).maybeSingle();
    return data;
  },

  async insertCandidate(candidate) {
    const { data, error } = await supabaseAdmin.from("candidates").insert(candidate).select().single();
    if (error) throw error;
    return data;
  },

  async updateApplicationStage(applicationId, stage) {
    const { data, error } = await supabaseAdmin
      .from("applications")
      .update({ stage })
      .eq("id", applicationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getInterviewById(id) {
    const { data, error } = await supabaseAdmin
      .from("interviews")
      .select("*, applications(*, candidates(*), jobs(*))")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async insertDocument({ application_id, type, content }) {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({ application_id, type, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async insertNotification({ user_id, message, type }) {
    const { error } = await supabaseAdmin.from("notifications").insert({ user_id, message, type });
    if (error) console.error("Notification insert failed:", error.message);
  },
};

export default supabaseService;