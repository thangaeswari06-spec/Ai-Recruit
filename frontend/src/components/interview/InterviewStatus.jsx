import { useState } from "react";
import { formatDateTime } from "../../utils/helpers";
import Modal from "../common/Modal";
import FeedbackForm from "./FeedbackForm";

const STATUS_CLASS = {
  scheduled: "badge-primary",
  completed: "badge-accent",
  cancelled: "badge-danger",
  no_show: "badge-muted",
};

export default function InterviewStatus({ interview, onUpdated }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const candidate = interview.applications?.candidates;
  const job = interview.applications?.jobs;

  return (
    <div className="card flex justify-between items-center">
      <div>
        <p style={{ fontWeight: 600 }}>{candidate?.name}</p>
        <p className="text-sm text-muted">{job?.title}</p>
        <p className="text-xs text-muted mt-8">{formatDateTime(interview.scheduled_at)}</p>
      </div>
      <div className="flex items-center gap-12">
        <span className={`badge ${STATUS_CLASS[interview.status] || "badge-muted"}`}>
          {interview.status.replace("_", " ")}
        </span>
        {interview.status === "scheduled" && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFeedbackOpen(true)}>
            Add feedback
          </button>
        )}
      </div>
      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Interview feedback">
        <FeedbackForm
          interview={interview}
          onSubmitted={() => {
            setFeedbackOpen(false);
            onUpdated?.();
          }}
        />
      </Modal>
    </div>
  );
}