const multer = require('multer');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (useCloudinary) {
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  class CloudinaryStorageEngine {
    _handleFile(req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'fixit-uploads' },
        (err, result) => {
          if (err) return cb(err);
          cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
        }
      );
      file.stream.pipe(uploadStream);
    }
    _removeFile(req, file, cb) {
      cb(null);
    }
  }

  storage = new CloudinaryStorageEngine();
  console.log('Uploads: using Cloudinary storage');
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });

  console.log('Uploads: using local disk storage (set CLOUDINARY_* env vars to use Cloudinary instead)');
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;