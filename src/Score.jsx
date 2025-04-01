import React from 'react';

export default function Score({ score, highScore }) {
  return (
    <div className="scores">
      <h1 className="score">{score.toString().padStart(3, '0')}</h1>
      <h1 className="high-score">{highScore.toString().padStart(3, '0')}</h1>
    </div>
  );
}