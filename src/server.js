import { server } from "./socket_server.js";
import "./gemini_config.js";
import "./helpers/push_notifications_helper.js";
import "./jobs/activity_reminder_ job.js";

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

console.log("Environment:", process.env.JWT_SECRET);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor ejecutándose en: http://${HOST}:${PORT}`);
  console.log("🔌 Socket.io está activo y funcionando");
  console.log("📱 Listo para conexiones Flutter WebSocket");
});
