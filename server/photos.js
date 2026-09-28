import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';

export const maxImageBytes = 3 * 1024 * 1024;
const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const photoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  image: { type: String, required: true },
  name: { type: String, required: true, maxlength: 255 },
  mimeType: { type: String, required: true },
}, { timestamps: true });

export const Photo = mongoose.models.Photo ?? mongoose.model('Photo', photoSchema);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/photons';

let connectionPromise;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  await connectionPromise;
}

export async function savePhoto({ image, name, mimeType }) {
  if (typeof image !== 'string' || typeof name !== 'string' || typeof mimeType !== 'string') {
    const error = new Error('Image, filename, and image type are required.');
    error.status = 400;
    throw error;
  }
  if (!supportedMimeTypes.has(mimeType)) {
    const error = new Error('Use a JPG, PNG, GIF, or WebP image.');
    error.status = 415;
    throw error;
  }

  const match = image.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/]+=*)$/);
  if (!match || match[1] !== mimeType) {
    const error = new Error('The image data is invalid.');
    error.status = 400;
    throw error;
  }
  if (Buffer.from(match[2], 'base64').length > maxImageBytes) {
    const error = new Error('Images must be 3 MB or smaller.');
    error.status = 413;
    throw error;
  }

  await connectDatabase();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = `PHOTO-${randomBytes(6).toString('hex').toUpperCase()}`;
    try {
      const photo = await Photo.create({ code, image, name: name.slice(0, 255), mimeType });
      return photo.code;
    } catch (error) {
      if (error?.code !== 11000 || attempt === 2) throw error;
    }
  }
  throw new Error('Could not generate a unique photo code.');
}

export async function findPhoto(code) {
  await connectDatabase();
  return Photo.findOne({ code: code.toUpperCase() }).select('image name mimeType -_id').lean();
}
