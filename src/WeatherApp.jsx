import React, { useState } from 'react';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    try {
      const response = await fetch(`https://wttr.in/${city}?T`);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const text = await response.text();
      
      // Extract content between <pre> and </pre>
      const match = text.match(/<pre>([\s\S]*?)<\/pre>/);
      const extractedData = match ? match[1] : 'No valid weather data found';
      
      setWeatherData(extractedData);
      setError('');
    } catch (err) {
      setError('Error Occurred');
      setWeatherData('');
    }
  };

  return (
    <div style={{ 
      margin: '20px', 
      padding: '20px', 
      maxWidth: '600px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Simple Weather Forecasting App</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Enter city:
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              marginLeft: '10px',
              padding: '5px',
              fontSize: '16px'
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Get Weather
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>
      )}

      {weatherData && (
        <pre style={{ 
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          border: '1px solid #dee2e6'
        }}>
          {weatherData}
        </pre>
      )}
    </div>
  );
}

export default WeatherApp;
