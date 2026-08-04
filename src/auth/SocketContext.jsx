import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", user.id);
    });

    socket.on("notification", (data) => {
      setLatestNotification(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ latestNotification }}>
      {children}
    </SocketContext.Provider>
  );
};