import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

type SavedPhoto = { image: string; name: string };

const Home = () => {
  const [code, setCode] = useState('');
  const [photo, setPhoto] = useState<SavedPhoto | null>(null);
  const [message, setMessage] = useState('');

  const findPhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setPhoto(null);
      setMessage('Enter a photo code to view an image.');
      return;
    }

    try {
      const response = await fetch(`/api/photos/${encodeURIComponent(normalizedCode)}`);
      const result = await response.json() as SavedPhoto & { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not load the photo.');
      setPhoto(result);
      setMessage('');
    } catch (error) {
      setPhoto(null);
      setMessage(error instanceof Error ? error.message : 'Could not load the photo. Check the API and MongoDB connection.');
    }
  };

  return (
    <main className="home-view">
      <section className="home-intro">
        <h1>Capturing real moments</h1>
        <p>Share a photo or view one with its unique code.</p>
        <Link className="home-create-link" to="/create">Create a photo code</Link>
      </section>

      <section className="code-lookup" aria-labelledby="lookup-title">
        <h2 id="lookup-title">View a photo with its code</h2>
        <p>Enter the code that was generated for the photo.</p>
        <form className="code-form" onSubmit={findPhoto}>
          <label className="visually-hidden" htmlFor="photo-code">Photo code</label>
          <input
            id="photo-code"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. PHOTO-123456ABCDEF"
            autoComplete="off"
          />
          <button type="submit">View photo</button>
        </form>
        {message && <p className="lookup-message" role="status">{message}</p>}
        {photo && (
          <figure className="lookup-result">
            <img src={photo.image} alt={photo.name} />
            <figcaption>{photo.name}</figcaption>
          </figure>
        )}
      </section>
    </main>
  );
};

export default Home;
