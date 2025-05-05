import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const data = await request.formData();
  const image = data.get("file");

  if (!image) {
    return NextResponse.json("No se ha subido la imagen", { status: 400 });
  }

  // Verificar que el archivo es un objeto File válido
  if (!(image instanceof Blob || image instanceof File)) {
    return NextResponse.json("El archivo no es una imagen válida", { status: 400 });
  }

  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "Products" }, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }).end(buffer);
    });

    // Verificar si la respuesta tiene los campos correctos
    if (!response || !response.secure_url || !response.display_name) {
      throw new Error("Error al obtener la URL de la imagen.");
    }

    return NextResponse.json({
      preview: response.secure_url,
      name: response.display_name,
      isURL: true,
    });
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
