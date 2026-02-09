
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const HOLE_COUNT = 9;
const GAME_DURATION = 60; // in seconds

// 音效檔案的路徑 (假設放在 public 資料夾)
const CLAP_SOUND_SRC = '/clap.mp3';
const SCREAM_SOUND_SRC = '/scream.mp3';

const Mole = ({ isVisible, hasHair, onClick }) => (
  <div className={`mole ${isVisible ? 'visible' : ''}`} onClick={onClick}>
    {isVisible && <div className="mole-image">{hasHair ? '👨' : '👨‍🦲'}</div>}
  </div>
);

function App() {
  const [moles, setMoles] = useState(new Array(HOLE_COUNT).fill({ isVisible: false, hasHair: false }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // 使用 useRef 來存放 Audio 物件
  const clapSound = useRef(null);
  const screamSound = useRef(null);

  // 在 component mount 時建立 Audio 物件
  useEffect(() => {
    clapSound.current = new Audio(CLAP_SOUND_SRC);
    screamSound.current = new Audio(SCREAM_SOUND_SRC);
  }, []);

  // 遊戲計時器
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && score < 10) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 || score >= 10) {
      setGameStarted(false);
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, score]);

  // 地鼠出現的計時器
  useEffect(() => {
    if (gameStarted) {
      const moleTimer = setInterval(() => {
        const newMoles = new Array(HOLE_COUNT).fill({ isVisible: false, hasHair: false });
        const randomIndex = Math.floor(Math.random() * HOLE_COUNT);
        const hasHair = Math.random() > 0.5;
        newMoles[randomIndex] = { isVisible: true, hasHair };
        setMoles(newMoles);
      }, 1000);
      return () => clearInterval(moleTimer);
    }
  }, [gameStarted]);

  // 處理點擊事件
  const handleMoleClick = (index) => {
    if (moles[index].isVisible) {
      if (moles[index].hasHair) {
        setScore(prev => prev - 1);
        if (screamSound.current) {
            screamSound.current.currentTime = 0; // 重置音效
            screamSound.current.play();
        }
      } else {
        setScore(prev => prev + 1);
        if (clapSound.current) {
            clapSound.current.currentTime = 0; // 重置音效
            clapSound.current.play();
        }
      }
      const newMoles = [...moles];
      newMoles[index] = { isVisible: false, hasHair: false };
      setMoles(newMoles);
    }
  };

  // 開始遊戲
  const startGame = () => {
    // --- 音效解鎖 --- 
    // 在使用者互動後，先播放並立即暫停音效，以符合瀏覽器政策
    if (clapSound.current) {
        clapSound.current.play().catch(e => console.error("音效播放失敗: ", e));
        clapSound.current.pause();
    }
    if (screamSound.current) {
        screamSound.current.play().catch(e => console.error("音效播放失敗: ", e));
        screamSound.current.pause();
    }
    // ------------------

    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameStarted(true);
    setGameOver(false);
    setMoles(new Array(HOLE_COUNT).fill({ isVisible: false, hasHair: false }));
  };

  return (
    <div className="App">
      <h1>扑傻瓜</h1>
      <div className="info">
        <span>分數: {score}</span>
        <span>時間: {timeLeft}</span>
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>
            {score >= 10 ? '恭喜你，贏得遊戲！' : '時間到，遊戲結束！'}
          </h2>
          <p>最終分數: {score}</p>
          <button onClick={startGame}>重新開始</button>
        </div>
      )}
      {!gameStarted && !gameOver && (
        <button onClick={startGame}>開始遊戲</button>
      )}
      {gameStarted && (
        <div className="mole-grid">
          {moles.map((mole, index) => (
            <Mole key={index} {...mole} onClick={() => handleMoleClick(index)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
