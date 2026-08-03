import { useState } from "react";
import { motion } from "framer-motion";

function Input({ label, type = "text", value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const floated = focused || hasValue;

  return (
    <div style={{ position: "relative", marginBottom: "24px" }}>
      <motion.label
        animate={{
          top: floated ? "-9px" : "13px",
          fontSize: floated ? "12px" : "14px",
          color: focused ? "var(--color-gold)" : "var(--color-text-muted)",
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: "14px",
          background: "var(--color-paper)",
          padding: "0 6px",
          pointerEvents: "none",
          fontWeight: 500,
        }}
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "13px 14px",
          fontSize: "14px",
          border: `1.5px solid ${focused ? "var(--color-gold)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-sm)",
          outline: "none",
          transition: "border-color 0.15s ease",
          background: "var(--color-paper)",
          color: "var(--color-text)",
        }}
      />
    </div>
  );
}

export default Input;