import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

function AppLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <TopBar />
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "32px" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default AppLayout;