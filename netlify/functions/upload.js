// netlify/functions/upload.js
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event, context) {
  try {
    if (event.headers["content-type"] !== "application/json") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Content-Type debe ser application/json" })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "JSON inválido en el body" })
      };
    }

    const { filename, mimeType, data } = body;
    if (!data || !mimeType) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta data (base64) o mimeType" })
      };
    }

    const dataUri = `data:${mimeType};base64,${data}`;
    
    // Detectar si es video
    const isVideo = mimeType.startsWith('video/');
    
    let uploadOptions = {
      folder: "wed-master",
      public_id: filename.split(".")[0],
    };

    // Agregar opciones específicas para videos
    if (isVideo) {
      uploadOptions.resource_type = "video";
      uploadOptions.quality = "auto";
      // Opcional: convertir a mp4 para compatibilidad
      uploadOptions.format = "mp4";
    }

    console.log("Subiendo archivo:", { filename, mimeType, isVideo });
    
    const uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: uploadResult.public_id,
        url: uploadResult.secure_url,
        resource_type: uploadResult.resource_type || "image"
      })
    };
  } catch (err) {
    console.error("Error detallado:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: `Error al subir ${mimeType}: ${err.message}`
      })
    };
  }
}