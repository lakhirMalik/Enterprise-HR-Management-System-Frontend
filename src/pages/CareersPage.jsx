import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getJobsApi, applyToJobApi, getMyApplicationsApi } from "../api/job.api";
import { useAuth } from "../auth/useAuth";
import Button from "../components/ui/Button";

function CareersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [applyModalJob, setApplyModalJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

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

  const openApplyModal = (job) => {
    if (!user) {
      sessionStorage.setItem("applyAfterLogin", job._id);
      navigate("/register");
      return;
    }
    setApplyModalJob(job);
    setCoverLetter("");
    setPhone("");
    setPortfolioUrl("");
    setResumeFile(null);
    setApplyError("");
  };

  const submitApplication = async (jobId) => {
    setApplying(true);
    setApplyError("");
    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      formData.append("phone", phone);
      formData.append("portfolioUrl", portfolioUrl);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      await applyToJobApi(jobId, formData);
      await fetchMyApplications();
      setApplyModalJob(null);
    } catch (err) {
      setApplyError(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    submitApplication(applyModalJob._id);
  };

  // If we arrived here after registering/logging in specifically to apply, open the modal for that job
  useEffect(() => {
    const pendingJobId = sessionStorage.getItem("applyAfterLogin");
    if (pendingJobId && user && jobs.length > 0) {
      sessionStorage.removeItem("applyAfterLogin");
      const job = jobs.find((j) => j._id === pendingJobId);
      if (job) {
        setApplyModalJob(job);
        setCoverLetter("");
        setPhone("");
        setPortfolioUrl("");
        setResumeFile(null);
      }
    }
  }, [user, jobs]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-paper)" }}>
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
          <span style={{ color: "rgba(247,247,245,0.6)", fontSize: "14px" }}>Signed in as {user.role}</span>
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
                  disabled={hasApplied(job._id)}
                  onClick={() => openApplyModal(job)}
                  style={{ width: "auto", padding: "10px 22px", flexShrink: 0 }}
                >
                  {hasApplied(job._id) ? "Applied" : "Apply"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModalJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !applying && setApplyModalJob(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(27,36,48,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "var(--shadow-lg)",
                margin: "auto",
              }}
            >
              <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>Apply for {applyModalJob.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
                {applyModalJob.department} · {applyModalJob.location}
              </p>

              <form onSubmit={handleModalSubmit}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px", fontSize: "14px" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Portfolio / LinkedIn</label>
                    <input
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://..."
                      style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Resume / CV (PDF, DOC, DOCX — max 5MB)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    marginTop: "4px",
                    marginBottom: "16px",
                    fontSize: "13px",
                  }}
                />

                <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  Cover letter <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell us why you're a good fit for this role..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    marginTop: "4px",
                    marginBottom: "16px",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />

                {applyError && (
                  <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{applyError}</p>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="submit" variant="gold" loading={applying}>
                    Submit application
                  </Button>
                  <button
                    type="button"
                    onClick={() => setApplyModalJob(null)}
                    disabled={applying}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 20px",
                      fontSize: "14px",
                      cursor: applying ? "default" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CareersPage;