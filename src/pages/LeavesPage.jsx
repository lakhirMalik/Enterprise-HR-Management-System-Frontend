import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import {
  requestLeaveApi,
  getMyLeavesApi,
  getAllLeavesApi,
  updateLeaveStatusApi,
} from "../api/leave.api";

const statusColors = {
  pending: "var(--color-gold)",
  approved: "var(--color-sage)",
  rejected: "var(--color-rust)",
};

function LeavesPage() {
  const { user } = useAuth();
  const canApprove = user?.role === "hr" || user?.role === "manager" || user?.role === "super_admin";

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = canApprove ? await getAllLeavesApi() : await getMyLeavesApi();
      setLeaves(res.data.leaves);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await requestLeaveApi({ startDate, endDate, reason });
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaves();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateLeaveStatusApi(id, status);
      setLeaves((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Leave Requests</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {canApprove ? "Review and manage team leave requests." : "Request time off and track your history."}
      </p>

      {!canApprove && (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            marginBottom: "32px",
            maxWidth: "480px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>New request</h3>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  marginTop: "4px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  marginTop: "4px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                marginTop: "4px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {formError && <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>}

          <Button type="submit" variant="gold" loading={submitting}>
            Submit request
          </Button>
        </motion.form>
      )}

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {error && <p style={{ color: "var(--color-rust)" }}>{error}</p>}
      {!loading && !error && leaves.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No leave requests found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {leaves.map((leave, i) => (
            <motion.div
              key={leave._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "var(--shadow-sm)",
                borderLeft: `4px solid ${statusColors[leave.status]}`,
              }}
            >
              {canApprove && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{leave.employee?.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{leave.employee?.email}</div>
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Dates</div>
                <div style={{ fontSize: "14px" }}>
                  {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                </div>
              </div>

              <div style={{ flex: 2 }}>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Reason</div>
                <div style={{ fontSize: "14px" }}>{leave.reason}</div>
              </div>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: `color-mix(in srgb, ${statusColors[leave.status]} 15%, white)`,
                  color: statusColors[leave.status],
                  textTransform: "capitalize",
                }}
              >
                {leave.status}
              </div>

              {canApprove && leave.status === "pending" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleStatusUpdate(leave._id, "approved")}
                    style={{
                      background: "var(--color-sage)",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(leave._id, "rejected")}
                    style={{
                      background: "transparent",
                      color: "var(--color-rust)",
                      border: "1px solid var(--color-rust)",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default LeavesPage;