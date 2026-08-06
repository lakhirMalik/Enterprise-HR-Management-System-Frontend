import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import { assignTaskApi, getMyTasksApi, getAllTasksApi, updateTaskStatusApi } from "../api/task.api";
import { getEmployeesApi } from "../api/employee.api";

const statusColors = {
  pending: "var(--color-gold)",
  in_progress: "var(--color-steel)",
  completed: "var(--color-sage)",
};

function TasksPage() {
  const { user } = useAuth();
  const canAssign = user?.role === "hr" || user?.role === "manager" || user?.role === "super_admin";

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = canAssign ? await getAllTasksApi() : await getMyTasksApi();
      setTasks(res.data.tasks);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!canAssign) return;
    try {
      const res = await getEmployeesApi();
      setEmployees(res.data.employees);
    } catch {
      // ignore, form just won't have options
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await assignTaskApi({ title, description, assignedTo, dueDate });
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to assign task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateTaskStatusApi(id, status);
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Tasks</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {canAssign ? "Assign and track team tasks." : "Your assigned tasks."}
      </p>

      {canAssign && (
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
            maxWidth: "500px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Assign new task</h3>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px", fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Assign to</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.user?._id}>
                    {emp.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }}
              />
            </div>
          </div>

          {formError && <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>}

          <Button type="submit" variant="gold" loading={submitting}>
            Assign task
          </Button>
        </motion.form>
      )}

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {!loading && tasks.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>No tasks found.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {tasks.map((task, i) => (
            <motion.div
              key={task._id}
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
                borderLeft: `4px solid ${statusColors[task.status]}`,
              }}
            >
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{task.title}</div>
                {task.description && (
                  <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{task.description}</div>
                )}
                {canAssign && task.assignedTo?.name && (
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Assigned to {task.assignedTo.name}
                  </div>
                )}
              </div>

              {task.dueDate && (
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}

              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "none",
                  background: `color-mix(in srgb, ${statusColors[task.status]} 15%, white)`,
                  color: statusColors[task.status],
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default TasksPage;