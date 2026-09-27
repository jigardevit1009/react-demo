import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

// Initialize Socket.IO with CORS
export const initSocket = (httpServer: HttpServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // In production, specify frontend URL (e.g. http://localhost:5173)
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        // Allow user to join their private notification room
        socket.on("join:user", (userId: string) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`[Socket.IO] User ${userId} joined room: user:${userId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

// Get active Socket.IO instance
export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io has not been initialized yet!");
    }
    return io;
};

// Helper 1: Broadcast to ALL connected clients
export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
        console.log(`[Socket.IO] Broadcast event "${event}":`, data?.title || data?.id || "");
    }
};

// Helper 2: Send private notification to a SPECIFIC user
export const emitToUser = (userId: string, event: string, data: any) => {
    if (io && userId) {
        io.to(`user:${userId}`).emit(event, data);
        console.log(`[Socket.IO] Private notification to user "${userId}" [${event}]:`, data?.title || "");
    }
};
