import { useEffect, useState } from "react";
import { candidateService } from "../../services/candidateService";
import { jobService } from "../../services/jobService";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import Loader from "../common/Loader";
import Modal from "../common/Modal";
import CandidateFilters from "./CandidateFilters";
import CandidateRanking from "./CandidateRanking";
import ResumeUpload from "./ResumeUpload";

export default function CandidateList() {
  const [applications, setApplications] = useState([]);
  const [stage, setStage] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // A resume has to belong to a job to ever get an AI score — this is what
  // was missing before ("Not scored" forever + blank Job column).
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.listApplications({ stage, search });
      setApplications(data || []);
    } catch (err) {
      setError(err.message || "Could not load candidates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await load();
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, search]);

  useEffect(() => {
    jobService.listJobs({ status: "open" }).then(setJobs).catch(() => setJobs([]));
  }, []);

  const filtered = applications.filter((a) => (a.score ?? 0) >= minScore);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Candidates" onSearch={setSearch} />
        <main className="page-body">
          <div className="flex items-center justify-between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <CandidateFilters activeStage={stage} onStageChange={setStage} minScore={minScore} onMinScoreChange={setMinScore} />
            <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
              + Upload Resume
            </button>
          </div>

          {error && (
            <div className="card" style={{ background: "var(--danger-light)", color: "var(--danger)", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loading ? <div style={{ padding: 60, textAlign: "center" }}><Loader label="Loading candidates…" /></div> :
            filtered.length === 0 ? <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>No candidates match these filters.</div> :
            <CandidateRanking applications={filtered} />}
        </main>
      </div>

      <Modal open={uploadOpen} onClose={() => { setUploadOpen(false); setSelectedJobId(""); }} title="Upload Resume">
        <div className="form-group">
          <label className="form-label">Job this candidate is applying for</label>
          <select className="form-select" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            <option value="">Select a job…</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} — {j.department}</option>
            ))}
          </select>
          {jobs.length === 0 && <p className="form-hint mt-8">No open jobs yet — create one first from the Jobs page.</p>}
        </div>

        {selectedJobId ? (
          <ResumeUpload
            jobId={selectedJobId}
            onProcessed={() => {
              setUploadOpen(false);
              setSelectedJobId("");
              load();
            }}
          />
        ) : (
          <p className="text-sm text-muted mt-8">Pick a job above to enable the upload — this is what lets AI scoring run later.</p>
        )}
      </Modal>
    </div>
  );
}
