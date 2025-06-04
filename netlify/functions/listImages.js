import { v2 as cloudinary } from "cloudinary";

export default async function handler() {
  const res = await cloudinary.api.resources({
    type: "upload",
    prefix: "wed-master/",
    max_results: 100
  });

  const images = res.resources.map(img => ({
    name: img.public_id.split("/").pop(),
    url:  img.secure_url
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(images)
  };
}
