import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { jobService } from "../../services/jobService";
import { validateJobForm } from "../../utils/validators";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import SkillsManager from "./SkillsManager";
import JDGenerator from "./JDGenerator";

const LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead", "Manager"];
const initialForm = { title: "", department: "", location: "", experience_level: "Mid Level", skills: [], description: "" };

export default function CreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: null }));
  }

  function handleAIGenerated(job) {
    navigate(`/jobs/${job.id}`);
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    const errs = validateJobForm(form);
    if (Object.keys(errs).length) return setErrors(errs);
    setSaving(true);
    setSaveError(null);
    try {
      const job = await jobService.createJob({ ...form, created_by: user.id, status: "open" });
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Create job" subtitle="Post a new role and let AI screen incoming resumes" />
        <main className="page-body" style={{ maxWidth: 760 }}>
          <JDGenerator jobDraft={{ ...form, created_by: user?.id }} onGenerated={handleAIGenerated} />

          <form onSubmit={handleManualSubmit} className="card mt-24">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job title</label>
                <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Senior Frontend Engineer" />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" name="department" value={form.department} onChange={handleChange} placeholder="Engineering" />
                {errors.department && <span className="form-error">{errors.department}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="Chennai / Remote" />
                {errors.location && <span className="form-error">{errors.location}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Experience level</label>
                <select className="form-select" name="experience_level" value={form.experience_level} onChange={handleChange}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <SkillsManager skills={form.skills} onChange={(skills) => setForm((f) => ({ ...f, skills }))} />

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={8} name="description" value={form.description} onChange={handleChange} placeholder="Write manually, or use the AI generator above…" />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {saveError && <p className="form-error">{saveError}</p>}

            <div className="flex justify-between mt-16">
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-dark">{saving ? "Saving…" : "Save job manually"}</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}