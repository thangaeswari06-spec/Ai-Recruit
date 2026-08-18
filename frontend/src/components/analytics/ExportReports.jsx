import { useState } from "react";
import { downloadBlob } from "../../utils/helpers";
import { supabase } from "../../lib/supabaseClient";

export default function ExportReports() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/candidates?export=csv`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired — please sign in again.");
        throw new Error("Export failed. Please try again.");
      }

      const csv = await res.text();
      downloadBlob(new Blob([csv], { type: "text/csv" }), `recruitment-report-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <button className="btn btn-dark" onClick={handleExport} disabled={exporting}>
        {exporting ? "Exporting…" : "Export CSV"}
      </button>
      {error && <p className="form-error mt-8">{error}</p>}
    </div>
  );
}
