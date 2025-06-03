const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name:process.env.CLOUDNARY_CLOUD_NAME ,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',             
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
    transformation: [{ width: 800, height: 600, crop: 'limit' }] 
  },
});

module.exports = { cloudinary, storage };
