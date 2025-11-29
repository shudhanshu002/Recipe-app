import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';


dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        console.log('Uploading file to Cloudinary:', localFilePath);

        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            chunk_size: 6000000,
            timeout: 600000, // 60 seconds timeout for larger files
        });

        console.log('Cloudinary Upload Success:', response.url);

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error('Cloudinary Upload Failed Error:', error.message);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
