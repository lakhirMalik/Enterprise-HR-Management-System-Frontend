import { motion } from "framer-motion";
import { useAuth } from "../auth/useAuth";
import AppLayout from "../components/layout/AppLayout";

function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    { label: "Your Role", value: user?.role, color: `var(--role-${user?.role})` },
    { label: "Status", value: "Active", color: "var(--color-sage)" },
    { label: "Notifications", value: "0 unread", color: "var(--color-steel)" },
  ];

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Welcome back</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        Here's what's happening with your account.
      </p>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            style={{
              background: "white",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "20px 24px",
              minWidth: "180px",
              boxShadow: "var(--shadow-sm)",
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, textTransform: "capitalize" }}>
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

export default DashboardPage;