import mongoose from "mongoose";

const url = process.env.MONGOURL;
console.log('URL de MongoDB:', url);

export async function connectDB() {
  // Verifica si ya existe una conexión activa para evitar reconectar innecesariamente.
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(url, {
      // Para versiones recientes de Mongoose y el driver de MongoDB:
      maxPoolSize: 10, // Ajusta este valor según la carga esperada.
      // Las siguientes opciones pueden no ser necesarias en Mongoose 6 en adelante,
      // pero se incluyen para mayor claridad o compatibilidad:
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
}
