import { useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import { getInitials } from "../../utils/helpers";

export default function ViewProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    department: profile?.department || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > 2 * 1024 * 1024) return setError("Image must be under 2MB.");

    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      await authService.updateProfile(user.id, { avatar_url: urlData.publicUrl });
      await refreshProfile();
      setAvatarUrl(urlData.publicUrl);
    } catch (err) {
      setError(err.message || "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    setUploading(true);
    try {
      await authService.updateProfile(user.id, { avatar_url: null });
      await refreshProfile();
      setAvatarUrl(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await authService.updateProfile(user.id, form);
      await refreshProfile();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="My Profile" subtitle="Your account details" />
        <main className="page-body">
          <div className="card" style={{ maxWidth: 560 }}>
            <div className="flex items-center gap-16">
              <div style={{ position: "relative" }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div className="avatar-circle" style={{ width: 72, height: 72, fontSize: 24 }}>
                    {getInitials(form.name || user?.email)}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%",
                    background: "var(--primary)", color: "#fff", border: "2px solid #fff", fontSize: 12,
                  }}
                >
                  📷
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoSelect} />
              </div>

              <div>
                <p style={{ fontSize: 18, fontWeight: 600 }}>{form.name || "Unnamed"}</p>
                <p className="text-muted text-sm">{user?.email}</p>
                <span className="badge badge-primary" style={{ marginTop: 6 }}>{profile?.role || "recruiter"}</span>
              </div>
            </div>

            <div className="flex items-center gap-12 mt-16">
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : "Change photo"}
              </button>
              {avatarUrl && (
                <button className="btn btn-danger btn-sm" onClick={handleRemovePhoto} disabled={uploading}>
                  Remove photo
                </button>
              )}
            </div>

            <div className="mt-24" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} disabled={!editing} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} disabled={!editing} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" name="department" value={form.department} onChange={handleChange} disabled={!editing} placeholder="Engineering, HR, etc." />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled />
              </div>
            </div>

            {error && <p className="form-error mt-8">{error}</p>}
            {saved && <p className="text-sm" style={{ color: "#16a34a", marginTop: 16 }}>✓ Profile updated</p>}

            <div className="mt-24 flex gap-12">
              {editing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      setForm({ name: profile?.name || "", phone: profile?.phone || "", department: profile?.department || "" });
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit details</button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}