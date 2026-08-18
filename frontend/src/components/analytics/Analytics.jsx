import { useEffect, useState } from "react";
import { getFunnelCounts } from "../../services/analyticsService";
import { jobService } from "../../services/jobService";
import { candidateService } from "../../services/candidateService";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import Loader from "../common/Loader";
import ExportReports from "./ExportReports";

const FUNNEL = [["applied", "Applied"], ["screened", "Screened"], ["shortlisted", "Shortlisted"], ["interview_scheduled", "Interview scheduled"], ["interviewed", "Interviewed"], ["hired", "Hired"]];

export default function Analytics() {
  const [counts, setCounts] = useState({});
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [funnel, jobsData, apps] = await Promise.all([
          getFunnelCounts(),
          jobService.listJobs({}),
          candidateService.listApplications({}),
        ]);
        if (!active) return;
        setCounts(funnel || {});
        setJobs(jobsData || []);
        setApplications(apps || []);
      } catch (err) {
        if (active) setError(err.message || "Could not load analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const total = counts.applied || 1;

  const scored = applications.filter((a) => a.score != null);
  const avgScore = scored.length ? Math.round(scored.reduce((s, a) => s + a.score, 0) / scored.length) : null;
  const hiredCount = applications.filter((a) => a.stage === "hired").length;
  const rejectedCount = applications.filter((a) => a.stage === "rejected").length;
  const conversionRate = applications.length ? Math.round((hiredCount / applications.length) * 100) : 0;

  const perJob = jobs.map((job) => {
    const jobApps = applications.filter((a) => a.job_id === job.id);
    return {
      id: job.id,
      title: job.title,
      status: job.status,
      total: jobApps.length,
      hired: jobApps.filter((a) => a.stage === "hired").length,
      shortlisted: jobApps.filter((a) => a.stage === "shortlisted").length,
    };
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Analytics" subtitle="Hiring funnel, trends and exportable reports" />
        <main className="page-body">
          <div className="flex justify-end mt-8" style={{ marginBottom: 16 }}><ExportReports /></div>

          {error && (
            <div className="card" style={{ background: "var(--danger-light)", color: "var(--danger)", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loading ? <div style={{ padding: 60, textAlign: "center" }}><Loader label="Loading analytics…" /></div> : (
            <>
              <div className="grid-stats" style={{ marginBottom: 16 }}>
                <div className="card">
                  <p className="text-sm text-muted">Total applications</p>
                  <p style={{ fontSize: 24, fontWeight: 700 }}>{applications.length}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-muted">Average AI score</p>
                  <p style={{ fontSize: 24, fontWeight: 700 }}>{avgScore != null ? `${avgScore}%` : "—"}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-muted">Hired</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{hiredCount}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-muted">Applied → Hired rate</p>
                  <p style={{ fontSize: 24, fontWeight: 700 }}>{conversionRate}%</p>
                </div>
              </div>

              <div className="card">
                <p className="card-title">Hiring funnel</p>
                {FUNNEL.map(([key, label]) => {
                  const val = counts[key] || 0;
                  const pct = Math.round((val / total) * 100);
                  return (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <div className="flex justify-between text-sm" style={{ marginBottom: 4 }}>
                        <span>{label}</span><span style={{ fontWeight: 600 }}>{val} ({pct}%)</span>
                      </div>
                      <div style={{ width: "100%", height: 10, background: "#f1f1f5", borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card mt-16">
                <p className="card-title">Per-job breakdown</p>
                {perJob.length === 0 && <p className="text-sm text-muted">No jobs yet.</p>}
                {perJob.map((j) => (
                  <div key={j.id} className="flex justify-between items-center" style={{ padding: "10px 0", borderBottom: "1px solid #f4f4f7" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{j.title}</p>
                      <p className="text-xs text-muted">{j.status}</p>
                    </div>
                    <div className="flex gap-16 text-sm">
                      <span>{j.total} applied</span>
                      <span>{j.shortlisted} shortlisted</span>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>{j.hired} hired</span>
                    </div>
                  </div>
                ))}
              </div>

              {rejectedCount > 0 && (
                <p className="text-xs text-muted mt-16">{rejectedCount} rejected application(s) are excluded from the funnel above.</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}