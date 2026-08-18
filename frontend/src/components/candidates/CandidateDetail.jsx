import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidateService } from "../../services/candidateService";
import { interviewService } from "../../services/interviewService";
import { formatDate } from "../../utils/helpers";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import Loader from "../common/Loader";
import ScoreBreakdown from "./ScoreBreakdown";
import NotesAndTags from "./NotesAndTags";

const STAGE_CLASS = { applied: "badge-primary", screened: "badge-primary", shortlisted: "badge-warn", interview_scheduled: "badge-warn", interviewed: "badge-primary", hired: "badge-accent", rejected: "badge-danger" };

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    candidateService.getApplication(id).then((data) => { if (active) { setApp(data); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  async function handleStageChange(stage) {
    setBusy(true);
    try { await candidateService.updateStage(id, stage); setApp((a) => ({ ...a, stage })); } finally { setBusy(false); }
  }

  async function handleScheduleInterview() {
    setBusy(true);
    try {
      await interviewService.scheduleInterview({
        application_id: id,
        interviewer_id: null,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      });
      navigate("/interviews");
    } finally { setBusy(false); }
  }

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content flex" style={{ minHeight: "100vh", alignItems: "center", justifyContent: "center" }}><Loader label="Loading candidate…" /></div></div>;
  if (!app) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={app.candidates?.name} subtitle={app.jobs?.title} />
        <main className="page-body" style={{ maxWidth: 720 }}>
          <button onClick={() => navigate("/candidates")} className="text-sm text-muted" style={{ marginBottom: 16, background: "none", border: "none" }}>← Back to candidates</button>

          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted">{app.candidates?.email} · {app.candidates?.phone}</p>
                <p className="text-xs text-muted mt-8">Applied {formatDate(app.created_at)}</p>
              </div>
              <span className={`badge ${STAGE_CLASS[app.stage] || "badge-muted"}`}>{app.stage}</span>
            </div>

            <div className="flex gap-8 mt-24" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleStageChange("shortlisted")} disabled={busy}>Shortlist</button>
              <button className="btn btn-secondary btn-sm" onClick={handleScheduleInterview} disabled={busy}>Schedule interview</button>
              <button className="btn btn-primary btn-sm" onClick={() => handleStageChange("hired")} disabled={busy}>Mark hired</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleStageChange("rejected")} disabled={busy}>Reject</button>
            </div>
          </div>

          {app.score != null && (
            <div className="mt-16">
              <ScoreBreakdown score={app.score} matchedSkills={app.matched_skills} missingSkills={app.missing_skills} summary={app.ai_summary || app.ai_explanation} />
            </div>
          )}

          <div className="mt-16">
            <NotesAndTags applicationId={id} initialNotes={app.notes || []} />
          </div>
        </main>
      </div>
    </div>
  );
}