// services/fileUpload.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadToCloudinary = async (filePath, folder = 'task_comments') => {
    try {
        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist at path: ' + filePath);
        }

        // Upload with error handling
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            use_filename: true,
            unique_filename: false,
            overwrite: false
        });

        // Clean up temp file
        fs.unlinkSync(filePath);

        if (!result.secure_url) {
            throw new Error('Cloudinary upload failed - no URL returned');
        }

        return {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format
        };
    } catch (error) {
        // Ensure temp file is cleaned up
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

module.exports = { uploadToCloudinary };