import { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { apiSlice } from "../store/api/apiSlice";
import Toast from "../components/common/Toast";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("[Socket.IO Client] Connected with ID:", newSocket.id);
      setIsConnected(true);

      // Join private user room if logged in
      if (user?.id) {
        newSocket.emit("join:user", user.id);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("[Socket.IO Client] Disconnected from server");
      setIsConnected(false);
    });

    // 2. Real-Time Task Board Invalidation (Auto-syncs task board across all clients)
    newSocket.on("task:created", (task) => {
      console.log("[Socket.IO] New task broadcast:", task?.title);
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    newSocket.on("task:updated", (task) => {
      console.log("[Socket.IO] Task updated broadcast:", task?.title);
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    newSocket.on("task:deleted", ({ id }) => {
      console.log("[Socket.IO] Task deleted broadcast:", id);
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    // 3. User-Specific Toast Notifications
    newSocket.on("notification:new_task", (data) => {
      console.log("[Socket.IO] New task assigned notification:", data);
      setNotification({
        title: data.title || "New Task Assigned",
        message: data.message || "A new task has been assigned to you.",
        type: "info",
      });
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    newSocket.on("notification:task_updated", (data) => {
      console.log("[Socket.IO] Task updated notification:", data);
      setNotification({
        title: data.title || "Task Updated",
        message: data.message || "A task assigned to you was updated.",
        type: "info",
      });
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    // 4. RabbitMQ Background Report Completed Notification!
    newSocket.on("notification:report_ready", (payload) => {
      console.log("[Socket.IO] RabbitMQ report completed:", payload);
      setNotification({
        title: payload.title || "Analytics Report Ready!",
        message: payload.message || "Your background export is complete and ready to download.",
        downloadUrl: payload.data?.downloadUrl,
        type: "report",
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [dispatch]);

  // Re-join user room whenever active user changes
  useEffect(() => {
    if (socket && isConnected && user?.id) {
      socket.emit("join:user", user.id);
    }
  }, [socket, isConnected, user?.id]);

  const showNotification = (notif) => {
    setNotification(notif);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, showNotification }}>
      {children}
      <Toast notification={notification} onDismiss={dismissNotification} />
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
