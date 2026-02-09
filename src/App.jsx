
import React, { useState, useEffect } from 'react';
import './App.css';

const HOLE_COUNT = 9;
const GAME_DURATION = 60; // in seconds

const Mole = ({ isVisible, hasHair, isWhacked, onClick }) => (
  <div className={`mole ${isVisible ? 'visible' : ''} ${isWhacked ? 'whacked' : ''}`} onClick={onClick}>
    {isVisible && (
      <div className={`mole-image ${hasHair ? 'mole-hairy' : 'mole-bald'}`}>
        {hasHair ? '👨' : '👨‍🦲'}
      </div>
    )}
  </div>
);

function App() {
  const [moles, setMoles] = useState(
    Array.from({ length: HOLE_COUNT }, () => ({ isVisible: false, hasHair: false, isWhacked: false }))
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
      setMoles(currentMoles => {
          // Find an empty hole to place the new mole
          const emptyHoles = currentMoles.map((mole, index) => mole.isVisible ? -1 : index).filter(index => index !== -1);
          if (emptyHoles.length === 0) return currentMoles; // No empty holes

          const newMoles = [...currentMoles];
          const randomIndex = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
          const hasHair = Math.random() > 0.5;
          newMoles[randomIndex] = { isVisible: true, hasHair, isWhacked: false };
          return newMoles;
      });
    }, 1000); // Mole appears every second
    return () => clearInterval(moleTimer);
  }, [isPlaying]);

  // --- Event Handlers --- //

  const handleMoleClick = (index) => {
    if (!isPlaying || !moles[index].isVisible || moles[index].isWhacked) {
      return;
    }

    if (moles[index].hasHair) {
      setScore(prev => prev - 1);
    } else {
      setScore(prev => prev + 1);
    }

    const newMoles = [...moles];
    newMoles[index].isWhacked = true;
    newMoles[index].isVisible = true; // Keep it visible for the animation
    setMoles(newMoles);

    // Hide the mole after the animation
    setTimeout(() => {
      setMoles(prevMoles => {
        const molesToUpdate = [...prevMoles];
        molesToUpdate[index] = { isVisible: false, hasHair: false, isWhacked: false };
        return molesToUpdate;
      });
    }, 400); // Corresponds to animation duration
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameStarted(true);
    setMoles(Array.from({ length: HOLE_COUNT }, () => ({ isVisible: false, hasHair: false, isWhacked: false })));
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
