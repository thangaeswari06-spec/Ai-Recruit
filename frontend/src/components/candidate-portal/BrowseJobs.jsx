import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PortalNav from "./PortalNav";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/public/open`);
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load jobs");
        const { jobs } = await res.json();
        setJobs(jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const departments = useMemo(
    () => ["all", ...new Set(jobs.map((j) => j.department).filter(Boolean))],
    [jobs]
  );
  const locations = useMemo(
    () => ["all", ...new Set(jobs.map((j) => j.location).filter(Boolean))],
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q);
      const matchesDept = department === "all" || job.department === department;
      const matchesLoc = location === "all" || job.location === location;
      return matchesQuery && matchesDept && matchesLoc;
    });
  }, [jobs, query, department, location]);

  return (
    <div className="portal-page">
      <PortalNav />
      <div className="portal-container">
        <h1 className="portal-title">Open Roles</h1>
        <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
          {loading ? "Loading roles…" : `${filtered.length} role${filtered.length === 1 ? "" : "s"} open right now.`}
        </p>

        <div className="portal-filters">
          <input
            className="form-input portal-search"
            placeholder="Search by title or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="form-input portal-filter-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map((d) => (
              <option key={d} value={d}>{d === "all" ? "All departments" : d}</option>
            ))}
          </select>
          <select className="form-input portal-filter-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((l) => (
              <option key={l} value={l}>{l === "all" ? "All locations" : l}</option>
            ))}
          </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="flex flex-col gap-16">
          {filtered.map((job) => (
            <div key={job.id} className="portal-job-card">
              <div className="portal-job-card-main">
                <div className="portal-job-card-header">
                  <p className="portal-job-title">{job.title}</p>
                  {job.experience_level && <span className="badge badge-muted">{job.experience_level}</span>}
                </div>
                <p className="text-sm text-muted" style={{ marginBottom: 8 }}>{job.department} · {job.location}</p>
                {job.description && <p className="portal-job-desc">{job.description}</p>}
              </div>
              <Link to={`/portal/jobs/${job.id}/apply`} className="btn btn-primary btn-sm portal-job-apply">
                Apply
              </Link>
            </div>
          ))}

          {!loading && filtered.length === 0 && jobs.length > 0 && (
            <p className="text-muted text-sm">No roles match your search. Try clearing a filter.</p>
          )}
          {!loading && jobs.length === 0 && (
            <p className="text-muted text-sm">No open roles right now. Check back soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}