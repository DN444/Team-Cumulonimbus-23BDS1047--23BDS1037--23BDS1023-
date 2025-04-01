import React, { useState, useEffect, useRef } from 'react';

const PongGame = () => {
  const canvasRef = useRef(null);
  const [player1Y, setPlayer1Y] = useState(200);
  const [player2Y, setPlayer2Y] = useState(200);
  const [ball, setBall] = useState({ x: 400, y: 300, dx: 4, dy: 4 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const keys = useRef({ w: false, s: false, a: false, d: false });

  // Game constants
  const PADDLE_HEIGHT = 100;
  const PADDLE_WIDTH = 10;
  const BALL_SIZE = 10;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const COMPUTER_SPEED = 3; // Reduced speed

  // Refs for direct access
  const player1YRef = useRef(player1Y);
  const player2YRef = useRef(player2Y);
  const ballRef = useRef(ball);
  const scoreRef = useRef(score);

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('pongHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Update refs when state changes
  useEffect(() => { player1YRef.current = player1Y; }, [player1Y]);
  useEffect(() => { player2YRef.current = player2Y; }, [player2Y]);
  useEffect(() => { ballRef.current = ball; }, [ball]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Update high score when player score increases
  useEffect(() => {
    if (score.player1 > highScore) {
      setHighScore(score.player1);
      localStorage.setItem('pongHighScore', score.player1.toString());
    }
  }, [score.player1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Input handlers
    const handleKeyDown = (e) => {
      if (e.key in keys.current) keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      if (e.key in keys.current) keys.current[e.key] = false;
    };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = Math.max(0, Math.min(e.clientY - rect.top - PADDLE_HEIGHT/2, CANVAS_HEIGHT - PADDLE_HEIGHT));
      setPlayer1Y(mouseY);
    };

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const updateGame = () => {
      if (isPaused) return;

      // Player 1 movement
      setPlayer1Y(prev => {
        let newY = prev;
        if ((keys.current.w || keys.current.a) && newY > 0) newY -= 5;
        if ((keys.current.s || keys.current.d) && newY < CANVAS_HEIGHT - PADDLE_HEIGHT) newY += 5;
        return newY;
      });

      // Computer AI with delayed reaction
      setPlayer2Y(prev => {
        const ballCenter = ballRef.current.y + BALL_SIZE/2;
        const paddleCenter = prev + PADDLE_HEIGHT/2;
        const targetY = ballCenter - PADDLE_HEIGHT/2;
        
        if (Math.abs(paddleCenter - ballCenter) > 20) { // Add some delay
          return Math.min(
            Math.max(
              prev + Math.sign(targetY - prev) * COMPUTER_SPEED,
              0
            ),
            CANVAS_HEIGHT - PADDLE_HEIGHT
          );
        }
        return prev;
      });

      // Ball movement
      setBall(prev => {
        const newBall = { ...prev };
        newBall.x += newBall.dx;
        newBall.y += newBall.dy;

        // Wall collision
        if (newBall.y + BALL_SIZE > CANVAS_HEIGHT || newBall.y < 0) {
          newBall.dy *= -1;
        }

        // Paddle collision with proper bounds checking
        const paddle1Collision = newBall.x <= PADDLE_WIDTH && 
          newBall.y + BALL_SIZE >= player1YRef.current && 
          newBall.y <= player1YRef.current + PADDLE_HEIGHT;

        const paddle2Collision = newBall.x + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH && 
          newBall.y + BALL_SIZE >= player2YRef.current && 
          newBall.y <= player2YRef.current + PADDLE_HEIGHT;

        if (paddle1Collision || paddle2Collision) {
          newBall.dx *= -1;
          // Add slight vertical angle variation
          newBall.dy += (Math.random() * 2 - 1) * 0.5;
        }

        // Score handling with boundary check
        if (newBall.x < 0) {
          setScore(s => ({ ...s, player2: s.player2 + 1 }));
          return resetBall();
        }
        if (newBall.x + BALL_SIZE > CANVAS_WIDTH) {
          setScore(s => ({ ...s, player1: s.player1 + 1 }));
          return resetBall();
        }

        return newBall;
      });
    };

    const gameLoop = setInterval(updateGame, 1000/60);
    return () => clearInterval(gameLoop);
  }, [isPaused]);

  const resetBall = () => ({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: Math.random() < 0.5 ? 4 : -4,
    dy: Math.random() * 2 - 1 // Random vertical angle
  });

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw paddles
    ctx.fillStyle = 'white';
    ctx.fillRect(0, player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw ball
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    
    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH/2, 0);
    ctx.lineTo(CANVAS_WIDTH/2, CANVAS_HEIGHT);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw scores
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score.player1, CANVAS_WIDTH/4, 50);
    ctx.fillText(score.player2, CANVAS_WIDTH*3/4, 50);
    
    // Draw high score
    ctx.font = '24px Arial';
    ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH/2, 30);
  }, [ball, player1Y, player2Y, score, highScore]);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '1px solid white' }}
      />
      <div>
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <p>Controls: W/A/S/D or Mouse | High Score: {highScore}</p>
      </div>
    </div>
  );
};

export default PongGame;