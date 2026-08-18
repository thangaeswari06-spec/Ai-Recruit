import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { validateResumeFile, isValidEmail } from "../../utils/validators";
import { RESUME_MAX_SIZE_MB } from "../../utils/constants";
import PortalNav from "./PortalNav";

export default function ApplyJob() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/public/${jobId}`);
        if (res.ok) setJob((await res.json()).job);
      } catch {}
    }
    loadJob();
  }, [jobId]);

  function pickFile(selected) {
    setErrors((er) => ({ ...er, file: null }));
    const fileErrs = validateResumeFile(selected);
    if (fileErrs.length) {
      setErrors((er) => ({ ...er, file: fileErrs[0] }));
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) pickFile(dropped);
  }

  function submitWithProgress({ url, body }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) setProgress(Math.round((evt.loaded / evt.total) * 100));
      };
      xhr.onload = () => {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || "Something went wrong submitting your application."));
      };
      xhr.onerror = () => reject(new Error("Network error — please check your connection and try again."));
      xhr.send(body);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name) errs.name = "Name required.";
    if (!isValidEmail(form.email)) errs.email = "Valid email required.";
    const fileErrs = validateResumeFile(file);
    if (fileErrs.length) errs.file = fileErrs[0];
    if (Object.keys(errs).length) return setErrors(errs);

    setSubmitting(true);
    setProgress(0);
    setErrors({});
    try {
      const body = new FormData();
      body.append("resume", file);
      body.append("job_id", jobId);
      body.append("candidate_email", form.email);
      body.append("candidate_name", form.name);
      if (form.phone) body.append("candidate_phone", form.phone);

      await submitWithProgress({ url: `${import.meta.env.VITE_API_BASE_URL}/resume/upload`, body });
      setDone(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="portal-page">
        <PortalNav />
        <div className="portal-center">
          <div className="card portal-success-card">
            <p style={{ fontSize: 32 }}>🎉</p>
            <p style={{ fontWeight: 600, fontSize: 16 }}>Application submitted!</p>
            <p className="text-sm text-muted mt-8">We're reviewing your resume now — check "My Applications" for updates.</p>
            <Link to="/portal/status" className="btn btn-primary btn-block mt-16">View my applications</Link>
            <Link to="/portal/jobs" className="text-sm text-muted mt-16" style={{ display: "block" }}>← Browse more roles</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <PortalNav />
      <div className="portal-center">
        <form onSubmit={handleSubmit} className="card portal-apply-card">
          <p className="card-title">{job ? `Apply — ${job.title}` : "Apply for this role"}</p>
          {job && <p className="text-sm text-muted mt-8" style={{ marginBottom: 16 }}>{job.department} · {job.location}</p>}

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Resume (PDF, max {RESUME_MAX_SIZE_MB}MB)</label>
            <div
              className={`portal-dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => pickFile(e.target.files[0])}
              />
              {file ? (
                <div className="portal-dropzone-file">
                  <span>📄 {file.name}</span>
                  <button
                    type="button"
                    className="portal-dropzone-remove"
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted">Drag & drop your resume here, or click to choose a file</p>
              )}
            </div>
            {errors.file && <span className="form-error">{errors.file}</span>}
          </div>

          {submitting && (
            <div className="portal-progress-track">
              <div className="portal-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {errors.submit && <p className="form-error">{errors.submit}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? `Uploading… ${progress}%` : "Submit application"}
          </button>
          <p className="text-sm text-muted mt-16"><Link to="/portal/jobs" style={{ color: "var(--primary)" }}>← Back to open roles</Link></p>
        </form>
      </div>
    </div>
  );
}
