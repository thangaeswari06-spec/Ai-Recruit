import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { isValidEmail } from "../../utils/validators";
import GoogleButton from "./GoogleButton";
import SignalMeter from "../common/SignalMeter";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email.";
    if (!form.password) errs.password = "Password is required.";
    if (Object.keys(errs).length) return setErrors(errs);

    setSubmitting(true);
    setAuthError(null);
    try {
      await signIn(form);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <p className="auth-hero-eyebrow">AI Recruit</p>
          <h1 className="auth-hero-title">Every resume becomes a signal.</h1>
          <p className="auth-hero-sub">Upload, score, and rank candidates against a role in minutes — not a spreadsheet in sight.</p>
          <div className="auth-hero-card">
            <div className="auth-hero-card-row">
              <span className="text-sm" style={{ color: "#cbd0e0" }}>Priya Sharma — AI/ML Engineer</span>
              <SignalMeter score={94} size="sm" />
            </div>
            <div className="auth-hero-card-row">
              <span className="text-sm" style={{ color: "#cbd0e0" }}>Rahul Raj — AI/ML Engineer</span>
              <SignalMeter score={72} size="sm" />
            </div>
            <div className="auth-hero-card-row">
              <span className="text-sm" style={{ color: "#cbd0e0" }}>Karthik M — AI/ML Engineer</span>
              <SignalMeter score={65} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="flex items-center gap-8" style={{ marginBottom: 40 }}>
          <div className="sidebar-logo-badge">AR</div>
          <span style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>AI Recruit</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-display)" }}>Welcome back</h1>
        <p className="text-muted text-sm" style={{ marginTop: 6, marginBottom: 24 }}>Sign in to manage jobs, candidates and interviews.</p>

        {authError && <p className="form-error" style={{ marginBottom: 12 }}>{authError}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="flex justify-between" style={{ marginBottom: 20 }}>
            <label className="flex items-center gap-8 text-sm text-muted">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="#" className="text-sm" style={{ color: "var(--signal)", fontWeight: 600 }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-divider"><span className="line" /> or <span className="line" /></div>
        <GoogleButton />

        <p className="text-sm text-muted mt-24">
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Create one
          </Link>
        </p>

        <p className="text-sm text-muted mt-8">
          Applying for a job?{" "}
          <Link
            to="/portal/jobs"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Go to the candidate portal
          </Link>
        </p>
      </div>
    </div>
  );
}