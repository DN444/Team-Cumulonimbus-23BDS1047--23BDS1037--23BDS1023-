import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PongGame from './PongGame';
import GameBoard from './Gameboard';
import WeatherApp from './WeatherApp';
import Flashcards from './Flashcards';
import ChessGame from './ChessGame';
import './global.css';
import './App.css';

function Home() {
  return (
    <div className="game-container">
      <h1 className="logo">Web Programming Lab</h1>
      <p className="instruction-text">
        <strong>Group Members:</strong><br/>
        Dipayan Nandi 23BDS1047<br/>
        Avirup Kundu 23BDS1037<br/>
        Aditya Ghosh Dastidar 23BDS1023<br/>
        Aayush Kumar 23BDS1087<br/>
        Second year CSE (Data Science)<br/>
      </p>
      <div className="game-selection">
        <Link to="/pong" className="game-button">
          <span className="button-text">Play Pong!</span>
          <span className="pixel-corner"></span>
        </Link>
        <Link to="/snake" className="game-button">
          <span className="button-text">Play Snake!</span>
          <span className="pixel-corner"></span>
        </Link>
        <Link to="/flashcards" className="game-button">
          <span className="button-text">PLay language flashcards!</span>
          <span className="pixel-corner"></span>
        </Link>
        <Link to="/chess" className="game-button">
          <span className="button-text">Play Chess!</span>
          <span className="pixel-corner"></span>
        </Link>
        <Link to="/weather" className="game-button">
          <span className="button-text">Want the weather?</span>
          <span className="pixel-corner"></span>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pong" element={<PongGame />} />
          <Route path="/snake" element={<GameBoard />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/chess" element={<ChessGame />} />
          <Route path="/weather" element={<WeatherApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;