import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerApi } from "../api/auth.api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerApi({ name, email, password, role: "candidate" });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-paper)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "6px" }}>Create your account</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "28px" }}>
          Track applications and apply to open roles.
        </p>

        {success ? (
          <div>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-sage)", display: "inline-block", marginRight: "8px" }} />
            <span style={{ fontSize: "14px" }}>Account created. Please check your email to verify, then log in.</span>
            <div style={{ marginTop: "20px" }}>
              <Link to="/login" style={{ color: "var(--color-gold)", fontWeight: 600, fontSize: "14px" }}>
                Go to login →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "16px" }}>
                {error}
              </motion.p>
            )}

            <Button type="submit" variant="gold" loading={loading}>
              Create account
            </Button>

            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "16px", textAlign: "center" }}>
              Already have an account? <Link to="/login" style={{ color: "var(--color-gold)", fontWeight: 600 }}>Sign in</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default RegisterPage;