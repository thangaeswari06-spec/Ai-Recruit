import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function GoogleButton({ label = "Continue with Google" }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try { await signInWithGoogle(); } catch { setLoading(false); }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className="btn btn-secondary btn-block">
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3C33.7 32 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12.8 24 12.8c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.9 6.1 29.2 4 24 4c-7.5 0-14 4.2-17.7 10.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.9 39.6 16.4 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C39.9 36.4 44 30.9 44 24c0-1.2-.1-2.4-.4-3.5z"/>
      </svg>
      {loading ? "Redirecting…" : label}
    </button>
  );
}