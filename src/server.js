import app from "./app.js";
import "./gemini_config.js";
//Start the server
const PORT = process.env.PORT || 3000; // Por si no tienes una variable de entorno
const HOST = "0.0.0.0";

console.log("Environment:", process.env.JWT_SECRET);

app.listen(PORT, HOST, () => {
  console.log(`Server running on: http://${HOST}:${PORT}`);
});
