import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const uploadImageCloudinary = async (image) => {
  if (!image) throw new Error("Image file not provided");

  const buffer = image.buffer; // Multer gives buffer automatically

  const uploadImage = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blinkeyit" },
      (error, uploadResult) => {
        if (error) reject(error);
        else resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return uploadImage;
};

export default uploadImageCloudinary;
