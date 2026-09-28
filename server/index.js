import express from 'express';
import { findPhoto, savePhoto } from './photos.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '5mb' }));

app.post('/api/photos', async (req, res) => {
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
        ? 'MongoDB is unavailable. Start a MongoDB server and connect Compass to that same server.'
        : 'Could not save the photo.';
    return res.status(status).json({ error: message });
  }
});

app.get('/api/photos/:code', async (req, res) => {
  try {
    const photo = await findPhoto(req.params.code);
    if (!photo) return res.status(404).json({ error: 'No photo was found for that code.' });
    return res.json(photo);
  } catch (error) {
    console.error('Could not retrieve photo:', error);
    return res.status(500).json({ error: 'Could not load the photo.' });
  }
});

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'Images must be 3 MB or smaller.' });
  console.error('API error:', error);
  return res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => console.log(`Photo API listening on http://localhost:${port}`));
