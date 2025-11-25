// server.js
import { server } from "./socket_server.js"; // ← Importar el server con sockets
import "./gemini_config.js";
import "./helpers/push_notifications_helper.js";

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

console.log("Environment:", process.env.JWT_SECRET);

// Usar el servidor que incluye WebSockets
server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor ejecutándose en: http://${HOST}:${PORT}`);
  console.log("🔌 Socket.io está activo y funcionando");
  console.log("📱 Listo para conexiones Flutter WebSocket");
});
