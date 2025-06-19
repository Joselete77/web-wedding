// netlify/functions/upload.js  (usa esta ruta en el fetch del front-end)
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event) {
  try {
    if (event.headers["content-type"] !== "application/json") {
      return { statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Content-Type debe ser application/json" }) };
    }

    const { filename, mimeType, data } = JSON.parse(event.body || "{}");
    if (!filename || !mimeType || !data) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Faltan filename, mimeType o data" }) };
    }

    const dataUri = `data:${mimeType};base64,${data}`;
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder:        "wed-master",
      public_id:     filename.replace(/\.[^/.]+$/, ""),
      resource_type: "auto"           // <-- DETECTA imagen o vídeo
    });

    return { statusCode: 200, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: uploadResult.public_id, url: uploadResult.secure_url }) };

  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Error inesperado" }) };
  }
}
