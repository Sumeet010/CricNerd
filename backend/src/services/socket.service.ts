import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

// Step 1: Creating Socket.io instance
export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Step 2: Handling client connections
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room for a specific match to receive live score updates for that match
    // Room are specific to this project other then that code is written this way
    socket.on("joinMatch", (matchId: string) => {
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined match room: ${matchId}`);
    });

    socket.on("leaveMatch", (matchId: string) => {
      socket.leave(matchId);
      console.log(`Socket ${socket.id} left match room: ${matchId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};
