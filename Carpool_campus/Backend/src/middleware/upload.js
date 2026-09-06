const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'carpoolcampus/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 512, height: 512, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB (TBD per API.md)
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_FORMAT'));
    }
    cb(null, true);
  },
});

module.exports = upload;
