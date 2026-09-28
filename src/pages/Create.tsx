import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import './Create.css';

function Create() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [photoCode, setPhotoCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectFile = (selected: File | undefined) => {
    if (selected?.type.startsWith('image/')) {
      setFile(selected);
      setPhotoCode(null);
      setCopyMessage('');
      setSaveError(null);
    }
  };

  const generatePhotoCode = () => {
    if (!file) return;
    const selectedFile = file;
    setSaveError(null);
    if (selectedFile.size > 3 * 1024 * 1024) {
      setSaveError('Images must be 3 MB or smaller.');
      return;
    }
    setSaving(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') {
        setSaveError('Could not read this photo. Please try another image.');
        setSaving(false);
        return;
      }

      try {
        const response = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result, name: selectedFile.name, mimeType: selectedFile.type }),
        });
        const responseBody = await response.text();
        let result: { code?: string; error?: string };
        try {
          result = JSON.parse(responseBody) as { code?: string; error?: string };
        } catch {
          const detail = responseBody.trim().replace(/\s+/g, ' ').slice(0, 160);
          throw new Error(
            `The photo API returned HTTP ${response.status} instead of JSON${detail ? `: ${detail}` : '.'} ` +
            'Run the app with `pnpm dev` so the API server starts too.',
          );
        }
        if (!response.ok || !result.code) {
          throw new Error(result.error ?? 'Could not save the photo.');
        }
        setPhotoCode(result.code);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Could not save the photo. Check the API and MongoDB connection.');
      } finally {
        setSaving(false);
      }
    };
    reader.onerror = () => {
      setSaveError('Could not read this photo. Please try again.');
      setSaving(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const copyPhotoCode = async () => {
    if (!photoCode) return;
    try {
      await navigator.clipboard.writeText(photoCode);
      setCopyMessage('Code copied');
    } catch {
      setCopyMessage('Copy failed. Select and copy the code manually.');
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  return (
    <main className="upload-page">
      <section className="upload-card" aria-labelledby="upload-title">
        <header className="upload-header">
          <div className="camera-icon" aria-hidden="true">📷</div>
          <h1 id="upload-title">Create your post</h1>
          <p>Choose a photo to share with your community.</p>
        </header>

        <div
          className={`drop-area${dragging ? ' dragging' : ''}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {previewUrl ? (
            <div className="preview-container">
              <img className="preview-image" src={previewUrl} alt="Selected upload preview" />
              <p className="file-name">{file?.name}</p>
              <button className="change-button" type="button" onClick={() => inputRef.current?.click()}>
                Choose a different photo
              </button>
            </div>
          ) : (
            <div>
              <div className="upload-icon" aria-hidden="true">☁️</div>
              <h2>Drag and drop your photo here</h2>
              <p>or</p>
              <button className="choose-button" type="button" onClick={() => inputRef.current?.click()}>
                Choose photo
              </button>
              <span className="file-info">JPG, PNG, GIF or WebP · up to 3 MB</span>
            </div>
          )}
        </div>
        <input ref={inputRef} className="file-input" type="file" accept="image/*" onChange={onFileChange} />
        <button className="upload-button" type="button" disabled={!file || saving} onClick={generatePhotoCode}>
          {saving ? 'Saving photo…' : file ? 'Save photo and generate code' : 'Choose a photo to continue'}
        </button>
        {saveError ? <p className="save-error" role="alert">{saveError}</p> : null}
        {photoCode ? (
          <div className="photo-code-block">
            <p className="photo-code">Your photo code:</p>
            <div className="photo-code-copy-row">
              <strong className="photo-code-value">{photoCode}</strong>
              <button className="copy-code-button" type="button" onClick={copyPhotoCode} aria-label="Copy photo code" title="Copy photo code">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
            <span className="copy-message" role="status" aria-live="polite">{copyMessage}</span>
          </div>
        ) : (
          <p className="secure-text">Your photo is ready to preview before sharing.</p>
        )}
      </section>
    </main>
  );
}

export default Create;
