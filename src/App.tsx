import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import {
  useAuthStore
} from "./store/auth.store";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Devices from "./pages/Devices";
import Presence from "./pages/Presence";
import Vouchers from "./pages/Vouchers";
import Employees from "./pages/Employees";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore(
    (state) => state.token
  );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/devices"
          element={<Devices />}
        />

        <Route
          path="/presence"
          element={<Presence />}
        />

        <Route
          path="/vouchers"
          element={<Vouchers />}
        />

        <Route
          path="/employees"
          element={<Employees />}
        />

        <Route
          path="/audit-logs"
          element={<AuditLogs />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}
