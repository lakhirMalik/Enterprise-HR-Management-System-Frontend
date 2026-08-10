import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../auth/useAuth";
import { setup2FAEmailApi, verify2FAEmailApi, changePasswordApi } from "../api/settings.api";
import {
  setup2FAApi,
  verify2FAApi,
  disable2FAApi,
  getSessionsApi,
  revokeSessionApi,
  revokeAllSessionsApi,
} from "../api/settings.api";

function SettingsPage() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [twoFAMessage, setTwoFAMessage] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [changePwLoading, setChangePwLoading] = useState(false);
const [changePwMessage, setChangePwMessage] = useState("");
const [changePwError, setChangePwError] = useState("");
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await getSessionsApi();
      setSessions(res.data.sessions);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSetup2FA = async () => {
    setSetupLoading(true);
    setTwoFAMessage("");
    try {
      const res = await setup2FAApi();
      setQrCode(res.data.qrCode);
    } catch (err) {
      setTwoFAMessage(err.response?.data?.message || "Failed to start 2FA setup");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSetupEmail2FA = async () => {
  setSetupLoading(true);
  setTwoFAMessage("");
  try {
    await setup2FAEmailApi();
    setEmailCodeSent(true);
    setTwoFAMessage("Code sent to your email");
  } catch (err) {
    setTwoFAMessage(err.response?.data?.message || "Failed to send code");
  } finally {
    setSetupLoading(false);
  }
};

const handleChangePassword = async (e) => {
  e.preventDefault();
  setChangePwError("");
  setChangePwMessage("");
  setChangePwLoading(true);
  try {
    await changePasswordApi(currentPassword, newPassword);
    setChangePwMessage("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
  } catch (err) {
    setChangePwError(err.response?.data?.message || "Failed to change password");
  } finally {
    setChangePwLoading(false);
  }
};

const handleVerifyEmail2FA = async (e) => {
  e.preventDefault();
  setVerifyLoading(true);
  setTwoFAMessage("");
  try {
    await verify2FAEmailApi(emailCode);
    setTwoFAMessage("Email 2FA enabled successfully");
    setEmailCodeSent(false);
    setEmailCode("");
  } catch (err) {
    setTwoFAMessage(err.response?.data?.message || "Invalid code");
  } finally {
    setVerifyLoading(false);
  }
};

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setTwoFAMessage("");
    try {
      await verify2FAApi(code);
      setTwoFAMessage("2FA enabled successfully");
      setQrCode(null);
      setCode("");
    } catch (err) {
      setTwoFAMessage(err.response?.data?.message || "Invalid code");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    await disable2FAApi();
    setTwoFAMessage("2FA disabled");
  };

  const handleRevoke = async (id) => {
    await revokeSessionApi(id);
    fetchSessions();
  };

  const handleRevokeAll = async () => {
    if (!confirm("Log out from all devices, including this one?")) return;
    await revokeAllSessionsApi();
    navigate("/login");
  };

  return (
    <AppLayout>
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>Settings</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
        Manage your security and active sessions.
      </p>

      {/* 2FA Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "white",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          marginBottom: "24px",
          maxWidth: "480px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Two-Factor Authentication</h3>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
          Add an extra layer of security to your account with an authenticator app.
        </p>

        {twoFAMessage && (
          <p style={{ fontSize: "13px", color: "var(--color-steel)", marginBottom: "12px" }}>{twoFAMessage}</p>
        )}

        {!qrCode && !emailCodeSent && (
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    <Button variant="gold" loading={setupLoading} onClick={handleSetup2FA} style={{ width: "auto", padding: "10px 20px" }}>
      Use Authenticator App
    </Button>
    <Button variant="ghost" loading={setupLoading} onClick={handleSetupEmail2FA} style={{ width: "auto", padding: "10px 20px" }}>
      Use Email Code
    </Button>
    <button
      onClick={handleDisable2FA}
      style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "10px 20px", fontSize: "13px", cursor: "pointer" }}
    >
      Disable 2FA
    </button>
  </div>
)}

{qrCode && (
  <form onSubmit={handleVerify2FA}>
    <img src={qrCode} alt="2FA QR Code" style={{ width: "180px", height: "180px", marginBottom: "12px" }} />
    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "10px" }}>
      Scan with your authenticator app, then enter the 6-digit code below.
    </p>
    <input
      value={code}
      onChange={(e) => setCode(e.target.value)}
      placeholder="123456"
      maxLength={6}
      style={{ width: "140px", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginRight: "10px", letterSpacing: "2px" }}
    />
    <Button type="submit" variant="gold" loading={verifyLoading} style={{ width: "auto", padding: "10px 20px", display: "inline-flex" }}>
      Verify
    </Button>
  </form>
)}

{emailCodeSent && (
  <form onSubmit={handleVerifyEmail2FA}>
    <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "10px" }}>
      Check your email for a 6-digit code.
    </p>
    <input
      value={emailCode}
      onChange={(e) => setEmailCode(e.target.value)}
      placeholder="123456"
      maxLength={6}
      style={{ width: "140px", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginRight: "10px", letterSpacing: "2px" }}
    />
    <Button type="submit" variant="gold" loading={verifyLoading} style={{ width: "auto", padding: "10px 20px", display: "inline-flex" }}>
      Verify
    </Button>
  </form>
)}
      </motion.div>

      {/* Sessions Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "white",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          maxWidth: "600px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px" }}>Active Sessions</h3>
          <button
            onClick={handleRevokeAll}
            style={{ background: "transparent", border: "1px solid var(--color-rust)", color: "var(--color-rust)", borderRadius: "var(--radius-sm)", padding: "6px 14px", fontSize: "12px", cursor: "pointer" }}
          >
            Log out everywhere
          </button>
        </div>

        {loadingSessions && <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Loading...</p>}
        {!loadingSessions && sessions.length === 0 && (
          <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>No active sessions.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sessions.map((s) => (
            <div
              key={s._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                background: "var(--color-paper-dim)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{s.userAgent}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  IP {s.ip} · Last active {new Date(s.lastActive).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleRevoke(s._id)}
                style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Change Password Section */}
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05 }}
  style={{
    background: "white",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "24px",
    marginBottom: "24px",
    maxWidth: "480px",
    boxShadow: "var(--shadow-sm)",
  }}
>
  <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Change Password</h3>

  <form onSubmit={handleChangePassword}>
    <div style={{ marginBottom: "12px" }}>
      <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Current password</label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }}
      />
    </div>

    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>New password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={6}
        style={{ width: "100%", padding: "10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "4px" }}
      />
    </div>

    {changePwMessage && <p style={{ color: "var(--color-sage)", fontSize: "13px", marginBottom: "12px" }}>{changePwMessage}</p>}
    {changePwError && <p style={{ color: "var(--color-rust)", fontSize: "13px", marginBottom: "12px" }}>{changePwError}</p>}

    <Button type="submit" variant="gold" loading={changePwLoading} style={{ width: "auto", padding: "10px 20px" }}>
      Update password
    </Button>
  </form>
</motion.div>
    </AppLayout>
  );
}

export default SettingsPage;