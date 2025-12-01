// socketServer.js
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import SocketService from "./services/socket_service.js";

// 1. Crear servidor HTTP con tu app de Express
const server = createServer(app);

// 2. Inicializar Socket.io con el servidor
const io = new Server(server, {
  cors: {
    origin: "*", // En producción cambia a tu dominio Flutter
    methods: ["GET", "POST"],
    credentials: false,
  },
  pingTimeout: 60000, // 60 segundos
  pingInterval: 25000, // 25 segundos
});

// 3. Inicializar el servicio de sockets
const socketService = new SocketService(io);

// Función de conveniencia para emitir notificaciones
const emitNewNotification = (userId) => {
  socketService.emitNewNotification(userId);
};

export { server, io, socketService, emitNewNotification };
