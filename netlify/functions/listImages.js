// netlify/functions/listMedia.js
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async () => {
  try {
    /*  ────── 1) buscamos TODO lo que haya en la carpeta wed-master ────── */
    const res = await cloudinary.search
      .expression('folder:wed-master')          // misma carpeta que en tus uploads
      .sort_by('public_id','desc')              // más reciente primero
      .with_field('context')                    // por si añades metadatos
      .max_results(500)                         // ajusta si necesitas paginar
      .execute();

    /*  ────── 2) devolvemos sólo lo que usará el front ────── */
    const items = res.resources.map(r => ({
      url:            r.secure_url,
      public_id:      r.public_id,
      resource_type:  r.resource_type,   // 'image' | 'video'
      format:         r.format,
      bytes:          r.bytes,
      width:          r.width,
      height:         r.height,
      duration:       r.duration         // sólo vídeos
    }));

    return {
      statusCode: 200,
      headers:    { 'Content-Type': 'application/json' },
      body:       JSON.stringify(items)
    };

  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers:    { 'Content-Type': 'application/json' },
      body:       JSON.stringify({ error: e.message })
    };
  }
};
