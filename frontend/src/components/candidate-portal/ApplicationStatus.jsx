import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { APPLICATION_STAGES } from "../../utils/constants";
import PortalNav from "./PortalNav";

const TIMELINE = [
  APPLICATION_STAGES.APPLIED,
  APPLICATION_STAGES.SCREENED,
  APPLICATION_STAGES.SHORTLISTED,
  APPLICATION_STAGES.INTERVIEW_SCHEDULED,
  APPLICATION_STAGES.INTERVIEWED,
  APPLICATION_STAGES.HIRED,
];

const STAGE_LABEL = {
  applied: "Applied",
  screened: "Screened",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview scheduled",
  interviewed: "Interviewed",
  hired: "Hired",
  rejected: "Rejected",
};

function StageTimeline({ stage }) {
  if (stage === APPLICATION_STAGES.REJECTED) {
    return (
      <div className="portal-timeline">
        <span className="badge badge-danger">Rejected</span>
      </div>
    );
  }
  const currentIndex = TIMELINE.indexOf(stage);
  return (
    <div className="portal-timeline">
      {TIMELINE.map((s, i) => (
        <div key={s} className={`portal-timeline-step ${i <= currentIndex ? "done" : ""} ${i === currentIndex ? "current" : ""}`}>
          <span className="portal-timeline-dot" />
          <span className="portal-timeline-label">{STAGE_LABEL[s]}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreMeter({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-muted">Not scored yet</span>;
  }
  const pct = Math.round(score);
  return (
    <div className="portal-score">
      <div className="portal-score-track">
        <div className="portal-score-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="portal-score-value">{pct}% match</span>
    </div>
  );
}

export default function ApplicationStatus() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/candidates/mine`, {
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount — previously candidates had to click "Refresh status"
  // just to see anything, even the first time landing on this page.
  useEffect(() => {
    if (user) fetchApplications();
  }, [user, fetchApplications]);

  if (!authLoading && !user) return <Navigate to="/portal/login" replace />;

  return (
    <div className="portal-page">
      <PortalNav />
      <div className="portal-container" style={{ maxWidth: 640 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
          <h1 className="portal-title" style={{ marginBottom: 0 }}>My applications</h1>
          <button className="btn btn-sm" onClick={fetchApplications} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
        {!loading && applications.length === 0 && (
          <p className="text-sm text-muted">No applications found yet. Apply to a role to see it here.</p>
        )}

        <div className="flex flex-col gap-16">
          {applications.map((app) => (
            <div key={app.id} className="card portal-status-card">
              <div className="flex justify-between items-center">
                <div>
                  <p style={{ fontWeight: 600 }}>{app.jobs?.title}</p>
                  <p className="text-xs text-muted">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${app.stage === "rejected" ? "badge-danger" : app.stage === "hired" ? "badge-accent" : "badge-primary"}`}>
                  {STAGE_LABEL[app.stage] || app.stage}
                </span>
              </div>
              <div className="mt-16"><ScoreMeter score={app.score} /></div>
              <div className="mt-16"><StageTimeline stage={app.stage} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}