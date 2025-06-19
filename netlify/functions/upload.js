// netlify/functions/upload.js
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event, context) {
  console.log("=== INICIO DE FUNCIÓN UPLOAD ===");
  
  try {
    // Log del método HTTP
    console.log("Método HTTP:", event.httpMethod);
    
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Método no permitido. Use POST." })
      };
    }

    // Log de headers
    console.log("Content-Type:", event.headers["content-type"]);
    
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
      console.log("Body parseado correctamente");
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "JSON inválido en el body" })
      };
    }

    const { filename, mimeType, data } = body;
    console.log("Datos recibidos:", { 
      filename, 
      mimeType, 
      dataLength: data ? data.length : 0 
    });

    if (!data || !mimeType) {
      console.error("Faltan datos:", { hasData: !!data, hasMimeType: !!mimeType });
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta data (base64) o mimeType" })
      };
    }

    // Verificar configuración de Cloudinary
    console.log("Config Cloudinary:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    });

    const dataUri = `data:${mimeType};base64,${data}`;
    const isVideo = mimeType.startsWith('video/');
    
    console.log("Tipo de archivo:", { mimeType, isVideo });

    let uploadOptions = {
      folder: "wed-master",
      public_id: filename.split(".")[0],
    };

    if (isVideo) {
      uploadOptions.resource_type = "video";
      console.log("Configurando opciones para video");
    }

    console.log("Opciones de upload:", uploadOptions);
    console.log("Iniciando upload a Cloudinary...");

    const uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions);
    
    console.log("Upload exitoso:", {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      resource_type: uploadResult.resource_type
    });

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
    console.error("=== ERROR COMPLETO ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error completo:", err);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: `Error detallado: ${err.message}`,
        stack: err.stack
      })
    };
  }
}