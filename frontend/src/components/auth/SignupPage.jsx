import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { validateSignupForm, passwordStrengthLabel } from "../../utils/validators";
import GoogleButton from "./GoogleButton";

const initialForm = { name: "", email: "", password: "", confirmPassword: "" };

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateSignupForm(form);
    if (Object.keys(errs).length) return setErrors(errs);
    setSubmitting(true);
    setAuthError(null);
    try {
      await signUp(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      setAuthError(err.message || "Unable to sign up.");
    } finally {
      setSubmitting(false);
    }
  }

  const strength = passwordStrengthLabel(form.password);

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <p className="auth-hero-eyebrow">AI Recruit</p>
          <h1 className="auth-hero-title">Set up your hiring workspace.</h1>
          <p className="auth-hero-sub">Post roles, screen resumes with AI, and move candidates through a real pipeline — from first signal to offer letter.</p>
          <div className="auth-hero-card">
            <div className="auth-hero-card-row"><span className="text-sm" style={{ color: "#cbd0e0" }}>Post a job</span><span style={{ color: "var(--match)", fontFamily: "var(--font-mono)", fontSize: 12 }}>01</span></div>
            <div className="auth-hero-card-row"><span className="text-sm" style={{ color: "#cbd0e0" }}>Candidates apply & get scored</span><span style={{ color: "var(--match)", fontFamily: "var(--font-mono)", fontSize: 12 }}>02</span></div>
            <div className="auth-hero-card-row"><span className="text-sm" style={{ color: "#cbd0e0" }}>Shortlist, interview, hire</span><span style={{ color: "var(--match)", fontFamily: "var(--font-mono)", fontSize: 12 }}>03</span></div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="flex items-center gap-8" style={{ marginBottom: 40 }}>
          <div className="sidebar-logo-badge">AR</div>
          <span style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>AI Recruit</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-display)" }}>Create your account</h1>
        <p className="text-muted text-sm" style={{ marginTop: 6, marginBottom: 24 }}>Sign up to get started.</p>

        {success && <p style={{ color: "var(--verified)", fontSize: 13, marginBottom: 12 }}>Account created! Redirecting to sign in…</p>}
        {authError && <p className="form-error" style={{ marginBottom: 12 }}>{authError}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Work email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} />
            {form.password && <span className="form-hint">Strength: {strength}</span>}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-divider"><span className="line" /> or <span className="line" /></div>
        <GoogleButton />

        <p className="text-sm text-muted mt-24">
          Already have an account? <Link to="/login" style={{ color: "var(--signal)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}