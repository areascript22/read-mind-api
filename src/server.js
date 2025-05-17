import app from "./app.js";

const PORT = process.env.PORT || 3000; // Por si no tienes una variable de entorno
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on: http://${HOST}:${PORT}`);
});
