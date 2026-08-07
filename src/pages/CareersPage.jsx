import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getJobsApi, applyToJobApi, getMyApplicationsApi } from "../api/job.api";
import { useAuth } from "../auth/useAuth";
import Button from "../components/ui/Button";

function CareersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

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
    if (!user) return;
    try {
      const res = await getMyApplicationsApi();
      setMyApplications(res.data.applications);
    } catch {
      // not a candidate or not logged in — ignore
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [user]);

  const hasApplied = (jobId) => myApplications.some((a) => a.job?._id === jobId);

  const handleApply = async (jobId) => {
    if (!user) {
      sessionStorage.setItem("applyAfterLogin", jobId);
      navigate("/register");
      return;
    }

    setApplyingId(jobId);
    try {
      await applyToJobApi(jobId, { coverLetter: "" });
      fetchMyApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  // If we arrived here after registering/logging in specifically to apply, finish that action
  useEffect(() => {
    const pendingJobId = sessionStorage.getItem("applyAfterLogin");
    if (pendingJobId && user) {
      sessionStorage.removeItem("applyAfterLogin");
      handleApply(pendingJobId);
    }
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-paper)" }}>
      {/* Public header — distinct from the internal HR/OS console */}
      <div
        style={{
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>HR/OS Careers</h1>
        {user && user.role !== "candidate" ? (
  <Link to="/dashboard" style={{ color: "var(--color-gold)", fontSize: "14px", fontWeight: 600 }}>
    Go to dashboard →
  </Link>
) : user && user.role === "candidate" ? (
  <span style={{ color: "rgba(247,247,245,0.6)", fontSize: "14px" }}>
    Signed in as {user.role}
  </span>
) : (
  <Link to="/login" style={{ color: "rgba(247,247,245,0.8)", fontSize: "14px" }}>
    Sign in
  </Link>
)}
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 style={{ fontSize: "32px", fontFamily: "var(--font-display)", marginBottom: "10px" }}>
            Join our team
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "15px", marginBottom: "40px" }}>
            Explore open roles and apply in a few clicks. No experience with our internal tools required.
          </p>
        </motion.div>

        {loading && <p style={{ color: "var(--color-text-muted)" }}>Loading roles...</p>}
        {!loading && jobs.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>No open positions right now — check back soon.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>{job.title}</h3>
                  <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
                    {job.department} · {job.location} · {job.employmentType?.replace("_", " ")}
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--color-text)", lineHeight: 1.5 }}>{job.description}</p>
                </div>

                <Button
                  variant={hasApplied(job._id) ? "ghost" : "gold"}
                  disabled={hasApplied(job._id) || applyingId === job._id}
                  loading={applyingId === job._id}
                  onClick={() => handleApply(job._id)}
                  style={{ width: "auto", padding: "10px 22px", flexShrink: 0 }}
                >
                  {hasApplied(job._id) ? "Applied" : "Apply"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CareersPage;