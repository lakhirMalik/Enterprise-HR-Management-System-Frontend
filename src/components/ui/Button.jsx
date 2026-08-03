import { motion } from "framer-motion";

function Button({ children, variant = "primary", loading = false, ...props }) {
  const styles = {
    primary: {
      background: "var(--color-ink)",
      color: "var(--color-paper)",
    },
    gold: {
      background: "var(--color-gold)",
      color: "var(--color-ink)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-ink)",
      border: "1px solid var(--color-border)",
    },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      style={{
        ...styles[variant],
        border: styles[variant].border || "none",
        borderRadius: "var(--radius-sm)",
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
      }}
      {...props}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
}

export default Button;