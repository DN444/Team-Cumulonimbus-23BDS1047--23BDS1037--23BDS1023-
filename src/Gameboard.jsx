import React, { useState, useEffect, useCallback } from 'react';
import './Gameboard.css';
import Score from './Score';
import Instructions from './Instructions';

const GRID_SIZE = 20;
const INITIAL_SPEED = 200;

export default function GameBoard() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(generateFood());
  const [direction, setDirection] = useState('right');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameSpeedDelay, setGameSpeedDelay] = useState(INITIAL_SPEED);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Update high score when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      localStorage.setItem('snakeHighScore', score.toString());
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  function generateFood() {
    const x = Math.floor(Math.random() * GRID_SIZE) + 1;
    const y = Math.floor(Math.random() * GRID_SIZE) + 1;
    return { x, y };
  }

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setSnake([{ x: 10, y: 10 }]);
    setDirection('right');
    setGameSpeedDelay(INITIAL_SPEED);
    setScore(0);
    setFood(generateFood());
  }, []);

  const handleKeyPress = useCallback((e) => {
    if ((e.code === 'Space' || e.key === ' ') && (!gameStarted || gameOver)) {
      startGame();
      return;
    }

    if (gameStarted && !gameOver) {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'down') setDirection('up'); break;
        case 'ArrowDown': if (direction !== 'up') setDirection('down'); break;
        case 'ArrowLeft': if (direction !== 'right') setDirection('left'); break;
        case 'ArrowRight': if (direction !== 'left') setDirection('right'); break;
      }
    }
  }, [gameStarted, gameOver, direction, startGame]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }

      const newSnake = [head, ...prevSnake];
      
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        increaseSpeed();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food]);

  const increaseSpeed = () => {
    setGameSpeedDelay(prev => {
      if (prev > 150) return prev - 5;
      if (prev > 100) return prev - 3;
      if (prev > 50) return prev - 2;
      if (prev > 25) return prev - 1;
      return prev;
    });
  };

  const checkCollision = useCallback(() => {
    const head = snake[0];
    
    if (head.x < 1 || head.x > GRID_SIZE || head.y < 1 || head.y > GRID_SIZE) {
      setGameOver(true);
    }
    
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        setGameOver(true);
      }
    }
  }, [snake]);

  useEffect(() => {
    setScore(snake.length - 1);
  }, [snake]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameInterval = setInterval(() => {
      moveSnake();
      checkCollision();
    }, gameSpeedDelay);

    return () => clearInterval(gameInterval);
  }, [gameStarted, gameOver, moveSnake, checkCollision, gameSpeedDelay]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="game-container">
      <Score score={score} highScore={highScore} />
      
      <div className="game-border-1">
        <div className="game-border-2">
          <div className="game-border-3">
            <div className="game-board">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = (index % GRID_SIZE) + 1;
                const y = Math.floor(index / GRID_SIZE) + 1;
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                
                return (
                  <div 
                    key={index}
                    className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Instructions 
        gameStarted={gameStarted} 
        gameOver={gameOver} 
        onStart={startGame} 
      />
    </div>
  );
}