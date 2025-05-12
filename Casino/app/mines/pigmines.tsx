import React, { useEffect, useState } from "react";
import { mines } from "../scripts/mines";
import { getBalance, storeBalance, updateBalance } from "../scripts/balance";
import Pig from "../../assets/img/pig.png";
import Wolf from "../../assets/img/wolf.png";
import wallet from "../../assets/img/wallet.png";

export default function PigMines() {
  const [cells, setCells] = useState<number[]>(Array(25).fill(0));
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [locked, setLocked] = useState(false);
  const [balance, setBalance] = useState<number | null>(0);
  const [betAmount, setBetAmount] = useState<string>("");
  const [bombs, setBombs] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const bombsNumber = Math.max(1, Math.min(24, Number(bombs) || 1));
    setCells(mines(bombsNumber));
    setRevealed(Array(25).fill(false));
    setLocked(false);
    setGameStarted(false);
    if (typeof window !== "undefined") {
      setBalance(getBalance());
    }
  }, [bombs]);

  // Restart game after all cards are revealed
  useEffect(() => {
    if (revealed.every(r => r)) {
      const timeout = setTimeout(() => {
        const bombsNumber = Math.max(1, Math.min(24, Number(bombs) || 1));
        setCells(mines(bombsNumber));
        setRevealed(Array(25).fill(false));
        setLocked(false);
        setGameStarted(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [revealed, bombs]);

  const handleReveal = (idx: number) => {
    if (!gameStarted || locked || revealed[idx]) return;
    setRevealed(prev => {
      const copy = [...prev];
      copy[idx] = true;
      if (cells[idx] === 1) {
        setLocked(true);
        setTimeout(() => {
          setRevealed(Array(25).fill(true));
        }, 1000);
      }
      return copy;
    });
  };

  const handleMultiplaier = (bombs: number, curentMultiplaier: number) => {
    const totalCells = 25;
    const totalBombs = bombs;
    const totalSafeCells = totalCells - totalBombs;
    if (curentMultiplaier < 2) {
      return curentMultiplaier * (totalCells / totalSafeCells);
    }
    if (curentMultiplaier > 2) {
      return curentMultiplaier * (totalCells / totalSafeCells + 0.1);
    }
    if (curentMultiplaier > 5) {
      return curentMultiplaier * (totalCells / totalSafeCells + 0.2);
    }
    if (curentMultiplaier > 10) {
      return curentMultiplaier * (totalCells / totalSafeCells + 0.3);
    }
  };

  // Calculate current and next multiplier using your logic
  const bombsNumber = Math.max(1, Math.min(24, Number(bombs) || 1));
  const correctRevealed = revealed.filter((r, idx) => r && cells[idx] === 0).length;
  let currentMultiplier = 1;
  for (let i = 0; i < correctRevealed; i++) {
    currentMultiplier = handleMultiplaier(bombsNumber, currentMultiplier);
  }
  const nextMultiplier = handleMultiplaier(bombsNumber, currentMultiplier);

  // Deduct bet and start game
  const handleBet = () => {
    const bet = Number(betAmount);
    if (
      !gameStarted &&
      bet > 0 &&
      balance !== null &&
      bet <= balance &&
      bombs
    ) {
      setGameStarted(true);
      const newBalance = balance - bet;
      setBalance(newBalance);
      updateBalance(newBalance);
    }
  };

  // Withdraw handler
  const handleWithdraw = () => {
    setLocked(true);
    setRevealed(Array(25).fill(true));
    // Only allow withdraw if not already locked
    if (!locked && gameStarted && betAmount && balance !== null) {
      const bet = Number(betAmount);
      const winnings = bet * currentMultiplier;
      const newBalance = balance + winnings;
      setBalance(newBalance);
      updateBalance(newBalance);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181c2f]">
      {/* Balance Display */}
      <div className="flex items-center mb-8 w-full max-w-[92.9vw] justify-start relative">
        <div className="flex items-center ml-8">
          <img
            src={wallet}
            className="w-[3vw] mr-2"
            alt="Wallet"
          />
          <span className="text-white text-[1.5vw] font-bold">
            {balance !== null ? `${balance.toFixed(2)} mdl` : "..."}
          </span>
        </div>
      </div>

      {/* Bombs Input */}
      <form className="mb-4 w-[15vw] flex items-center gap-2" onSubmit={e => e.preventDefault()}>
        <label htmlFor="bombs" className="text-white text-sm">Bombs:</label>
        <input
          id="bombs"
          type="number"
          min={1}
          max={24}
          value={bombs}
          onChange={e => setBombs(e.target.value.replace(/^0+/, ""))}
          className="bg-[#504c54] border border-gray-900 text-gray-900 text-sm rounded-lg block p-2.5 w-[5vw] dark:text-white"
          placeholder="Bombs"
          required
          disabled={gameStarted}
        />
      </form>

      {/* Bet Amount Input */}
      <form className="mb-4 w-[15vw]" onSubmit={e => e.preventDefault()}>
        <input
          type="number"
          min={0}
          value={betAmount}
          onChange={e => setBetAmount(e.target.value)}
          className="bg-[#504c54] border border-gray-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:text-white"
          placeholder="Bet amount"
          required
          disabled={gameStarted}
        />
      </form>

      {/* Bet/Withdraw Button */}
      {!gameStarted ? (
        <button
          className={`mb-6 px-8 py-2 rounded-lg font-bold text-white transition ${
            !betAmount || !bombs || Number(betAmount) <= 0 || Number(betAmount) > (balance ?? 0)
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={
            !betAmount ||
            !bombs ||
            Number(betAmount) <= 0 ||
            Number(betAmount) > (balance ?? 0)
          }
          onClick={handleBet}
        >
          Bet
        </button>
      ) : (
        <button
          className={`mb-6 px-8 py-2 rounded-lg font-bold text-white transition ${
            locked
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
          disabled={locked}
          onClick={handleWithdraw}
        >
          Withdraw
        </button>
      )}

      <div className="mb-6 flex gap-8">
        <div className="text-white text-lg">
          Current Multiplier: <span className="font-bold">{currentMultiplier?.toFixed(3)}x</span>
        </div>
        <div className="text-white text-lg">
          Next Multiplier: <span className="font-bold">{nextMultiplier?.toFixed(3)}x</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className="perspective w-[5vw] h-[5vw]"
            onClick={() => handleReveal(idx)}
          >
            <div
              className={`
                relative w-full h-full rounded-md flex items-center justify-center cursor-pointer transition-colors duration-300
                ${revealed[idx] ? "rotate-y-180" : ""}
                card-inner
              `}
              style={{
                background: revealed[idx]
                  ? cell === 1
                    ? "#1a232b"
                    : "#283c4c"
                  : "#223040",
              }}
            >
              {/* Card Front (hidden image) */}
              <div className="card-face card-front absolute inset-0 w-full h-full flex items-center justify-center rounded-md backface-hidden"></div>
              {/* Card Back (revealed image) */}
              <div className="card-face card-back absolute inset-0 w-full h-full flex items-center justify-center rounded-md backface-hidden rotate-y-180">
                {revealed[idx] && (
                  <img
                    src={cell === 1 ? Wolf : Pig}
                    alt={cell === 1 ? "Wolf" : "Pig"}
                    className={
                      cell === 1
                        ? "w-[3vw] h-[3vw] object-contain drop-shadow-lg animate-reveal saturate-50 contrast-125"
                        : "w-[4vw] h-[4vw] object-contain brightness-125 drop-shadow-md animate-reveal"
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>
        {`
          .perspective {
            perspective: 600px;
          }
          .card-inner {
            transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
            transform-style: preserve-3d;
            width: 100%;
            height: 100%;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .card-face {
            backface-visibility: hidden;
          }
          .card-back {
            transform: rotateY(180deg);
          }
          @keyframes reveal {
            0% { opacity: 0; transform: scale(0.7) rotate(-10deg);}
            60% { opacity: 1; transform: scale(1.1) rotate(3deg);}
            100% { opacity: 1; transform: scale(1) rotate(0);}
          }
          .animate-reveal {
            animation: reveal 0.4s cubic-bezier(0.4,0,0.2,1);
          }
        `}
      </style>
    </div>
  );
}