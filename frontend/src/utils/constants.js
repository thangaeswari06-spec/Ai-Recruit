export const APPLICATION_STAGES = Object.freeze({
  APPLIED: "applied",
  SCREENED: "screened",
  SHORTLISTED: "shortlisted",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEWED: "interviewed",
  HIRED: "hired",
  REJECTED: "rejected",
});

export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  RECRUITER: "recruiter",
  INTERVIEWER: "interviewer",
  CANDIDATE: "candidate",
});

export const JOB_STATUS = Object.freeze({
  DRAFT: "draft",
  OPEN: "open",
  PAUSED: "paused",
  CLOSED: "closed",
});

export const INTERVIEW_STATUS = Object.freeze({
  SCHEDULED: "scheduled",
  PENDING_APPROVAL: "pending_approval",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
});

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"],
  },

  {
    label: "Jobs",
    path: "/jobs",
    icon: "Briefcase",
    roles: ["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"],
  },

  {
    label: "Candidates",
    path: "/candidates",
    icon: "Users",
    roles: ["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"],
  },

  {
    label: "Interviews",
    path: "/interviews",
    icon: "CalendarClock",
    roles: ["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"],
  },

  // Analytics
  {
    label: "Analytics",
    path: "/analytics",
    icon: "BarChart3",
    roles: ["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"],
  },

  {
    label: "Settings",
    path: "/settings",
    icon: "Settings",
    roles: ["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"],
  },
];

export const RESUME_MAX_SIZE_MB = 5;

export const RESUME_ALLOWED_TYPES = [
  "application/pdf",
];

export const PAGE_SIZE = 20;