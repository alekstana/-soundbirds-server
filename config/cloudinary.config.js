const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');



cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});


const storage = new CloudinaryStorage({
  cloudinary,
  folder: 'soundbirds-gallery', // The name of the folder in cloudinary . You can name this whatever you want
  allowedFormats: ['jpg', 'png'],
  filename: function (req, res, cb) {
    cb(null, res.originalname); // The file on cloudinary would have the same name as the original file name
  }
});

module.exports = multer({ storage });