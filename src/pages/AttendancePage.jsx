import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import {
  checkInApi,
  checkOutApi,
  getMyAttendanceApi,
  getAllAttendanceApi,
} from "../api/attendance.api";

const statusColors = {
  present: "var(--color-sage)",
  absent: "var(--color-rust)",
  half_day: "var(--color-gold)",
  on_leave: "var(--color-steel)",
};

function AttendancePage() {
  const { user } = useAuth();
  const canViewAll = user?.role === "hr" || user?.role === "manager" || user?.role === "super_admin";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = canViewAll ? await getAllAttendanceApi() : await getMyAttendanceApi();
      setRecords(res.data.records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecord = records.find((r) => {
    const d = new Date(r.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime() && r.employee?._id === user?.id === undefined ? true : true;
  });
  const myTodayRecord = !canViewAll
    ? records.find((r) => {
        const d = new Date(r.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
    : null;

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      await checkInApi();
      setMessage("Checked in successfully");
      fetchRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      await checkOutApi();
      setMessage("Checked out successfully");
      fetchRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to check out");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Attendance</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {canViewAll ? "Team attendance records." : "Check in and track your attendance history."}
      </p>

      {!canViewAll && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            marginBottom: "32px",
            maxWidth: "400px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h3 style={{ fontSize: "16px" }}>Today</h3>
          {myTodayRecord ? (
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              Checked in at {new Date(myTodayRecord.checkIn).toLocaleTimeString()}
              {myTodayRecord.checkOut && (
                <> — checked out at {new Date(myTodayRecord.checkOut).toLocaleTimeString()}</>
              )}
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              You haven't checked in today.
            </div>
          )}

          {message && <p style={{ fontSize: "13px", color: "var(--color-steel)" }}>{message}</p>}

          <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="gold" loading={actionLoading} onClick={handleCheckIn} disabled={!!myTodayRecord}>
                Check In
            </Button>
            <Button
              variant="ghost"
              loading={actionLoading}
              onClick={handleCheckOut}
              disabled={!myTodayRecord || !!myTodayRecord?.checkOut}
            >
              Check Out
            </Button>
          </div>
        </motion.div>
      )}

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {!loading && records.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>No records yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {records.map((r, i) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
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
              borderLeft: `4px solid ${statusColors[r.status]}`,
            }}
          >
            {canViewAll && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{r.employee?.name}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{r.employee?.email}</div>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Date</div>
              <div style={{ fontSize: "14px" }}>{new Date(r.date).toLocaleDateString()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Check in</div>
              <div style={{ fontSize: "14px" }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—"}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Check out</div>
              <div style={{ fontSize: "14px" }}>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—"}</div>
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "999px",
                background: `color-mix(in srgb, ${statusColors[r.status]} 15%, white)`,
                color: statusColors[r.status],
                textTransform: "capitalize",
              }}
            >
              {r.status.replace("_", " ")}
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}

export default AttendancePage;