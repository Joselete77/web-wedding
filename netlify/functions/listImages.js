// netlify/functions/listImages.js
import "dotenv/config"; 
import { v2 as cloudinary } from "cloudinary";

// 1) Configuración de Cloudinary (mismas credenciales que en upload.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event, context) {
  try {
    // 2) Llamamos a la API de Cloudinary para listar recursos
    //    Aquí filtramos por prefix="wed-master/" para que sólo aparezcan
    //    las imágenes que subimos a esa carpeta.
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "wed-master/",   // Ajusta si tu carpeta cambia
      max_results: 100         // Puedes aumentar si tienes más de 100 imágenes
    });

    // 3) `result.resources` es un array de objetos, cada uno con info de la imagen:
    //    {
    //      public_id: "wed-master/miImagen1",
    //      format: "png",
    //      width: 800,
    //      height: 600,
    //      url: "http://res.cloudinary.com/…/wed-master/miImagen1.png",
    //      secure_url: "https://res.cloudinary.com/…/wed-master/miImagen1.png",
    //      …otras propiedades…
    //    }
    //
    //    Para simplificar la respuesta, extraeremos sólo `public_id` y `secure_url`.
    const simplified = result.resources.map((res) => ({
      public_id: res.public_id,
      url:       res.secure_url
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simplified)
    };
  } catch (err) {
    // 4) Si ocurre algún fallo (credenciales, límite de API, etc.), devolvemos error
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Error al listar imágenes." })
    };
  }
}
