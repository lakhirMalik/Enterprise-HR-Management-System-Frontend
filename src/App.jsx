import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import LeavesPage from "./pages/LeavesPage";
import NotificationsPage from "./pages/NotificationsPage";
import TasksPage from "./pages/TasksPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import NotificationToast from "./components/ui/NotificationToast";
import AttendancePage from "./pages/AttendancePage";
import JobsPage from "./pages/JobsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute><LeavesPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/" element={<h1>HR Management System</h1>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
      <NotificationToast />
    </>
  );
}

export default App;