import { savePhoto } from '../../server/photos.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const code = await savePhoto(req.body ?? {});
    return res.status(201).json({ code });
  } catch (error) {
    console.error('Could not save photo:', error);
    const databaseUnavailable = error?.name === 'MongooseServerSelectionError';
    const status = error.status ?? (databaseUnavailable ? 503 : 500);
    const message = error.status
      ? error.message
      : databaseUnavailable
        ? 'MongoDB is unavailable. Check the MongoDB connection configured for this deployment.'
        : 'Could not save the photo.';
    return res.status(status).json({ error: message });
  }
}
