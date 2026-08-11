import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const modules = [
  { title: "People & org", desc: "Employee records, org chart, documents, lifecycle status and onboarding." },
  { title: "Time & attendance", desc: "Clock in/out, remote days, timesheets and late-arrival insights." },
  { title: "Recruitment", desc: "Job postings, public careers page and a candidate pipeline from applied to hired." },
  { title: "Payroll", desc: "Salary structures, updates and history." },
  { title: "Tasks & performance", desc: "Assign work, track progress, and keep teams aligned." },
  { title: "Compliance", desc: "Role-based permissions, audit log and security event monitoring." },
];

function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-paper)" }}>
      {/* Nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 700 }}>HR/OS</div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link to="/careers" style={{ fontSize: "14px", color: "var(--color-text)" }}>Careers</Link>
          <Link
            to="/login"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              padding: "8px 18px",
              background: "var(--color-ink)",
              color: "var(--color-paper)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: "840px", margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-gold)", marginBottom: "16px", letterSpacing: "0.02em" }}>
            FIVE ROLES. ONE SOURCE OF TRUTH.
          </div>
          <h1 style={{ fontSize: "44px", lineHeight: 1.15, marginBottom: "20px" }}>
            The HR platform your whole company actually enjoys using.
          </h1>
          <p style={{ fontSize: "16px", color: "var(--color-text-muted)", maxWidth: "560px", margin: "0 auto 32px", lineHeight: 1.6 }}>
            People records, attendance, leave, tasks, hiring, and audit trails in a single fast workspace —
            with tailored views for HR, managers, employees, and candidates.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link
              to="/login"
              style={{
                padding: "12px 28px",
                background: "var(--color-gold)",
                color: "var(--color-ink)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Open the workspace
            </Link>
            <Link
              to="/careers"
              style={{
                padding: "12px 28px",
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Browse open roles
            </Link>
          </div>
        </motion.div>

        {/* Role stripe signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "48px" }}
        >
          {["--role-super_admin", "--role-hr", "--role-manager", "--role-employee", "--role-candidate"].map((role, i) => (
            <motion.div
              key={role}
              initial={{ height: 0 }}
              animate={{ height: "36px" }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
              style={{ width: "6px", background: `var(${role})`, borderRadius: "3px" }}
            />
          ))}
        </motion.div>
      </div>

      {/* Modules grid */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 100px" }}>
        <h2 style={{ fontSize: "22px", textAlign: "center", marginBottom: "8px" }}>Everything an HR team runs on</h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", textAlign: "center", marginBottom: "48px" }}>
          Modules are permission-aware — people only ever see the data their role allows.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>{m.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          color: "var(--color-text-muted)",
        }}
      >
        <div>HR/OS — Enterprise HR Management System</div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/careers" style={{ color: "var(--color-text-muted)" }}>Careers</Link>
          <Link to="/login" style={{ color: "var(--color-text-muted)" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
