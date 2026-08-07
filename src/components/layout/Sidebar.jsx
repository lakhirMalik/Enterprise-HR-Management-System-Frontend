import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Employees", path: "/employees" },
  { label: "Leaves", path: "/leaves" },
  { label: "Tasks", path: "/tasks" },
  { label: "Notifications", path: "/notifications" },
  { label: "Attendance", path: "/attendance" },
  { label: "Jobs", path: "/jobs" },
  { label: "Settings", path: "/settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <h2 style={{ fontSize: "20px", marginBottom: "32px", paddingLeft: "8px" }}>HR/OS</h2>

      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <motion.div
            key={item.path}
            onClick={() => navigate(item.path)}
            whileHover={{ x: 4 }}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              background: active ? "rgba(212,162,78,0.15)" : "transparent",
              color: active ? "var(--color-gold)" : "rgba(247,247,245,0.75)",
              borderLeft: active ? "3px solid var(--color-gold)" : "3px solid transparent",
            }}
          >
            {item.label}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default Sidebar;