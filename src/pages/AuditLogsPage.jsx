import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import { getAuditLogsApi } from "../api/auditLog.api";

const actionColors = {
  "employee:delete": "var(--color-rust)",
  "employee:restore": "var(--color-sage)",
  "salary:update": "var(--color-gold)",
};

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogsApi();
      setLogs(res.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatAction = (action) => action.replace(":", " → ").replace("_", " ");

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Audit Logs</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        A record of sensitive actions taken across the system.
      </p>

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {error && <p style={{ color: "var(--color-rust)" }}>{error}</p>}
      {!loading && !error && logs.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No audit events recorded yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {logs.map((log, i) => (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            style={{
              background: "white",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "var(--shadow-sm)",
              borderLeft: `4px solid ${actionColors[log.action] || "var(--color-steel)"}`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, textTransform: "capitalize" }}>
                {formatAction(log.action)}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                by {log.actor?.name} ({log.actor?.role}) · {log.targetType} {log.targetId?.slice(-6)}
              </div>
            </div>

            {log.details && Object.keys(log.details).length > 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  fontFamily: "monospace",
                  background: "var(--color-paper-dim)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  maxWidth: "260px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={JSON.stringify(log.details)}
              >
                {JSON.stringify(log.details)}
              </div>
            )}

            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", flexShrink: 0 }}>
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

export default AuditLogsPage;