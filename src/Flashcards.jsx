import React, { useState, useEffect } from "react";
import cardFront from "./card_front.png";
import cardBack from "./card_back.png";
import rightImage from "./right.png";
import wrongImage from "./wrong.png";
import flashcardsData from "./flashcards.csv";

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch(flashcardsData)
      .then((response) => response.text())
      .then((data) => {
        const rows = data.split("\n").slice(1);
        const parsedData = rows
          .map((row) => {
            const [bengali, english] = row.split(",");
            return {
              bengali: bengali?.trim(),
              english: english?.trim()
            };
          })
          .filter((card) => card.bengali && card.english);
        
        const shuffled = parsedData.sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
      });

    const savedHighScore = localStorage.getItem("highScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const handleSelect = (option) => {
    if (gameOver) return;
    
    setSelectedOption(option);
    const correct = flashcards[currentIndex].english;
    const correctAnswer = option === correct;

    setIsCorrect(correctAnswer);
    setShowAnswer(true);

    if (correctAnswer) {
      setScore((prev) => prev + 1);
    } else {
      if (score > highScore) {
        localStorage.setItem("highScore", score.toString());
        setHighScore(score);
      }
      setGameOver(true);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= flashcards.length) {
      setGameOver(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setShowAnswer(false);
    setSelectedOption(null);
  };

  const handleRestart = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setShowAnswer(false);
    setSelectedOption(null);
  };

  if (flashcards.length === 0) return <div>Loading flashcards...</div>;

  if (gameOver) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Game Over!</h2>
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
        <button 
          onClick={handleRestart}
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <img src={cardFront} alt="Front" style={{ width: "200px" }} />
        <div style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          fontSize: "1.5rem",
          fontWeight: "bold"
        }}>
          {currentCard.bengali}
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        {[
          currentCard.english,
          ...flashcards
            .filter((_, idx) => idx !== currentIndex)
            .slice(0, 3)
            .map((card) => card.english),
        ]
          .sort(() => Math.random() - 0.5)
          .map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              style={{ 
                margin: "10px", 
                padding: "10px 20px",
                backgroundColor: selectedOption === option 
                  ? isCorrect ? "#90EE90" : "#FFB6C1"
                  : "#f0f0f0",
                cursor: gameOver ? "not-allowed" : "pointer"
              }}
              disabled={selectedOption !== null || gameOver}
            >
              {option}
            </button>
          ))}
      </div>

      {showAnswer && (
        <div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={cardBack} alt="Back" style={{ width: "200px" }} />
            <div style={{ 
              position: "absolute", 
              top: "50%", 
              left: "50%", 
              transform: "translate(-50%, -50%)", 
              fontSize: "1.5rem",
              fontWeight: "bold"
            }}>
              {currentCard.english}
            </div>
          </div>
          <img
            src={isCorrect ? rightImage : wrongImage}
            alt={isCorrect ? "Correct" : "Wrong"}
            style={{ width: "100px", margin: "20px" }}
          />
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <p>Score: {score} | High Score: {highScore}</p>
        {isCorrect && (
          <button 
            onClick={handleNext}
            style={{ padding: "10px 20px" }}
          >
            Next Card
          </button>
        )}
      </div>
    </div>
  );
};

export default Flashcards;