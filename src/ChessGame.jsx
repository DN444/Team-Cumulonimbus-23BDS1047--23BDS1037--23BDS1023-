// src/components/ChessGame.jsx
import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Link } from 'react-router-dom';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [gameOver, setGameOver] = useState('');

  // Piece values for evaluation
  const pieceValues = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0,
    'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0
  };

  // Minimax with alpha-beta pruning
  const minimax = (game, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || game.isGameOver()) {
      return evaluatePosition(game);
    }

    const moves = game.moves();
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const evaluation = minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.move(move);
        const evaluation = minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  // Evaluate board position
  const evaluatePosition = (game) => {
    let evaluation = 0;
    const board = game.board();
    
    board.forEach(row => {
      row.forEach(square => {
        if (square) {
          const value = pieceValues[square.type] * (square.color === 'w' ? 1 : -1);
          evaluation += value;
        }
      });
    });
    
    return evaluation;
  };

  // Get best AI move using minimax
  const getBestMove = (depth = 4) => {
    const moves = game.moves();
    let bestMove = null;
    let bestValue = -Infinity;

    for (const move of moves) {
      game.move(move);
      const value = minimax(game, depth - 1, -Infinity, Infinity, false);
      game.undo();
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
    return bestMove;
  };

  // Handle AI move
  const makeAIMove = () => {
    if (game.isGameOver()) return;
    
    setAiThinking(true);
    setTimeout(() => {
      const bestMove = getBestMove();
      if (bestMove) {
        const newGame = new Chess(game.fen());
        newGame.move(bestMove);
        setGame(newGame);
        checkGameOver(newGame);
      }
      setAiThinking(false);
    }, 500);
  };

  // Handle player move
  const onDrop = (sourceSquare, targetSquare) => {
    if (playerColor !== game.turn() || aiThinking) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      
      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        checkGameOver(newGame);
        setTimeout(makeAIMove, 200);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  // Check game status
  const checkGameOver = (game) => {
    if (game.isCheckmate()) {
      setGameOver(game.turn() === 'w' ? 'Black wins!' : 'White wins!');
    } else if (game.isDraw()) {
      setGameOver('Draw!');
    }
  };

  // Color selection screen
  if (!playerColor) {
    return (
      <div className="color-selection">
        <h2>Choose Your Color</h2>
        <div className="color-buttons">
          <button onClick={() => setPlayerColor('w')}>White</button>
          <button onClick={() => {
            setPlayerColor('b');
            setTimeout(makeAIMove, 500);
          }}>Black</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-game">
      <div className="game-info">
        <h2>Playing as {playerColor === 'w' ? 'White' : 'Black'}</h2>
        <p>{aiThinking ? 'AI is thinking...' : gameOver || 'Your turn'}</p>
      </div>
      
      <div className="chess-board-container">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={560}
          boardOrientation={playerColor === 'b' ? 'black' : 'white'}
        />
      </div>

      <Link to="/" className="back-button">
        Return to Main Menu
      </Link>
    </div>
  );
};

export default ChessGame;