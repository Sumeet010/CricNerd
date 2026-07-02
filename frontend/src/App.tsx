import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";


const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const Scorecard = lazy(() => import("@/pages/Scorecard"));
const TournamentDetail = lazy(() => import("@/pages/TournamentDetail"));
const InviteAccept = lazy(() => import("@/pages/InviteAccept"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#0c0c0e] flex flex-col items-center justify-center gap-4 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-[#fcf8e3]" />
              <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Loading Cricnerd...</span>
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected App routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournaments"
              element={
                <ProtectedRoute>
                  <Tournaments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournaments/:id"
              element={
                <ProtectedRoute>
                  <TournamentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-scoring/:matchId"
              element={
                <ProtectedRoute>
                  <Scorecard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scorecard/:matchId"
              element={
                <ProtectedRoute>
                  <Scorecard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
