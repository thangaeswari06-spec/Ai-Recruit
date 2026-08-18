import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    function onEsc(e) { if (e.key === "Escape") onClose?.(); }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)" }} />
      <div className="card animate-in" style={{ position: "relative", width: "100%", maxWidth, boxShadow: "var(--shadow)" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} className="icon-btn" style={{ fontSize: 18 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}