const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const ticketStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'suppor/tickets',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

const proofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'payment/payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 2000, height: 2000, crop: 'limit' }]
  }
});

module.exports = { cloudinary, ticketStorage, proofStorage };