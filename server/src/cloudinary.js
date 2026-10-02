import { v2 as cloudinary } from 'cloudinary';

// Configure lazily on first use. This avoids the ESM import-ordering trap where
// a top-level config() call would run before index.js's dotenv.config() loads
// the .env, leaving the credentials undefined.
let configured = false;
function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

// Uploads an in-memory image buffer to Cloudinary and resolves the upload result.
export function uploadBuffer(buffer, folder = 'open-library/covers') {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export default cloudinary;
