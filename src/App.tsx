import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "./store/auth.store";
import AppLayout from "./layouts/AppLayout";
import Loading from "./components/Loading";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Customers = lazy(() => import("./pages/Customers"));
const Devices = lazy(() => import("./pages/Devices"));
const Presence = lazy(() => import("./pages/Presence"));
const Vouchers = lazy(() => import("./pages/Vouchers"));
const VoucherRedemption = lazy(() => import("./pages/VoucherRedemption"));
const Employees = lazy(() => import("./pages/Employees"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const Settings = lazy(() => import("./pages/Settings"));
const Benefits = lazy(() => import("./pages/Benefits"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<Loading label="Loading page..." />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/presence" element={<Presence />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/redeem" element={<VoucherRedemption />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/benefits" element={<Benefits />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
