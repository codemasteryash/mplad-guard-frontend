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
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";

// Leaflet is heavy — only load it when the Map page is actually visited.
const MapPage = lazy(() => import("./pages/MapPage"));

function MapFallback() {
  return (
    <div className="flex h-[560px] items-center justify-center rounded-xl2 border border-ink-200 bg-white">
      <p className="text-sm text-ink-400">Loading map…</p>
    </div>
  );
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
                    <Suspense fallback={<MapFallback />}>
                      <MapPage />
                    </Suspense>
                  }
                />
                <Route path="/project/:id" element={<ScorecardPage />} />
                <Route path="/reports" element={<PlaceholderPage />} />
                <Route path="/alerts" element={<PlaceholderPage />} />
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
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </DataStoreProvider>
    </AuthProvider>
  );
}
