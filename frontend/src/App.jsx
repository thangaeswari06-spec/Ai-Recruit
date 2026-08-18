import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./components/dashboard/Dashboard";

import JobList from "./components/jobs/JobList";
import CreateJob from "./components/jobs/CreateJob";
import JobDetail from "./components/jobs/Jobdetail";

import CandidateList from "./components/candidates/CandidateList";
import CandidateDetail from "./components/candidates/CandidateDetail";

import Interview from "./components/interview/Interview";

import Analytics from "./components/analytics/Analytics";

import Settings from "./components/settings/Settings";

import ViewProfile from "./components/Profile/ViewProfile";

import PortalLogin from "./components/candidate-portal/PortalLogin";
import BrowseJobs from "./components/candidate-portal/BrowseJobs";
import ApplyJob from "./components/candidate-portal/ApplyJob";
import ApplicationStatus from "./components/candidate-portal/ApplicationStatus";
import PortalProfile from "./components/candidate-portal/PortalProfile";

import ChatWindow from "./components/chatbot/ChatWindow";


// =====================================================
// DASHBOARD / RECRUITER ROUTES
// =====================================================
function DashboardShellRoutes() {
  return (
    <>
      <Routes>
        {/* Full recruiting-pipeline access: admin, hr, recruiter */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin", "Admin", "hr", "HR", "recruiter", "Recruiter"]}
            />
          }
        >
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/new" element={<CreateJob />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Shared access: admin, hr, recruiter, AND interviewer */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin", "Admin", "hr", "HR", "recruiter", "Recruiter", "interviewer", "Interviewer"]}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interviews" element={<Interview />} />
          <Route path="/profile" element={<ViewProfile />} />
        </Route>
      </Routes>

      {/* AI Copilot */}
      <ChatWindow />
    </>
  );
}


// =====================================================
// MAIN APP
// =====================================================
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>

            {/* =========================
                DEFAULT ROUTE
            ========================= */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

            {/* =========================
                AUTH
            ========================= */}
            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/signup"
              element={<SignupPage />}
            />

            {/* =========================
                CANDIDATE PORTAL
            ========================= */}
            <Route
              path="/portal/login"
              element={<PortalLogin />}
            />

            <Route
              path="/portal/jobs"
              element={<BrowseJobs />}
            />

            <Route
              path="/portal/jobs/:jobId/apply"
              element={<ApplyJob />}
            />

            <Route
              path="/portal/status"
              element={<ApplicationStatus />}
            />

            <Route
              path="/portal/profile"
              element={<PortalProfile />}
            />

            {/* =========================
                RECRUITER APPLICATION
            ========================= */}
            <Route
              path="/*"
              element={<DashboardShellRoutes />}
            />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;