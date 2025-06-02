
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dihqikmp2',
  api_key: '347388455829781',
  api_secret: 'owjjMBJikO2LUhrRmy0v1oGKOQU'
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
