import mongoose from "mongoose";

const url = process.env.MONGOURL;

export async function connectDB() {
  // Evita reconectar si ya está conectado o conectando
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(url, {
      maxPoolSize: 10, // control de pool, ajusta si necesitas
      // No necesitas pasar useNewUrlParser ni useUnifiedTopology en versiones recientes
    });
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error; // Opcional: lanzar para manejar error en llamada externa
  }
}
