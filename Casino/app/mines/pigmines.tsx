import React, { useEffect, useState } from "react";
import { mines } from "../scripts/mines";
import { getBalance, updateBalance } from "../scripts/balance";
import { recordWin, recordLoss } from "../scripts/stats";
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

  // Dark mode sync
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") return true;
      if (storedTheme === "light") return false;
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    // Sync with <html> class and localStorage
    const syncTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setDark(true);
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
        setDark(false);
      } else {
        setDark(document.documentElement.classList.contains("dark"));
      }
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", syncTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

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

        // Record loss in local storage
        recordLoss("mines", Number(betAmount));

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
    return curentMultiplaier;
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
      const profit = winnings - bet;
      const newBalance = balance + winnings;
      setBalance(newBalance);
      updateBalance(newBalance);

      // Record win in local storage
      recordWin("mines", profit);
    }
  };

  // Casino-style UI
  return (
    <div className={`min-h-screen flex items-stretch justify-center relative transition-colors duration-300
      ${dark
        ? "bg-gradient-to-b from-[#181c2f] to-[#222B4C]"
        : "bg-gradient-to-br from-[#e0e7ef] to-[#bbf7d0]"}
    `}>
      {/* Balance Top Left */}
      <div className="absolute top-[3vw] left-[8vw] flex items-center gap-4 z-20">
        <div
          className={`flex items-center px-6 py-3 rounded-2xl shadow-lg border border-[#41e1a6]
            ${dark
              ? "bg-gradient-to-r from-[#232a3d] to-[#2e3650]"
              : "bg-gradient-to-r from-[#e0e7ef] to-[#bbf7d0]"}`
          }
        >
          <span className={`text-xl font-bold font-lexend tracking-wide
            ${dark ? "text-white" : "text-gray-900"}`}>
            {balance !== null ? `${balance.toFixed(2)} $` : '...'}
          </span>
        </div>
      </div>
      {/* Back Button Bottom Right */}
      <button
        onClick={() => window.location.href = "/"}
        className="fixed right-12 bottom-12 px-10 py-4 rounded-full bg-[#8249B4] text-[#D9A2FF] text-2xl font-bold shadow-md hover:shadow-lg transition border border-transparent hover:bg-[#6d399e] z-30"
      >
        Back
      </button>
      {/* Main Layout */}
      <div className="flex w-full max-w-[1800px] mx-auto ml-[8vw] mt-[10vw]" style={{ minHeight: "80vh" }}>
        {/* Left: Bet Controls */}
        <div className="flex flex-col items-center justify-start w-[20vw] mt-[4vw]">
          {/* Bet Controls Card */}
          <div className={`flex flex-col items-center gap-4 rounded-2xl shadow-lg px-10 py-8 w-full max-w-[400px] border-2 border-[#41e1a6]
            ${dark ? "bg-[#232a3d]" : "bg-white"}`}>
            <form className="flex flex-col items-center gap-2 w-full" onSubmit={e => e.preventDefault()}>
              <label className={`text-lg font-bold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>Bombs</label>
              <input
                type="number"
                min={1}
                max={24}
                value={bombs}
                onChange={e => setBombs(e.target.value.replace(/^0+/, ""))}
                className={`border text-lg rounded-lg block w-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-[#1884fc] transition
                  ${dark
                    ? "bg-[#181c2f] border-[#3a415a] text-white"
                    : "bg-[#e0e7ef] border-[#41e1a6] text-gray-900"}`}
                placeholder="Bombs"
                required
                disabled={gameStarted}
              />
              <label className={`text-lg font-bold mb-1 mt-4 ${dark ? "text-white" : "text-gray-900"}`}>Bet Amount</label>
              <input
                type="number"
                min={0}
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className={`border text-lg rounded-lg block w-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-[#1884fc] transition
                  ${dark
                    ? "bg-[#181c2f] border-[#3a415a] text-white"
                    : "bg-[#e0e7ef] border-[#41e1a6] text-gray-900"}`}
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
              <div className={`${dark ? "text-white" : "text-gray-900"} text-lg`}>
                Current Multiplier: <span className="font-bold">{currentMultiplier?.toFixed(3)}x</span>
              </div>
              <div className={`${dark ? "text-white" : "text-gray-900"} text-lg`}>
                Next Multiplier: <span className="font-bold">{nextMultiplier?.toFixed(3)}x</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Game Grid */}
        <div className="flex flex-col items-center justify-center" style={{ width: "70%" }}>
          <div className="relative w-full flex justify-center items-center mt-[-10vw]" style={{ height: 600, minHeight: 600, maxHeight: 600 }}>
            <div className={`grid grid-cols-5 gap-4 rounded-3xl shadow-2xl p-8
              ${dark ? "bg-[#232a3d]" : "bg-white"}`} style={{ width: 600, height: 600 }}>
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
                          ? dark ? "#1a232b" : "#fca5a5"
                          : dark ? "#283c4c" : "#bbf7d0"
                        : dark
                          ? "linear-gradient(135deg, #232a3d 60%, #8249B4 100%)"
                          : "linear-gradient(135deg, #bbf7d0 0%, #60a5fa 100%)",
                      border: revealed[idx]
                        ? "2.5px solid #41e1a6"
                        : dark
                          ? "2.5px solid #8249B4"
                          : "2.5px solid #60a5fa",
                      boxShadow: revealed[idx]
                        ? cell === 1
                          ? "0 0 24px 0 #ff3b3b88"
                          : "0 0 18px 0 #41e1a688"
                        : dark
                          ? "0 0 12px 0 #8249B488"
                          : "0 0 12px 0 #60a5fa88",
                    }}
                  >
                    {/* Card Front */}
                    <div className="card-face card-front absolute inset-0 w-full h-full flex items-center justify-center rounded-xl backface-hidden"
                      style={{
                        background: dark
                          ? "linear-gradient(135deg, #232a3d 60%, #8249B4 100%)"
                          : "linear-gradient(135deg, #bbf7d0 0%, #60a5fa 100%)",
                        border: dark
                          ? "2.5px solid #8249B4"
                          : "2.5px solid #60a5fa",
                        boxShadow: dark
                          ? "0 0 12px 0 #8249B488"
                          : "0 0 12px 0 #60a5fa88",
                      }}
                    >
                      <span className={`text-3xl font-bold ${dark ? "text-[#D9A2FF]" : "text-[#462320]"}`}>?</span>
                    </div>
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