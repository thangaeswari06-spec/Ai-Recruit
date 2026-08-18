import { useState } from "react";

export default function SkillsManager({ skills = [], onChange }) {
  const [input, setInput] = useState("");

  function addSkill() {
    const t = input.trim();
    if (!t || skills.some((s) => s.toLowerCase() === t.toLowerCase())) return setInput("");
    onChange([...skills, t]);
    setInput("");
  }

  return (
    <div className="form-group">
      <label className="form-label">Required skills</label>
      <div className="flex" style={{ flexWrap: "wrap", gap: 8, border: "1px solid var(--border)", borderRadius: 9, padding: 8 }}>
        {skills.map((s) => (
          <span key={s} className="badge badge-primary">
            {s} <button onClick={() => onChange(skills.filter((x) => x !== s))} style={{ marginLeft: 6, background: "none", border: "none" }}>×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }}
          onBlur={addSkill}
          placeholder={skills.length ? "" : "e.g. React, Node.js"}
          style={{ border: "none", outline: "none", flex: 1, minWidth: 100, fontSize: 13 }}
        />
      </div>
    </div>
  );
}