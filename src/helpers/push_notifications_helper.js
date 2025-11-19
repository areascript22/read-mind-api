import admin from "firebase-admin";
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

if (!credentials) {
  console.error(
    "❌ ERROR: No se encontraron las credenciales de Firebase en GOOGLE_APPLICATION_CREDENTIALS"
  );
  throw new Error("Firebase credentials missing");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });

  console.log("🔥 Firebase Admin inicializado correctamente");
}

export const sendPushNotification = async (token, notificationData = {}) => {
  try {
    const message = {
      token: token,
      notification: {
        title: notificationData.title || "Nueva notificación",
        body: notificationData.body || "",
      },
      data: notificationData.data || {}, // opcional
    };

    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (err) {
    console.error("❌ Error enviando notificación:", err);
    return { success: false, error: err };
  }
};
