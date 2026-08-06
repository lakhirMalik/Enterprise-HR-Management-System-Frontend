import { motion } from "framer-motion";

function Button({ children, variant = "primary", loading = false, disabled = false, ...props }) {
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

  const isDisabled = loading || disabled;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      style={{
        ...styles[variant],
        border: styles[variant].border || "none",
        borderRadius: "var(--radius-sm)",
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
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