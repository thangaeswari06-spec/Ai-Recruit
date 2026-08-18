import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        error: "Missing authorization token.",
      });
    }

    // Get logged-in Supabase user
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: "Invalid or expired token.",
      });
    }

    // Get profile from public.users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);

      return res.status(500).json({
        error: "Failed to load user profile.",
      });
    }

    if (!profile) {
      console.error("No profile found for user:", data.user.id);

      return res.status(403).json({
        error: "User profile not found.",
      });
    }

    console.log("Authenticated user:", data.user.email);
    console.log("User role:", profile.role);

    req.user = data.user;
    req.profile = profile;

    next();
  } catch (error) {
    console.error("verifyToken error:", error);

    return res.status(500).json({
      error: "Authentication error.",
    });
  }
}

export default verifyToken;