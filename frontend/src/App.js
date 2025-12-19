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
    
    try {
      // For now, use demo mode until backend is deployed
      // TODO: Replace with real backend URL after deployment
      const mockShortCode = Math.random().toString(36).substring(2, 10);
      setTimeout(() => {
        setShortUrl(`https://short.ly/${mockShortCode}`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Network error occurred');
      setLoading(false);
    }
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
              <button onClick={handleTest}>Test</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;