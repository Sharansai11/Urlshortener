import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    
    // Demo mode - simulate URL shortening
    setTimeout(() => {
      const mockShortCode = Math.random().toString(36).substring(2, 10);
      const baseUrl = window.location.origin;
      setShortUrl(`${baseUrl}/r/${mockShortCode}`);
      setLoading(false);
    }, 1000);
  };

  const handleTest = () => {
    if (shortUrl) {
      window.open(shortUrl, '_blank');
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>URL Shortener</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        {shortUrl && (
          <div className="result">
            <h3>Shortened URL:</h3>
            <div className="short-url">
              <input type="text" value={shortUrl} readOnly />
              <button onClick={() => navigator.clipboard.writeText(shortUrl)}>Copy</button>
            </div>
            <p className="demo-note">🎯 Demo Mode: This shows how the URL shortener interface works</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;