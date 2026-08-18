import { useState } from "react";

const DEFAULTS = [
  { id: "shortlist", name: "Shortlist", subject: "You've been shortlisted!", body: "Hi {{candidate_name}}, you've been shortlisted for {{job_title}}." },
  { id: "interview", name: "Interview Invite", subject: "Interview scheduled", body: "Hi {{candidate_name}}, your interview is set for {{scheduled_at}}." },
  { id: "rejection", name: "Rejection", subject: "Update on your application", body: "Hi {{candidate_name}}, thank you for applying to {{job_title}}." },
  { id: "offer", name: "Offer Letter", subject: "Your offer letter", body: "Hi {{candidate_name}}, congratulations!" },
];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState(DEFAULTS);
  const [selected, setSelected] = useState(templates[0].id);
  const active = templates.find((t) => t.id === selected);

  function update(field, value) {
    setTemplates((ts) => ts.map((t) => (t.id === selected ? { ...t, [field]: value } : t)));
  }

  return (
    <div className="card">
      <p className="card-title">Email templates</p>
      <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 16 }}>
        {templates.map((t) => <button key={t.id} className={`chip${selected === t.id ? " active" : ""}`} onClick={() => setSelected(t.id)}>{t.name}</button>)}
      </div>
      <div className="form-group"><input className="form-input" value={active.subject} onChange={(e) => update("subject", e.target.value)} /></div>
      <div className="form-group"><textarea className="form-textarea" rows={6} value={active.body} onChange={(e) => update("body", e.target.value)} /></div>
      <p className="form-hint">Placeholders: {"{{candidate_name}}"}, {"{{job_title}}"}, {"{{scheduled_at}}"}</p>
    </div>
  );
}