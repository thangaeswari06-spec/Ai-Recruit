import { useRef, useState } from "react";
import { candidateService } from "../../services/candidateService";
import { validateResumeFile, isValidEmail } from "../../utils/validators";

export default function ResumeUpload({ jobId, candidateEmail, onProcessed }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(candidateEmail || "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  function handleFile(selected) {
    const errs = validateResumeFile(selected);
    if (errs.length) return setError(errs[0]);
    setError(null);
    setFile(selected);
  }

  async function handleSubmit() {
    if (!file) return;
    if (!jobId) return setError("Select a job for this application first.");
    if (!name.trim()) return setError("Candidate name is required.");
    if (!isValidEmail(email)) return setError("A valid candidate email is required.");

    setStatus("processing");
    setError(null);
    try {
      const result = await candidateService.uploadResume(file, {
        jobId,
        candidateEmail: email,
        candidateName: name,
        candidatePhone: phone,
      });
      setStatus("done");
      onProcessed?.(result);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Candidate name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      </div>
      <div className="form-group">
        <label className="form-label">Candidate email</label>
        <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="candidate@email.com" disabled={!!candidateEmail} />
      </div>
      <div className="form-group">
        <label className="form-label">Phone (optional)</label>
        <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        style={{ border: "2px dashed var(--border)", borderRadius: 14, padding: 30, textAlign: "center", cursor: "pointer" }}
      >
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
        <p style={{ fontSize: 24, marginBottom: 8 }}>📄</p>
        {file ? <p style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</p> : (
          <>
            <p style={{ fontWeight: 600, fontSize: 13 }}>Click to select a resume (PDF)</p>
            <p className="text-xs text-muted">Up to 5MB — this triggers AI extraction & scoring</p>
          </>
        )}
      </div>
      {error && <p className="form-error mt-8">{error}</p>}
      {file && status !== "done" && (
        <button className="btn btn-primary btn-block mt-16" onClick={handleSubmit} disabled={status === "processing" || !jobId}>
          {status === "idle" ? "Upload & run AI screening" : "AI is processing the resume…"}
        </button>
      )}
      {status === "done" && <p style={{ color: "#16a34a", fontSize: 13, marginTop: 12 }}>✓ Resume processed by AI.</p>}
    </div>
  );
}
