import { findPhoto } from '../../server/photos.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const photo = await findPhoto(req.query.code);
    if (!photo) return res.status(404).json({ error: 'No photo was found for that code.' });
    return res.status(200).json(photo);
  } catch (error) {
    console.error('Could not retrieve photo:', error);
    return res.status(500).json({ error: 'Could not load the photo.' });
  }
}
