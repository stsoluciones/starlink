import mongoose from "mongoose";

const url = process.env.MONGOURL;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(url, {
      maxPoolSize: 10,
      dbName: "nombre-de-tu-base", // Asegúrate de especificar esto si no está en la URL
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
  }
}
