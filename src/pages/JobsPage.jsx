import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import {
  getJobsApi,
  createJobApi,
  closeJobApi,
  applyToJobApi,
  getMyApplicationsApi,
  getJobApplicationsApi,
  updateApplicationStatusApi,
} from "../api/job.api";

const appStatusColors = {
  submitted: "var(--color-gold)",
  reviewing: "var(--color-steel)",
  accepted: "var(--color-sage)",
  rejected: "var(--color-rust)",
};

function JobsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "hr" || user?.role === "super_admin";
  const isCandidate = user?.role === "candidate";

  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobsApi();
      setJobs(res.data.jobs);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!isCandidate) return;
    const res = await getMyApplicationsApi();
    setMyApplications(res.data.applications);
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createJobApi({ title, description, department, location });
      setTitle("");
      setDescription("");
      setDepartment("");
      setLocation("");
      fetchJobs();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    await closeJobApi(id);
    fetchJobs();
  };

  const handleApply = async (id) => {
    try {
      await applyToJobApi(id, { coverLetter: "" });
      fetchMyApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    }
  };

  const hasApplied = (jobId) => myApplications.some((a) => a.job?._id === jobId);

  const toggleApplicants = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    setExpandedJob(jobId);
    if (!applicantsByJob[jobId]) {
      const res = await getJobApplicationsApi(jobId);
      setApplicantsByJob((prev) => ({ ...prev, [jobId]: res.data.applications }));
    }
  };

  const handleAppStatus = async (jobId, appId, status) => {
    await updateApplicationStatusApi(appId, status);
    const res = await getJobApplicationsApi(jobId);
    setApplicantsByJob((prev) => ({ ...prev, [jobId]: res.data.applications }));
  };

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Open Positions</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        {canManage ? "Post and manage job openings." : "Browse and apply to open roles."}
      </p>

      {canManage && (
        <motion.form
          onSubmit={handlePostJob}
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
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Post a job</h3>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px", fontFamily: "inherit", resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote" style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }} />
            </div>
          </div>
          {formError && <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{formError}</p>}
          <Button type="submit" variant="gold" loading={submitting}>Post job</Button>
        </motion.form>
      )}

      {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>}
      {!loading && jobs.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>No open positions right now.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "18px 20px",
                boxShadow: "var(--shadow-sm)",
                borderLeft: "4px solid var(--color-gold)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                    {job.department} · {job.location} · {job.employmentType?.replace("_", " ")}
                  </div>
                </div>

                {isCandidate && (
                  <Button
                    variant={hasApplied(job._id) ? "ghost" : "gold"}
                    disabled={hasApplied(job._id)}
                    onClick={() => handleApply(job._id)}
                    style={{ width: "auto", padding: "8px 18px" }}
                  >
                    {hasApplied(job._id) ? "Applied" : "Apply"}
                  </Button>
                )}

                {canManage && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => toggleApplicants(job._id)}
                      style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}
                    >
                      {expandedJob === job._id ? "Hide" : "Applicants"}
                    </button>
                    <button
                      onClick={() => handleClose(job._id)}
                      style={{ background: "transparent", border: "1px solid var(--color-rust)", color: "var(--color-rust)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>

              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "10px" }}>{job.description}</p>

              {expandedJob === job._id && (
                <div style={{ marginTop: "16px", borderTop: "1px solid var(--color-border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(applicantsByJob[job._id] || []).length === 0 && (
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>No applicants yet.</p>
                  )}
                  {(applicantsByJob[job._id] || []).map((app) => (
                    <div key={app._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "var(--color-paper-dim)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{app.candidate?.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{app.candidate?.email}</div>
                      </div>
                      <select
                        value={app.status}
                        onChange={(e) => handleAppStatus(job._id, app._id, e.target.value)}
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          border: "none",
                          background: `color-mix(in srgb, ${appStatusColors[app.status]} 15%, white)`,
                          color: appStatusColors[app.status],
                          textTransform: "capitalize",
                          cursor: "pointer",
                        }}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default JobsPage;