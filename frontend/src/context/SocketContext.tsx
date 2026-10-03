import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import { apiSlice } from "../store/api/apiSlice";
import Toast from "../components/common/Toast";
import type { NotificationItem, Task } from "../types";
import type { RootState, AppDispatch } from "../store/store";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  showNotification: (notif: NotificationItem) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL as string;
  }
  if (import.meta.env.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketUrl();

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState<NotificationItem | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user);

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
    newSocket.on("task:created", (task?: Task) => {
      console.log("[Socket.IO] New task broadcast:", task?.title);
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    newSocket.on("task:updated", (task?: Task) => {
      console.log("[Socket.IO] Task updated broadcast:", task?.title);
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    newSocket.on("task:deleted", ({ id }: { id: string }) => {
      console.log("[Socket.IO] Task deleted broadcast:", id);
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    // 3. User-Specific Toast Notifications
    newSocket.on("notification:new_task", (data: { title?: string; message?: string }) => {
      console.log("[Socket.IO] New task assigned notification:", data);
      setNotification({
        title: data.title || "New Task Assigned",
        message: data.message || "A new task has been assigned to you.",
        type: "info",
      });
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    newSocket.on("notification:task_updated", (data: { title?: string; message?: string }) => {
      console.log("[Socket.IO] Task updated notification:", data);
      setNotification({
        title: data.title || "Task Updated",
        message: data.message || "A task assigned to you was updated.",
        type: "info",
      });
      dispatch(apiSlice.util.invalidateTags(["Tasks"]));
    });

    // 4. RabbitMQ Background Report Completed Notification!
    newSocket.on(
      "notification:report_ready",
      (payload: { title?: string; message?: string; data?: { downloadUrl?: string } }) => {
        console.log("[Socket.IO] RabbitMQ report completed:", payload);
        setNotification({
          title: payload.title || "Analytics Report Ready!",
          message: payload.message || "Your background export is complete and ready to download.",
          downloadUrl: payload.data?.downloadUrl,
          type: "report",
        });
      }
    );

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

  const showNotification = (notif: NotificationItem) => {
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

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
