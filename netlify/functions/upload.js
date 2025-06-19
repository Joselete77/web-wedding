// netlify/functions/upload.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event, context) {
  // Headers CORS
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Método no permitido" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { filename, mimeType, data } = body;

    if (!data || !mimeType || !filename) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Faltan datos requeridos" })
      };
    }

    const isVideo = mimeType.startsWith('video/');
    const dataUri = `data:${mimeType};base64,${data}`;

    // Opciones base
    const uploadOptions = {
      folder: "wed-master",
      public_id: filename.split(".")[0]
    };

    // Si es video, añadir resource_type
    if (isVideo) {
      uploadOptions.resource_type = "video";
      // Limitar tamaño para videos (opcional)
      uploadOptions.eager = [
        { width: 1280, height: 720, crop: "limit", quality: "auto:good" }
      ];
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        filename: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type
      })
    };

  } catch (error) {
    console.error("Error en upload:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Error: ${error.message}`,
        details: error.http_code || "Sin código HTTP"
      })
    };
  }
}