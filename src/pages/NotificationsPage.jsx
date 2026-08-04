import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import { useSocket } from "../auth/SocketContext";
import { getMyNotificationsApi, markAsReadApi } from "../api/notification.api";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { latestNotification } = useSocket();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getMyNotificationsApi();
      setNotifications(res.data.notifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Refetch when a new live notification arrives, so the list stays current
  useEffect(() => {
    if (latestNotification) {
      fetchNotifications();
    }
  }, [latestNotification]);

  const handleMarkAsRead = async (id) => {
    await markAsReadApi(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Notifications</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        Stay updated on leave approvals, salary changes, and more.
      </p>

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {!loading && notifications.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No notifications yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {notifications.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              style={{
                background: n.isRead ? "white" : "var(--color-paper-dim)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: n.isRead ? "default" : "pointer",
                borderLeft: `4px solid ${n.isRead ? "var(--color-border)" : "var(--color-gold)"}`,
              }}
            >
              {!n.isRead && (
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-gold)" }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: n.isRead ? 400 : 600 }}>{n.message}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: "999px",
                  background: "var(--color-paper-dim)",
                  color: "var(--color-text-muted)",
                  textTransform: "capitalize",
                }}
              >
                {n.type}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default NotificationsPage;