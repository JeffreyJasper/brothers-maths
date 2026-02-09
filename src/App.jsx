
import React, { useState, useEffect } from 'react';
import './App.css';

const HOLE_COUNT = 9;
const GAME_DURATION = 60; // in seconds

const Mole = ({ isVisible, hasHair, onClick }) => (
  <div className={`mole ${isVisible ? 'visible' : ''}`} onClick={onClick}>
    {isVisible && (
      <div className={`mole-image ${hasHair ? 'mole-hairy' : 'mole-bald'}`}>
        {hasHair ? '👨' : '👨‍🦲'}
      </div>
    )}
  </div>
);

function App() {
  const [moles, setMoles] = useState(
    Array.from({ length: HOLE_COUNT }, () => ({ isVisible: false, hasHair: false }))
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Derived State --- //
  const isGameOver = gameStarted && (timeLeft === 0 || score >= 10);
  const isPlaying = gameStarted && !isGameOver;

  // --- Effects --- //

  // Game timer
  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Mole appearance timer
  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const moleTimer = setInterval(() => {
      const newMoles = Array.from({ length: HOLE_COUNT }, () => ({ isVisible: false, hasHair: false }));
      const randomIndex = Math.floor(Math.random() * HOLE_COUNT);
      const hasHair = Math.random() > 0.5;
      newMoles[randomIndex] = { isVisible: true, hasHair };
      setMoles(newMoles);
    }, 1000);
    return () => clearInterval(moleTimer);
  }, [isPlaying]);

  // --- Event Handlers --- //

  const handleMoleClick = (index) => {
    if (!isPlaying || !moles[index].isVisible) {
      return;
    }

    if (moles[index].hasHair) {
      setScore(prev => prev - 1);
    } else {
      setScore(prev => prev + 1);
    }

    const newMoles = [...moles];
    newMoles[index] = { isVisible: false, hasHair: false };
    setMoles(newMoles);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameStarted(true);
    setMoles(Array.from({ length: HOLE_COUNT }, () => ({ isVisible: false, hasHair: false })));
  };

  // --- Render --- //

  return (
    <div className="App">
      <div className="game-container">
        <h1>扑傻瓜</h1>
        <div className="info">
          <span>分數: {score}</span>
          <span>時間: {timeLeft}</span>
        </div>

        {isGameOver && (
          <div className="game-over">
            <h2>
              {score >= 10 ? '恭喜你，贏得遊戲！' : '時間到，遊戲結束！'}
            </h2>
            <p>最終分數: {score}</p>
            <button onClick={startGame}>重新開始</button>
          </div>
        )}

        {!gameStarted && (
          <button onClick={startGame}>開始遊戲</button>
        )}

        {isPlaying && (
          <div className="mole-grid">
            {moles.map((mole, index) => (
              <Mole key={index} {...mole} onClick={() => handleMoleClick(index)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
