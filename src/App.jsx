import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ROLES } from "./context/AuthContext";
import { DataStoreProvider } from "./context/DataStoreContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardShell from "./components/layout/DashboardShell";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ScorecardPage from "./pages/ScorecardPage";
import RecommendationPage from "./pages/RecommendationPage";
import ComplaintPage from "./pages/ComplaintPage";
import NotFoundPage from "./pages/NotFoundPage";

const MapPage = lazy(() => import("./pages/MapPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));

const SnaDashboardPage = lazy(() => import("./pages/sna/SnaDashboardPage"));
const SnaFundFlowPage = lazy(() => import("./pages/sna/SnaFundFlowPage"));
const SnaMpAllocationPage = lazy(() => import("./pages/sna/SnaMpAllocationPage"));
const SnaDistrictAllocationPage = lazy(() => import("./pages/sna/SnaDistrictAllocationPage"));
const SnaRiskPage = lazy(() => import("./pages/sna/SnaRiskPage"));
const SnaAlertsPage = lazy(() => import("./pages/sna/SnaAlertsPage"));

const IdaDashboardPage = lazy(() => import("./pages/ida/IdaDashboardPage"));
const IdaProjectsPage = lazy(() => import("./pages/ida/IdaProjectsPage"));
const IdaProjectDetailPage = lazy(() => import("./pages/ida/IdaProjectDetailPage"));
const IdaAssignAgencyPage = lazy(() => import("./pages/ida/IdaAssignAgencyPage"));
const IdaRiskPage = lazy(() => import("./pages/ida/IdaRiskPage"));
const IdaComplaintsPage = lazy(() => import("./pages/ida/IdaComplaintsPage"));

function PageFallback() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-xl2 border border-ink-200 bg-white">
      <p className="text-sm text-ink-400">Loading…</p>
    </div>
  );
}

function Lazy({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export default function App() {
  return (
    <AuthProvider>
      <DataStoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/map"
                  element={
                    <Lazy>
                      <MapPage />
                    </Lazy>
                  }
                />
                <Route path="/project/:id" element={<ScorecardPage />} />
                <Route
                  path="/reports"
                  element={
                    <Lazy>
                      <ReportsPage />
                    </Lazy>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <Lazy>
                      <AlertsPage />
                    </Lazy>
                  }
                />
                <Route
                  path="/recommendations"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.MP]}>
                      <RecommendationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.DISTRICT_AUTHORITY]}>
                      <ComplaintPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sna/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <SnaDashboardPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/fund-flow"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <SnaFundFlowPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/mp-allocation"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <SnaMpAllocationPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/district-allocation"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <SnaDistrictAllocationPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/projects"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/risk"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <SnaRiskPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/alerts"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <SnaAlertsPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sna/reports"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SNA, ROLES.ADMIN]}>
                      <Lazy>
                        <ReportsPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ida/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <IdaDashboardPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/projects"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <IdaProjectsPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/projects/:projectId"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <IdaProjectDetailPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/assign-agency"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <IdaAssignAgencyPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/risk"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <IdaRiskPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/complaints"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <IdaComplaintsPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/alerts"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <AlertsPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ida/reports"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.IDA, ROLES.ADMIN]}>
                      <Lazy>
                        <ReportsPage />
                      </Lazy>
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </DataStoreProvider>
    </AuthProvider>
  );
}
