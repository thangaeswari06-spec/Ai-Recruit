import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobService } from "../../services/jobService";
import { timeAgo } from "../../utils/helpers";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import Loader from "../common/Loader";

const TABS = [{ label: "All", value: null }, { label: "Open", value: "open" }, { label: "Paused", value: "paused" }, { label: "Closed", value: "closed" }];
const STATUS_CLASS = { open: "badge-accent", paused: "badge-warn", closed: "badge-muted", draft: "badge-muted" };

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await jobService.listJobs({ status, search });
        if (active) setJobs(data || []);
      } catch (err) {
        if (active) setError(err.message || "Could not load jobs.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [status, search]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Jobs" onSearch={setSearch} />
        <main className="page-body">
          <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
            <p className="text-sm text-muted">{jobs.length} jobs</p>
            <Link to="/jobs/new" className="btn btn-primary">+ Create job</Link>
          </div>

          <div className="flex gap-8" style={{ marginBottom: 20 }}>
            {TABS.map((t) => (
              <button key={t.label} className={`chip${status === t.value ? " active" : ""}`} onClick={() => setStatus(t.value)}>{t.label}</button>
            ))}
          </div>

          {error && (
            <div className="card" style={{ background: "var(--danger-light)", color: "var(--danger)", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loading ? <div style={{ padding: 60, textAlign: "center" }}><Loader label="Loading jobs…" /></div> : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>No jobs found.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="card" style={{ display: "block" }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p style={{ fontWeight: 600 }}>{job.title}</p>
                      <p className="text-sm text-muted">{job.department} · {job.location}</p>
                    </div>
                    <span className={`badge ${STATUS_CLASS[job.status] || "badge-muted"}`}>{job.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted mt-16">
                    <span>{job.applications?.[0]?.count ?? 0} applicants</span>
                    <span>Posted {timeAgo(job.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}