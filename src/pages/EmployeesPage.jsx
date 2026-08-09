import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import {
  getEmployeesApi,
  deleteEmployeeApi,
  createEmployeeApi,
  updateEmployeeApi,
  getUnlinkedUsersApi,
  onboardEmployeeApi,
} from "../api/employee.api";

function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManage = user?.role === "hr" || user?.role === "super_admin";

  const [showAddForm, setShowAddForm] = useState(false);
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDepartment, setEditDepartment] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [addMode, setAddMode] = useState("onboard"); // "onboard" or "link"
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("employee");
  const [onboardResult, setOnboardResult] = useState(null);
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

  const fetchUnlinkedUsers = async () => {
    try {
      const res = await getUnlinkedUsersApi();
      setUnlinkedUsers(res.data.users);
    } catch {
      // ignore, dropdown will just be empty
    }
  };

  const handleToggleAddForm = () => {
    const opening = !showAddForm;
    setShowAddForm(opening);
    if (opening) fetchUnlinkedUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee record?")) return;
    try {
      await deleteEmployeeApi(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createEmployeeApi({
        user: userId,
        department,
        position,
        salary: Number(salary),
      });
      setUserId("");
      setDepartment("");
      setPosition("");
      setSalary("");
      setShowAddForm(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnboardSubmit = async (e) => {
  e.preventDefault();
  setFormError("");
  setSubmitting(true);
  try {
    const res = await onboardEmployeeApi({
      name: newName,
      email: newEmail,
      role: newRole,
      department,
      position,
      salary: Number(salary),
    });
    setOnboardResult(res.data);
    setNewName("");
    setNewEmail("");
    setNewRole("employee");
    setDepartment("");
    setPosition("");
    setSalary("");
    fetchEmployees();
  } catch (err) {
    setFormError(err.response?.data?.message || "Failed to onboard employee");
  } finally {
    setSubmitting(false);
  }
};

  const startEdit = (emp) => {
    setEditingId(emp._id);
    setEditDepartment(emp.department);
    setEditPosition(emp.position);
    setEditSalary(emp.salary);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    setEditSubmitting(true);
    try {
      await updateEmployeeApi(id, {
        department: editDepartment,
        position: editPosition,
        salary: Number(editSalary),
      });
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    } finally {
      setEditSubmitting(false);
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
        {canManage && (
          <Button variant="gold" onClick={handleToggleAddForm} style={{ width: "auto", padding: "10px 20px" }}>
            {showAddForm ? "Cancel" : "+ Add Employee"}
          </Button>
        )}
      </div>

      <AnimatePresence>
  {showAddForm && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        background: "white",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "24px",
        marginBottom: "24px",
        maxWidth: "560px",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => { setAddMode("onboard"); setOnboardResult(null); setFormError(""); }}
          style={{
            flex: 1,
            padding: "8px",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "var(--radius-sm)",
            border: addMode === "onboard" ? "1.5px solid var(--color-gold)" : "1px solid var(--color-border)",
            background: addMode === "onboard" ? "color-mix(in srgb, var(--color-gold) 10%, white)" : "white",
            color: addMode === "onboard" ? "var(--color-gold)" : "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          Onboard New Hire
        </button>
        <button
          type="button"
          onClick={() => { setAddMode("link"); setOnboardResult(null); setFormError(""); }}
          style={{
            flex: 1,
            padding: "8px",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "var(--radius-sm)",
            border: addMode === "link" ? "1.5px solid var(--color-gold)" : "1px solid var(--color-border)",
            background: addMode === "link" ? "color-mix(in srgb, var(--color-gold) 10%, white)" : "white",
            color: addMode === "link" ? "var(--color-gold)" : "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          Link Existing User
        </button>
      </div>

      {onboardResult && (
        <div
          style={{
            background: "color-mix(in srgb, var(--color-sage) 10%, white)",
            border: "1px solid var(--color-sage)",
            borderRadius: "var(--radius-sm)",
            padding: "14px",
            marginBottom: "16px",
            fontSize: "13px",
          }}
        >
          <strong>{onboardResult.user.name}</strong> onboarded successfully.
          <br />
          Share these temporary login details with them:
          <br />
          Email: <code>{onboardResult.user.email}</code>
          <br />
          Temporary password: <code>{onboardResult.tempPassword}</code>
          <br />
          <span style={{ color: "var(--color-text-muted)" }}>
            This password is shown only once — they should change it after logging in.
          </span>
        </div>
      )}

      {addMode === "onboard" ? (
        <form onSubmit={handleOnboardSubmit}>
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Onboard a new hire</h3>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Creates a login account and employee record together. A temporary password will be generated.
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Full name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Position</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Salary</label>
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} required min="1" style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
          </div>

          {formError && <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>}

          <Button type="submit" variant="gold" loading={submitting}>
            Onboard employee
          </Button>
        </form>
      ) : (
        <form onSubmit={handleAddSubmit}>
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Link an existing user</h3>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            For users who already registered themselves (e.g. former candidates now being hired).
          </p>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>User</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px", fontSize: "14px" }}
            >
              <option value="">Select a user</option>
              {unlinkedUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) — {u.role}
                </option>
              ))}
            </select>
            {unlinkedUsers.length === 0 && (
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                No unlinked users available.
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Position</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Salary</label>
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} required min="1" style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
          </div>

          {formError && <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>}

          <Button type="submit" variant="gold" loading={submitting}>
            Add employee
          </Button>
        </form>
      )}
    </motion.div>
  )}
</AnimatePresence>

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
                boxShadow: "var(--shadow-sm)",
                borderLeft: `4px solid var(--role-${emp.user?.role || "employee"})`,
              }}
            >
              {editingId === emp._id ? (
                <div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                    <input
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      placeholder="Department"
                      style={{ flex: 1, padding: "8px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}
                    />
                    <input
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      placeholder="Position"
                      style={{ flex: 1, padding: "8px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}
                    />
                    <input
                      type="number"
                      value={editSalary}
                      onChange={(e) => setEditSalary(e.target.value)}
                      placeholder="Salary"
                      style={{ width: "120px", padding: "8px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => saveEdit(emp._id)}
                      disabled={editSubmitting}
                      style={{ background: "var(--color-sage)", color: "white", border: "none", borderRadius: "var(--radius-sm)", padding: "6px 14px", fontSize: "12px", cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 14px", fontSize: "12px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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

                  {canManage && (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Salary</div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>${emp.salary?.toLocaleString()}</div>
                    </div>
                  )}

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
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => startEdit(emp)}
                        style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: "12px", cursor: "pointer", color: "var(--color-rust)" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default EmployeesPage;