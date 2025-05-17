// pages/api/firebaseAdminConfig.js
import admin from 'firebase-admin';

//console.log("Valor de FIREBASE_ADMIN_SDK_KEY:", process.env.FIREBASE_ADMIN_SDK_KEY); // <-- Añade esta línea

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY)),
            // databaseURL: "YOUR_FIREBASE_DATABASE_URL" (if you use Realtime Database)
        });
    } catch (error) {
        console.error("Error al inicializar Firebase Admin:", error);
    }
}

export const auth = admin.auth();
export default admin;