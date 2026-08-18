import { supabase } from "../lib/supabaseClient.js";

export const authService = {
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from("users").insert({ id: data.user.id, email, name, role: "recruiter" });
    }
    return { data, error };
  },

  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: "google" }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default authService;