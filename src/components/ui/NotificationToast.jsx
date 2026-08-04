import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../auth/SocketContext";

function NotificationToast() {
  const { latestNotification } = useSocket();
  const [visible, setVisible] = useState(false);
  const lastShownId = useRef(null);

  useEffect(() => {
    if (latestNotification && latestNotification._id !== lastShownId.current) {
      lastShownId.current = latestNotification._id;
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  return (
    <AnimatePresence>
      {visible && latestNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            padding: "14px 20px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-gold)" }} />
          {latestNotification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationToast;