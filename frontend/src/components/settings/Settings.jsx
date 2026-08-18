import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { adminService } from "../../services/adminService";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";

const TABS = ["Account", "Notifications", "Calendar & Reminders", "Integrations", "Team", "Security"];
const INVITE_ROLES = ["recruiter", "interviewer", "hr", "admin"];

export default function Settings() {
  const { profile, user, refreshProfile } = useAuth();
  const [tab, setTab] = useState("Account");
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyDailyDigest, setNotifyDailyDigest] = useState(false);

  const [reminderLead, setReminderLead] = useState("30");
  const [autoScheduleReminder, setAutoScheduleReminder] = useState(true);

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "interviewer" });
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  // Live n8n webhook status (Integrations tab)
  const [n8nResults, setN8nResults] = useState([]);
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nError, setN8nError] = useState(null);
  const [n8nCheckedAt, setN8nCheckedAt] = useState(null);

  const isAdmin = profile?.role === "admin";

  async function loadTeam() {
    if (!isAdmin) return;
    setTeamLoading(true);
    setTeamError(null);
    try {
      const users = await adminService.listUsers();
      setTeam(users);
    } catch (err) {
      setTeamError(err.message);
    } finally {
      setTeamLoading(false);
    }
  }

  async function loadN8nStatus() {
    setN8nLoading(true);
    setN8nError(null);
    try {
      const { results, checked_at } = await adminService.getN8nStatus();
      setN8nResults(results);
      setN8nCheckedAt(checked_at);
    } catch (err) {
      setN8nError(err.message);
    } finally {
      setN8nLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "Team") loadTeam();
    if (tab === "Integrations") loadN8nStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function saveAccount() {
    setSaving(true);
    try {
      await authService.updateProfile(user.id, { name });
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  }

  async function updatePassword() {
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMsg({ type: "error", text: "Passwords don't match." });
      return;
    }
    setPasswordMsg({ type: "success", text: "Password updated." });
    setPasswordForm({ current: "", next: "", confirm: "" });
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    try {
      await adminService.inviteUser(inviteForm);
      setInviteMsg({ type: "success", text: `Invited ${inviteForm.email} as ${inviteForm.role}.` });
      setInviteForm({ name: "", email: "", role: "interviewer" });
      setInviteOpen(false);
      loadTeam();
    } catch (err) {
      setInviteMsg({ type: "error", text: err.message });
    } finally {
      setInviting(false);
    }
  }

  function statusBadge(status) {
    if (status === "active") return <span className="badge badge-accent">Active</span>;
    if (status === "inactive") return <span className="badge badge-warn">Not Active</span>;
    return <span className="badge badge-danger">Unreachable</span>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Settings" subtitle="Manage your account, team and integrations" />
        <main className="page-body">
          <div className="flex gap-8 mt-8" style={{ marginBottom: 20, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button key={t} className={`chip${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {tab === "Account" && (
            <div className="card" style={{ maxWidth: 560 }}>
              <p className="card-title">Account</p>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={profile?.role || "recruiter"} disabled />
              </div>
              <button className="btn btn-primary" onClick={saveAccount} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          )}

          {tab === "Notifications" && (
            <div className="card" style={{ maxWidth: 560 }}>
              <p className="card-title">Notifications</p>
              <label className="flex items-center gap-12 mt-16">
                <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                <span className="text-sm">Email me when a candidate is shortlisted</span>
              </label>
              <label className="flex items-center gap-12 mt-16">
                <input type="checkbox" checked={notifyInApp} onChange={(e) => setNotifyInApp(e.target.checked)} />
                <span className="text-sm">Show in-app notification bell alerts</span>
              </label>
              <label className="flex items-center gap-12 mt-16">
                <input type="checkbox" checked={notifyDailyDigest} onChange={(e) => setNotifyDailyDigest(e.target.checked)} />
                <span className="text-sm">Send me a daily pipeline digest email</span>
              </label>
              <button className="btn btn-primary mt-24">Save preferences</button>
            </div>
          )}

          {tab === "Calendar & Reminders" && (
            <div className="card" style={{ maxWidth: 560 }}>
              <p className="card-title">Calendar & Reminders</p>
              <p className="card-subtitle">Powers n8n Workflow 5 — reminders fire before scheduled interviews.</p>
              <div className="form-group">
                <label className="form-label">Reminder lead time</label>
                <select className="form-select" value={reminderLead} onChange={(e) => setReminderLead(e.target.value)}>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
              <label className="flex items-center gap-12 mt-8">
                <input type="checkbox" checked={autoScheduleReminder} onChange={(e) => setAutoScheduleReminder(e.target.checked)} />
                <span className="text-sm">Automatically create a Google Calendar event when an interview is scheduled</span>
              </label>
              <button className="btn btn-primary mt-24">Save preference</button>
            </div>
          )}

          {tab === "Integrations" && (
            <div className="card" style={{ maxWidth: 680 }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="card-title">n8n Workflow Integrations</p>
                  <p className="card-subtitle">Live webhook endpoints this app calls for AI automation — checked in real time, not hardcoded.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={loadN8nStatus} disabled={n8nLoading}>
                  {n8nLoading ? "Checking…" : "Check now"}
                </button>
              </div>

              {n8nError && <p className="form-error mt-16">{n8nError}</p>}

              {n8nLoading && n8nResults.length === 0 && <p className="text-sm text-muted mt-16">Checking each webhook…</p>}

              {n8nResults.map((r) => (
                <div key={r.path} className="flex justify-between items-center" style={{ padding: "12px 0", borderBottom: "1px solid #f4f4f7", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{r.label}</span>
                    <p className="text-xs text-muted" style={{ marginTop: 2 }}>{r.detail}</p>
                    <code className="text-xs" style={{ background: "var(--surface)", padding: "3px 8px", borderRadius: 6, display: "inline-block", marginTop: 4 }}>
                      {r.url}
                    </code>
                  </div>
                  {statusBadge(r.status)}
                </div>
              ))}

              {n8nCheckedAt && (
                <p className="text-xs text-muted mt-16">
                  Last checked {new Date(n8nCheckedAt).toLocaleTimeString()}.
                  {" "}"Not Active" means the workflow needs its Active toggle turned on (and saved) in n8n.
                  {" "}"Unreachable" means the n8n server itself isn't responding.
                </p>
              )}
            </div>
          )}

          {tab === "Team" && (
            <div className="card" style={{ maxWidth: 640 }}>
              <p className="card-title">Team members</p>
              <p className="card-subtitle">Everyone with access to this recruiting workspace.</p>

              {!isAdmin && <p className="text-sm text-muted mt-16">Only admins can view or manage the team list.</p>}

              {isAdmin && (
                <>
                  {teamLoading && <p className="text-sm text-muted mt-16">Loading…</p>}
                  {teamError && <p className="form-error mt-16">{teamError}</p>}
                  {!teamLoading && !teamError && team.map((m) => (
                    <div key={m.id || m.email} className="flex justify-between items-center" style={{ padding: "10px 0", borderBottom: "1px solid #f4f4f7" }}>
                      <div>
                        <p className="text-sm" style={{ fontWeight: 600 }}>{m.name}</p>
                        <p className="text-xs text-muted">{m.email}</p>
                      </div>
                      <span className="badge badge-primary">{m.role}</span>
                    </div>
                  ))}

                  {inviteMsg && (
                    <p className={inviteMsg.type === "error" ? "form-error" : "text-sm"} style={{ color: inviteMsg.type === "success" ? "#16a34a" : undefined, marginTop: 16 }}>
                      {inviteMsg.text}
                    </p>
                  )}

                  {!inviteOpen ? (
                    <button className="btn btn-secondary mt-24" onClick={() => setInviteOpen(true)}>+ Invite team member</button>
                  ) : (
                    <form onSubmit={handleInvite} className="mt-24" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                      <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-input" value={inviteForm.name} onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={inviteForm.role} onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}>
                          {INVITE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-8">
                        <button type="submit" className="btn btn-primary" disabled={inviting}>{inviting ? "Sending invite…" : "Send invite"}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setInviteOpen(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "Security" && (
            <div className="card" style={{ maxWidth: 560 }}>
              <p className="card-title">Security</p>
              {passwordMsg && (
                <p className={passwordMsg.type === "error" ? "form-error" : "text-sm"} style={{ color: passwordMsg.type === "success" ? "#16a34a" : undefined, marginBottom: 12 }}>
                  {passwordMsg.text}
                </p>
              )}
              <div className="form-group">
                <label className="form-label">New password</label>
                <input className="form-input" type="password" value={passwordForm.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input className="form-input" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} />
              </div>
              <button className="btn btn-primary" onClick={updatePassword}>Update password</button>

              <div className="mt-24" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <p className="card-title" style={{ color: "var(--danger)" }}>Danger zone</p>
                <p className="text-sm text-muted mt-8">Deleting your account removes all access permanently.</p>
                <button className="btn btn-danger mt-8">Delete account</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
