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
      // Use environment variable for API URL, fallback to localhost for development
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setShortUrl(`${apiUrl}/api/redirect/${data.shortCode}`);
      } else {
        setError('Failed to create short URL');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
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