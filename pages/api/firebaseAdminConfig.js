import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // This is crucial for multi-line private key
            }),
            // ... other config
        });
    } catch (error) {
        console.error("Error al inicializar Firebase Admin:", error);
    }
}

export const auth = admin.auth();
export default admin;