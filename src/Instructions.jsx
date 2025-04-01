import React from 'react';
import logo from './imgsnk.png';

export default function Instructions({ gameStarted, gameOver, onStart }) {
  return (
    <>
      {!gameStarted && !gameOver && (
        <h1 className="instruction-text">Press spacebar to start the game</h1>
      )}
      {gameOver && (
        <>
          <h1 className="instruction-text">Game Over! Press spacebar to restart</h1>
          <img className="logo" src={logo} alt="snake-logo" />
        </>
      )}
    </>
  );
}