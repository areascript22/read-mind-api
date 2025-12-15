class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on("connection", (socket) => {
      console.log("🔌 Usuario conectado:", socket.id);

      socket.on("user_connected", (userId) => {
        this.connectedUsers.set(userId, socket.id);
        socket.join(`user_${userId}`);
        console.log(`👤 Usuario ${userId} se unió a la sala: user_${userId}`);
      });

      socket.on("disconnect", () => {
        this.handleDisconnect(socket.id);
      });

      // Manejar errores
      socket.on("error", (error) => {
        console.error("❌ Error de socket:", error);
      });
    });
  }

  handleDisconnect(socketId) {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        this.connectedUsers.delete(userId);
        console.log(`👤 Usuario ${userId} desconectado`);
        break;
      }
    }
    console.log("🔌 Usuario desconectado:", socketId);
  }

  // Emitir evento a un usuario específico
  emitToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
    console.log(`📢 Emitido ${event} a user_${userId}`, data);
  }

  // Emitir nueva notificación (evento específico)
  emitNewNotification(userId) {
    this.emitToUser(userId, "new_notification", {
      message: "Tienes una nueva notificación",
      timestamp: new Date().toISOString(),
      userId: userId,
    });
  }

  // Verificar si un usuario está conectado
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Obtener socket ID de un usuario
  getUserSocketId(userId) {
    return this.connectedUsers.get(userId);
  }

  // Emitir a múltiples usuarios
  emitToUsers(userIds, event, data) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data);
    });
  }
}

export default SocketService;
