import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobService } from "../../services/jobService";
import { candidateService } from "../../services/candidateService";
import { validateResumeFile, isValidEmail } from "../../utils/validators";
import { formatDate } from "../../utils/helpers";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import Loader from "../common/Loader";
import Modal from "../common/Modal";

const STAGE_CLASS = { applied: "badge-primary", screened: "badge-primary", shortlisted: "badge-warn", interview_scheduled: "badge-warn", interviewed: "badge-primary", hired: "badge-accent", rejected: "badge-danger" };

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmClose, setConfirmClose] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "" });
  const [applyFile, setApplyFile] = useState(null);
  const [applyErrors, setApplyErrors] = useState({});
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);

  function handleCopyApplyLink() {
    const link = `${window.location.origin}/portal/jobs/${id}/apply`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  async function loadJob() {
    const data = await jobService.getJob(id);
    setJob(data);
    return data;
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadJob().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCloseJob() {
    await jobService.closeJob(id);
    setJob((j) => ({ ...j, status: "closed" }));
    setConfirmClose(false);
  }

  async function handleApplySubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!applyForm.name) errs.name = "Name required.";
    if (!isValidEmail(applyForm.email)) errs.email = "Valid email required.";
    const fileErrs = validateResumeFile(applyFile);
    if (fileErrs.length) errs.file = fileErrs[0];
    if (Object.keys(errs).length) return setApplyErrors(errs);

    setApplySubmitting(true);
    setApplyErrors({});
    setApplySuccess(null);
    try {
      await candidateService.uploadResume(applyFile, {
        jobId: id,
        candidateEmail: applyForm.email,
        candidateName: applyForm.name,
        candidatePhone: applyForm.phone,
      });
      setApplySuccess(`${applyForm.name} added to this job's applicants.`);
      setApplyForm({ name: "", email: "", phone: "" });
      setApplyFile(null);
      setApplyOpen(false);
      await loadJob();
    } catch (err) {
      setApplyErrors({ submit: err.message });
    } finally {
      setApplySubmitting(false);
    }
  }

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content flex" style={{ minHeight: "100vh", alignItems: "center", justifyContent: "center" }}><Loader label="Loading job…" /></div></div>;
  if (!job) return null;

  const applications = job.applications || [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={job.title} subtitle={`${job.department} · ${job.location}`} />
        <main className="page-body">
          <button onClick={() => navigate("/jobs")} className="text-sm text-muted" style={{ marginBottom: 16, background: "none", border: "none" }}>← Back to jobs</button>

          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>Posted {formatDate(job.created_at)}</p>
              </div>
              <div className="flex gap-8">
                {job.status === "open" && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={handleCopyApplyLink}>
                      {linkCopied ? "✅ Link copied!" : "🔗 Copy application link"}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setApplyOpen((v) => !v)}>
                      {applyOpen ? "✕ Cancel" : "➕ Apply for this job"}
                    </button>
                  </>
                )}
                {job.status !== "closed" && (
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmClose(true)}>Close job</button>
                )}
              </div>
            </div>

            {job.skills?.length > 0 && (
              <div className="flex gap-8 mt-16" style={{ flexWrap: "wrap" }}>
                {job.skills.map((s) => <span key={s} className="badge badge-muted">{s}</span>)}
              </div>
            )}

            <div className="mt-24" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <p className="card-title">Description</p>
              <p className="text-sm" style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{job.description}</p>
            </div>

            {applySuccess && (
              <p className="text-sm mt-16" style={{ color: "#16a34a" }}>{applySuccess}</p>
            )}

            {applyOpen && (
              <form onSubmit={handleApplySubmit} className="mt-24" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <p className="card-title">Apply for {job.title}</p>
                <p className="card-subtitle">Upload a resume to add this candidate straight into the applicants list below.</p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full name</label>
                    <input className="form-input" value={applyForm.name} onChange={(e) => setApplyForm((f) => ({ ...f, name: e.target.value }))} />
                    {applyErrors.name && <span className="form-error">{applyErrors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" value={applyForm.email} onChange={(e) => setApplyForm((f) => ({ ...f, email: e.target.value }))} />
                    {applyErrors.email && <span className="form-error">{applyErrors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone (optional)</label>
                  <input className="form-input" value={applyForm.phone} onChange={(e) => setApplyForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Resume (PDF)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setApplyFile(e.target.files[0])} />
                  {applyErrors.file && <span className="form-error">{applyErrors.file}</span>}
                </div>

                {applyErrors.submit && <p className="form-error">{applyErrors.submit}</p>}

                <button type="submit" className="btn btn-primary" disabled={applySubmitting}>
                  {applySubmitting ? "Submitting…" : "Submit application"}
                </button>
              </form>
            )}
          </div>

          <div className="card mt-16">
            <p className="card-title">Applicants ({applications.length})</p>
            {applications.length === 0 ? <p className="text-sm text-muted">No applications yet.</p> : (
              applications.map((app) => (
                <Link key={app.id} to={`/candidates/${app.id}`} className="flex justify-between items-center" style={{ padding: "10px 0", borderBottom: "1px solid #f4f4f7" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{app.candidates?.name}</p>
                    <p className="text-xs text-muted">{app.candidates?.email}</p>
                  </div>
                  <div className="flex items-center gap-12">
                    {app.score != null && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{app.score}%</span>}
                    <span className={`badge ${STAGE_CLASS[app.stage] || "badge-muted"}`}>{app.stage}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>

      <Modal open={confirmClose} onClose={() => setConfirmClose(false)} title="Close this job?" maxWidth={380}>
        <p className="text-sm text-muted mt-8">This stops new applications for "{job.title}".</p>
        <div className="flex justify-end gap-12 mt-24">
          <button className="btn btn-secondary" onClick={() => setConfirmClose(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleCloseJob}>Close job</button>
        </div>
      </Modal>
    </div>
  );
}