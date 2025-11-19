import { sendPushNotification } from "../helpers/push_notifications_helper.js";

export const sendNotification = async (req, res) => {
  try {
    const { token, title, body, data } = req.body;

    if (!token) {
      return res.status(400).json({
        ok: false,
        message: "Token FCM es requerido",
      });
    }

    const result = await sendPushNotification(token, { title, body, data });

    if (!result.success) {
      return res.status(500).json({
        ok: false,
        message: "Error enviando notificación",
        error: result.error.toString(),
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Notificación enviada correctamente",
      response: result.response,
    });
  } catch (err) {
    console.error("❌ Error en sendNotification:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: err.toString(),
    });
  }
};
