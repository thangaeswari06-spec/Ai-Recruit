import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";

export default function PortalProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState({ name: "", phone: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  if (!authLoading && !user) return <Navigate to="/portal/login" replace />;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/candidates/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ ...profile, email: user.email }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save profile");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 16px" }}>
      <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <p className="card-title">My profile</p>
        {saved && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 12 }}>Profile saved!</p>}
        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
        <div className="form-group"><input className="form-input" placeholder="Full name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
        <div className="form-group"><input className="form-input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
        <div className="form-group"><input className="form-input" placeholder="Location" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} /></div>
        <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
      </div>
    </div>
  );
}