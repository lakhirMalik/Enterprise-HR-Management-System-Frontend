import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../auth/useAuth";
import { getEmployeesApi, deleteEmployeeApi } from "../api/employee.api";

function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManage = user?.role === "hr" || user?.role === "super_admin";

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getEmployeesApi();
      setEmployees(res.data.employees);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee record?")) return;
    try {
      await deleteEmployeeApi(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <AppLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Employees</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            {employees.length} {employees.length === 1 ? "record" : "records"}
          </p>
        </div>
      </div>

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {error && <p style={{ color: "var(--color-rust)" }}>{error}</p>}

      {!loading && !error && employees.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No employee records found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {employees.map((emp, i) => (
            <motion.div
              key={emp._id}
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
                borderLeft: `4px solid var(--role-${emp.user?.role || "employee"})`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>{emp.user?.name}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{emp.user?.email}</div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Department</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{emp.department}</div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Position</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{emp.position}</div>
              </div>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: `color-mix(in srgb, var(--role-${emp.user?.role || "employee"}) 15%, white)`,
                  color: `var(--role-${emp.user?.role || "employee"})`,
                  textTransform: "capitalize",
                }}
              >
                {emp.user?.role}
              </div>

              {canManage && (
                <button
                  onClick={() => handleDelete(emp._id)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "var(--color-rust)",
                  }}
                >
                  Delete
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default EmployeesPage;