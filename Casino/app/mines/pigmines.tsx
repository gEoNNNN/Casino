import React, { useEffect, useState } from "react";
import { mines } from "../scripts/mines";
import { getBalance, updateBalance } from "../scripts/balance";
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

  const bombsNumber = Math.max(1, Math.min(24, Number(bombs) || 1));
  const correctRevealed = revealed.filter((r, idx) => r && cells[idx] === 0).length;
  let currentMultiplier = 1;
  for (let i = 0; i < correctRevealed; i++) {
    currentMultiplier = handleMultiplaier(bombsNumber, currentMultiplier);
  }
  const nextMultiplier = handleMultiplaier(bombsNumber, currentMultiplier);

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

  const handleWithdraw = () => {
    setLocked(true);
    setRevealed(Array(25).fill(true));
    if (!locked && gameStarted && betAmount && balance !== null) {
      const bet = Number(betAmount);
      const winnings = bet * currentMultiplier;
      const newBalance = balance + winnings;
      setBalance(newBalance);
      updateBalance(newBalance);
    }
  };

  // Casino-style UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c2f] to-[#222B4C] flex items-stretch justify-center relative">
      {/* Balance Top Right */}
      <div className="absolute top-6 right-12 flex items-center gap-2 z-20">
        <img src={wallet} className="w-8 h-8" alt="Wallet" />
        <span className="text-white text-xl font-bold">
          {balance !== null ? `${balance.toFixed(2)} mdl` : '...'}
        </span>
        <button
          onClick={() => {
            const newBalance = (balance ?? 0) + 1000;
            setBalance(newBalance);
            updateBalance(newBalance);
          }}
          className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition"
        >
          +1000
        </button>
      </div>
      {/* Main Layout */}
      <div className="flex w-full max-w-[1800px] mx-auto ml-[8vw] mt-[10vw]" style={{ minHeight: "80vh" }}>
        {/* Left: Bet Controls */}
        <div className="flex flex-col items-center justify-start mt-[3vw] w-[20vw]">
          {/* Bet Controls Card */}
          <div className="flex flex-col items-center gap-4 bg-[#232a3d] rounded-2xl shadow-lg px-10 py-8 w-full max-w-[400px]">
            <form className="flex flex-col items-center gap-2 w-full" onSubmit={e => e.preventDefault()}>
              <label className="text-white text-lg font-bold mb-1">Bombs</label>
              <input
                type="number"
                min={1}
                max={24}
                value={bombs}
                onChange={e => setBombs(e.target.value.replace(/^0+/, ""))}
                className="bg-[#181c2f] border border-[#3a415a] text-white text-lg rounded-lg block w-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-[#1884fc] transition"
                placeholder="Bombs"
                required
                disabled={gameStarted}
              />
              <label className="text-white text-lg font-bold mb-1 mt-4">Bet Amount</label>
              <input
                type="number"
                min={0}
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className="bg-[#181c2f] border border-[#3a415a] text-white text-lg rounded-lg block w-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-[#1884fc] transition"
                placeholder="Bet amount"
                required
                disabled={gameStarted}
              />
            </form>
            {!gameStarted ? (
              <button
                onClick={handleBet}
                className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                  !betAmount || !bombs || Number(betAmount) <= 0 || Number(betAmount) > (balance ?? 0)
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-[#1884fc] hover:bg-blue-600 text-white"
                }`}
                disabled={
                  !betAmount ||
                  !bombs ||
                  Number(betAmount) <= 0 ||
                  Number(betAmount) > (balance ?? 0)
                }
              >
                Bet
              </button>
            ) : (
              <button
                className={`w-full py-3 rounded-lg font-bold text-lg ${
                  locked
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-500 text-[#181c2f] transition"
                }`}
                disabled={locked}
                onClick={handleWithdraw}
              >
                Withdraw
              </button>
            )}
            {/* Multiplier display */}
            <div className="flex gap-8 mt-6">
              <div className="text-white text-lg">
                Current Multiplier: <span className="font-bold">{currentMultiplier?.toFixed(3)}x</span>
              </div>
              <div className="text-white text-lg">
                Next Multiplier: <span className="font-bold">{nextMultiplier?.toFixed(3)}x</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Game Grid */}
        <div className="flex flex-col items-center justify-center" style={{ width: "70%" }}>
          <div className="relative w-full flex justify-center items-center mt-[-10vw]" style={{ height: 600, minHeight: 600, maxHeight: 600 }}>
            <div className="grid grid-cols-5 gap-4 bg-[#232a3d] rounded-3xl shadow-2xl p-8" style={{ width: 600, height: 600 }}>
              {cells.map((cell, idx) => (
                <div
                  key={idx}
                  className="perspective w-[80px] h-[80px] flex items-center justify-center"
                  onClick={() => handleReveal(idx)}
                  style={{
                    cursor: !gameStarted || locked || revealed[idx] ? "not-allowed" : "pointer",
                    opacity: revealed[idx] ? 1 : 0.95,
                    transition: "box-shadow 0.2s",
                    boxShadow: revealed[idx]
                      ? cell === 1
                        ? "0 0 24px 0 #ff3b3b88"
                        : "0 0 18px 0 #41e1a688"
                      : "0 0 8px 0 #222b4c44",
                  }}
                >
                  <div
                    className={`
                      relative w-full h-full rounded-xl flex items-center justify-center card-inner
                      ${revealed[idx] ? "rotate-y-180" : ""}
                      transition-transform duration-500
                    `}
                    style={{
                      background: revealed[idx]
                        ? cell === 1
                          ? "#1a232b"
                          : "#283c4c"
                        : "linear-gradient(135deg, #232a3d 60%, #222B4C 100%)",
                    }}
                  >
                    {/* Card Front */}
                    <div className="card-face card-front absolute inset-0 w-full h-full flex items-center justify-center rounded-xl backface-hidden"></div>
                    {/* Card Back */}
                    <div className="card-face card-back absolute inset-0 w-full h-full flex items-center justify-center rounded-xl backface-hidden rotate-y-180">
                      {revealed[idx] && (
                        <img
                          src={cell === 1 ? Wolf : Pig}
                          alt={cell === 1 ? "Wolf" : "Pig"}
                          className={
                            cell === 1
                              ? "w-[48px] h-[48px] object-contain drop-shadow-lg animate-reveal saturate-50 contrast-125"
                              : "w-[56px] h-[56px] object-contain brightness-125 drop-shadow-md animate-reveal"
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          .card-front {
            background: linear-gradient(135deg, #2e3650 60%, #3a415a 100%);
            border: 2.5px solid #41e1a6;
            box-shadow: 0 0 18px 0 #41e1a655;
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