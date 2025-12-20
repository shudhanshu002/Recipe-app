import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// FIX: Added 'type' parameter defaulting to "auto"
const uploadOnCloudinary = async (localFilePath, type = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!localFilePath) {
      return resolve(null);
    }

    console.log(`Uploading ${type} to Cloudinary: ${localFilePath}`);

    cloudinary.uploader.upload_large(
      localFilePath,
      {
        resource_type: type, // Use the explicit type passed from controller
        chunk_size: 6000000, // 6MB chunks
        timeout: 7200000, // 2 hours timeout
      },
      (error, result) => {
        const cleanup = () => {
          try {
            if (fs.existsSync(localFilePath)) {
              fs.unlinkSync(localFilePath);
            }
          } catch (e) {
            console.error('Error deleting temp file:', e.message);
          }
        };

        if (error) {
          console.error('Cloudinary Upload Failed Error:', error.message);
          cleanup();
          resolve(null);
        } else {
          console.log('Cloudinary Upload Success:', result.secure_url);
          cleanup();
          resolve(result);
        }
      }
    );
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return null;
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
