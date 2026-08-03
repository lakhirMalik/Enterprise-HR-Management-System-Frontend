import { motion } from "framer-motion";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";

function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "16px",
        padding: "20px 32px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div
            style={{
              width: "4px",
              height: "28px",
              borderRadius: "2px",
              background: `var(--role-${user.role})`,
            }}
          />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{user.role}</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{user.id.slice(-6)}</div>
          </div>
        </motion.div>
      )}
      <button
        onClick={handleLogout}
        style={{
          background: "transparent",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 16px",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default TopBar;