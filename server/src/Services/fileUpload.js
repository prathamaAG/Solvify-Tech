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

        // Upload as 'raw' resource type to bypass Strict Transformations
        // (Cloudinary blocks direct access to 'image' type with strict mode enabled)
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'raw',
            type: 'upload',
            access_mode: 'public',
            use_filename: true,
            unique_filename: true,
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
            format: result.format,
            resource_type: result.resource_type
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

// Generate a signed URL for accessing files (fallback if public access doesn't work)
const getSignedUrl = (publicId, resourceType = 'image') => {
    return cloudinary.url(publicId, {
        sign_url: true,
        resource_type: resourceType,
        type: 'upload',
        secure: true
    });
};

module.exports = { uploadToCloudinary, getSignedUrl };