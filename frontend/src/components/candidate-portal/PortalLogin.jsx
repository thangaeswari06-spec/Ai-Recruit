import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { isValidEmail } from "../../utils/validators";

export default function PortalLogin() {
  const { signIn, signUpCandidate } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    if (mode === "signup" && !form.name) errs.name = "Name is required.";
    if (Object.keys(errs).length) return setErrors(errs);

    setSubmitting(true);
    setAuthError(null);
    try {
      if (mode === "signup") {
        await signUpCandidate({ email: form.email, password: form.password, name: form.name });
        setSuccess(true);
        setMode("login");
      } else {
        await signIn({ email: form.email, password: form.password });
        navigate("/portal/jobs");
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: "100%", maxWidth: 420 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-8">
            <div className="sidebar-logo-badge">AR</div>
            <span style={{ fontWeight: 600 }}>AI Recruit — Candidate Portal</span>
          </div>
          <Link to="/login" className="text-xs text-muted">Staff sign in →</Link>
        </div>

        <p className="card-title">{mode === "login" ? "Sign in to track your applications" : "Create your candidate account"}</p>
        <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setAuthError(null); setErrors({}); }}
            style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", padding: 0 }}
          >
            {mode === "login" ? "Create an account" : "Sign in instead"}
          </button>
        </p>

        {success && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 12 }}>Account created! Sign in to continue.</p>}
        {authError && <p className="form-error" style={{ marginBottom: 12 }}>{authError}</p>}

        {mode === "signup" && (
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
          {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <p className="text-sm text-muted mt-16">
          <Link to="/portal/jobs" style={{ color: "var(--primary)" }}>← Browse open roles without signing in</Link>
        </p>
      </form>
    </div>
  );
}