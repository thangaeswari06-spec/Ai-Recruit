import { useEffect, useState } from "react";
import { interviewService } from "../../services/interviewService";
import { candidateService } from "../../services/candidateService";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import Loader from "../common/Loader";
import Modal from "../common/Modal";
import InterviewStatus from "./InterviewStatus";
import ScheduleInterview from "./ScheduleInterview";

export default function Interview() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewService.listInterviews();
      setInterviews(data || []);
    } catch (err) {
      setError(err.message || "Could not load interviews.");
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      // Candidates who are shortlisted or further along are the ones worth interviewing
      const data = await candidateService.listApplications({});
      setApplications((data || []).filter((a) => a.stage !== "rejected"));
    } catch {
      setApplications([]);
    }
  }

  useEffect(() => { load(); loadApplications(); }, []);

  const selectedApplication = applications.find((a) => a.id === selectedApplicationId);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Interviews" subtitle="Schedule and track candidate interviews" />
        <main className="page-body">
          <div className="flex justify-end" style={{ marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setScheduleOpen(true)}>
              + Schedule interview
            </button>
          </div>

          {error && (
            <div className="card" style={{ background: "var(--danger-light)", color: "var(--danger)", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loading ? <div style={{ padding: 60, textAlign: "center" }}><Loader label="Loading interviews…" /></div> :
            interviews.length === 0 ? <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>No interviews scheduled yet. Click "+ Schedule interview" to book one.</div> :
            <div className="flex flex-col gap-16">
              {interviews.map((iv) => <InterviewStatus key={iv.id} interview={iv} onUpdated={load} />)}
            </div>}
        </main>
      </div>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule interview">
        <div className="form-group">
          <label className="form-label">Candidate</label>
          <select
            className="form-input"
            value={selectedApplicationId}
            onChange={(e) => setSelectedApplicationId(e.target.value)}
          >
            <option value="">Select a candidate…</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.candidates?.name || a.candidates?.email} — {a.jobs?.title} ({a.stage})
              </option>
            ))}
          </select>
        </div>

        {selectedApplication && (
          <ScheduleInterview
            application={selectedApplication}
            onScheduled={() => {
              setScheduleOpen(false);
              setSelectedApplicationId("");
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}