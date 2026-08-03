import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const roleStripes = ["--role-super_admin", "--role-hr", "--role-manager", "--role-employee", "--role-candidate"];

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Brand panel */}
      <div
        style={{
          flex: "1 1 45%",
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>HR/OS</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h2 style={{ fontSize: "36px", lineHeight: 1.2, marginBottom: "16px", maxWidth: "420px" }}>
            Every role, one record.
          </h2>
          <p style={{ color: "rgba(247,247,245,0.65)", fontSize: "15px", maxWidth: "380px" }}>
            Access, permissions, and approvals — organized the way your company actually works.
          </p>

          {/* Signature: animated role stripes */}
          <div style={{ display: "flex", gap: "6px", marginTop: "32px" }}>
            {roleStripes.map((role, i) => (
              <motion.div
                key={role}
                initial={{ height: 0 }}
                animate={{ height: "40px" }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                style={{
                  width: "6px",
                  background: `var(${role})`,
                  borderRadius: "3px",
                }}
              />
            ))}
          </div>
        </motion.div>

        <div style={{ fontSize: "12px", color: "rgba(247,247,245,0.4)" }}>
          Enterprise HR Management System
        </div>
      </div>

      {/* Form panel */}
      <div
        style={{
          flex: "1 1 55%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-paper)",
        }}
      >
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ width: "100%", maxWidth: "360px", padding: "24px" }}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "6px" }}>Welcome back</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
            Sign in to your account
          </p>

          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "16px" }}
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="gold" loading={loading}>
            Sign in
          </Button>
        </motion.form>
      </div>
    </div>
  );
}

export default LoginPage;