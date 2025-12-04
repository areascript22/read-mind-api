import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import SocketService from "./services/socket_service.js";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const socketService = new SocketService(io);

const emitNewNotification = (userId) => {
  socketService.emitNewNotification(userId);
};

export { server, io, socketService, emitNewNotification };
