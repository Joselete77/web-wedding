import { v2 as cloudinary } from "cloudinary";
import busboy from "busboy";

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(event, context) {
  const bb = busboy({ headers: event.headers });
  let uploadResult;

  // parse multipart
  await new Promise((resolve, reject) => {
    bb.on("file", (_name, fileStream, info) => {
      const { filename, encoding, mimeType } = info;
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "wed-master" },
        (err, result) => (err ? reject(err) : (uploadResult = result, resolve()))
      );
      fileStream.pipe(uploadStream);
    });
    bb.on("error", reject);
    bb.on("finish", resolve);
    bb.end(Buffer.from(event.body, "base64"));
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      filename: uploadResult.public_id,
      url:      uploadResult.secure_url
    })
  };
}
