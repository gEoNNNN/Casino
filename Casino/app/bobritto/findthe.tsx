import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { findthebobr } from "../scripts/finthescript";
import { getBalance, updateBalance } from "../scripts/balance";
import findthegamebg from "../../assets/img/findthegamebg.png";
import findthecard from "../../assets/img/findthecard.png";
import wallet from "../../assets/img/wallet.png";

export default function FindThe() {
  // Balance and bet
  const [balance, setBalance] = useState<number | null>(0);
  const [betAmount, setBetAmount] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false); 
  const navigate = useNavigate();
  // Level: 1 = easy, 2 = medium, 3 = expert
  const [level, setLevel] = useState<number>(1);

  // Game state
  const [matrix, setMatrix] = useState(() => findthebobr(1));
  const [flipped, setFlipped] = useState(Array.from({ length: 9 }, () => Array(4).fill(false)));
  const [rowPicked, setRowPicked] = useState(Array(9).fill(false));
  const [currentRow, setCurrentRow] = useState(8); // Start from the bottom (row 8)
  const [gameOver, setGameOver] = useState(false);

  // Sync with dark mode from <html> (for Welcome page button sync)
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
    if (typeof window !== "undefined") {
      setBalance(getBalance());
    }
  }, []);

  // Reset game and matrix when level changes
  useEffect(() => {
    setMatrix(findthebobr(level));
    setFlipped(Array.from({ length: 9 }, () => Array(4).fill(false)));
    setRowPicked(Array(9).fill(false));
    setCurrentRow(8);
    setGameOver(false);
    setGameStarted(false);
  }, [level]);

  // Helper to reset the game
  const resetGame = () => {
    setMatrix(findthebobr(level));
    setFlipped(Array.from({ length: 9 }, () => Array(4).fill(false)));
    setRowPicked(Array(9).fill(false));
    setCurrentRow(8);
    setGameOver(false);
    setGameStarted(false);
  };

  // Multiplier logic
  const handleMultiplaier = (prev: number, level: number) => {
    if (level === 1) return prev * 1.2;
    if (level === 2) return prev * 1.45;
    if (level === 3) return prev * 1.7;
    return prev;
  };

  // Calculate multipliers based on progress
  const baseMultiplier = 1;
  let currentMultiplier = baseMultiplier;
  for (let i = 0; i < 8 - currentRow; i++) {
    currentMultiplier = handleMultiplaier(currentMultiplier, level);
  }
  const nextMultiplier = handleMultiplaier(currentMultiplier, level);

  // Handle placing a bet and starting the game
  const handleBet = () => {
    const bet = Number(betAmount);
    if (
      !gameStarted &&
      bet > 0 &&
      balance !== null &&
      bet <= balance
    ) {
      setGameStarted(true);
      const newBalance = balance - bet;
      setBalance(newBalance);
      updateBalance(newBalance);
    }
  };

  // Withdraw handler
  const handleWithdraw = () => {
    if (!gameStarted || gameOver) return;
    // Calculate winnings
    const bet = Number(betAmount);
    const winnings = bet * currentMultiplier;
    const newBalance = (balance ?? 0) + winnings;
    setBalance(newBalance);
    updateBalance(newBalance);
    setGameOver(true);
    setTimeout(() => {
      setFlipped(Array.from({ length: 9 }, () => Array(4).fill(true)));
      setTimeout(resetGame, 2000);
    }, 2000);
  };

  // Handle flipping a card
  const handleFlip = (rowIdx: number, colIdx: number) => {
    if (!gameStarted || gameOver) return;
    // Only allow pick if it's the current row and not already picked
    if (rowIdx !== currentRow || rowPicked[rowIdx]) return;

    setFlipped(prev => {
      const copy = prev.map(row => [...row]);
      copy[rowIdx][colIdx] = true;
      return copy;
    });
    setRowPicked(prev => {
      const copy = [...prev];
      copy[rowIdx] = true;
      return copy;
    });

    // If picked wrong (matrix value is 0), end game and lose bet
    if (matrix[rowIdx][colIdx] === 0) {
      setGameOver(true);
      setTimeout(() => {
        setFlipped(Array.from({ length: 9 }, () => Array(4).fill(true)));
        setTimeout(resetGame, 2000);
      }, 2000);
      return;
    }

    // If last row and picked correct, win and end game
    if (currentRow === 0) {
      setGameOver(true);
      setTimeout(() => {
        setFlipped(Array.from({ length: 9 }, () => Array(4).fill(true)));
        setTimeout(resetGame, 2000);
      }, 2000);
      return;
    }

    // Unlock the next row above (if any)
    if (currentRow > 0) setCurrentRow(currentRow - 1);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen relative transition-colors duration-300`}
      style={{
        background: dark
          ? `
            linear-gradient(135deg, #181c2f 0%, #8249B4 60%, #462320 100%),
            radial-gradient(circle at 60% 40%, rgba(255,215,0,0.08) 0, transparent 60%),
            radial-gradient(circle at 30% 80%, rgba(255,0,128,0.08) 0, transparent 70%)
          `
          : `
            linear-gradient(135deg, #bbf7d0 0%, #60a5fa 40%, #e0e7ef 70%, #d1c1f7 100%),
            radial-gradient(circle at 60% 40%, rgba(96,165,250,0.18) 0, transparent 60%),
            radial-gradient(circle at 30% 80%, rgba(168,85,247,0.12) 0, transparent 70%)
          `
      }}
    >
      {/* Balance on top left */}
      <div className="absolute top-[7vw] left-[3vw] flex items-center gap-4 z-20">
        <div className={`flex items-center px-6 py-3 rounded-2xl shadow-lg border border-[#41e1a6] 
          ${dark
            ? "bg-gradient-to-r from-[#232a3d] to-[#2e3650]"
            : "bg-gradient-to-r from-[#e0e7ef] to-[#bbf7d0]"}`
        }>
          <span className={`text-xl font-bold font-lexend tracking-wide
            ${dark ? "text-white" : "text-gray-900"}`}>
            {balance !== null ? `${balance.toFixed(2)} $` : "..."}
          </span>
        </div>
      </div>

      {/* Level selector, Bet Input and Bet/Withdraw Button centered */}
      <div className="absolute left-12 top-[15vw] z-20">
        <div className={`rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-6 w-[22vw] border-2 border-[#41e1a6]
          ${dark ? "bg-[#232a3d]" : "bg-white"}`}>
          {/* Level selector */}
          <div className="w-full flex flex-col items-start mb-2">
            <label className={`font-bold mb-1 text-lg ${dark ? "text-white" : "text-gray-900"}`}>Difficulty</label>
            <select
              className={`rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-[#41e1a6] transition
                ${dark ? "bg-[#504c54] text-white" : "bg-[#e0e7ef] text-gray-900"}`}
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
              disabled={gameStarted}
            >
              <option value={1}>Easy (1 wrong, 3 correct)</option>
              <option value={2}>Medium (2 wrong, 2 correct)</option>
              <option value={3}>Expert (3 wrong, 1 correct)</option>
            </select>
          </div>
          {/* Bet input */}
          <form className="w-full" onSubmit={e => e.preventDefault()}>
            <label className={`font-bold mb-1 text-lg ${dark ? "text-white" : "text-gray-900"}`}>Bet Amount</label>
            <input
              type="number"
              min={0}
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              className={`border text-lg rounded-lg block w-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-[#41e1a6] transition
                ${dark
                  ? "bg-[#504c54] border-[#41e1a6] text-white"
                  : "bg-[#e0e7ef] border-[#41e1a6] text-gray-900"}`}
              placeholder="Enter bet"
              required
              disabled={gameStarted}
            />
          </form>
          {/* Bet/Withdraw Button */}
          <div className="w-full flex flex-col items-center mt-2">
            {!gameStarted ? (
              <button
                className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                  !betAmount || Number(betAmount) <= 0 || Number(betAmount) > (balance ?? 0) || gameStarted
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-[#41e1a6] hover:bg-green-600 text-[#181c2f]"
                }`}
                disabled={
                  !betAmount ||
                  Number(betAmount) <= 0 ||
                  Number(betAmount) > (balance ?? 0) ||
                  gameStarted
                }
                onClick={handleBet}
              >
                Bet
              </button>
            ) : (
              <button
                className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                  gameOver
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-500 text-[#181c2f]"
                }`}
                disabled={gameOver}
                onClick={handleWithdraw}
              >
                Withdraw
              </button>
            )}
          </div>
          {/* Multiplier display */}
          <div className="flex flex-col gap-1 w-full mt-4">
            <div className="flex justify-between">
              <span className={`${dark ? "text-white" : "text-gray-900"} text-base`}>Current Multiplier:</span>
              <span className="font-bold text-[#41e1a6]">{currentMultiplier.toFixed(3)}x</span>
            </div>
            <div className="flex justify-between">
              <span className={`${dark ? "text-white" : "text-gray-900"} text-base`}>Next Multiplier:</span>
              <span className="font-bold text-yellow-300">{nextMultiplier ? nextMultiplier.toFixed(3) : "-"}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background image centered on the page */}
      <div className="absolute flex items-center justify-center z-0 w-full h-full pointer-events-none">
        <img
          src={findthegamebg}
          alt="Game Background"
          className={`w-[33vw] opacity-100 ${dark ? "" : "brightness-90"}`}
          draggable={false}
        />
      </div>
      {/* Back Button Bottom Right */}
      <button
        onClick={() => navigate("/")}
        className="fixed right-12 bottom-12 px-10 py-4 rounded-full bg-[#8249B4] text-[#D9A2FF] text-2xl font-bold shadow-md hover:shadow-lg transition border border-transparent hover:bg-[#6d399e] z-30"
      >
        Back
      </button>

      {/* Cards grid on top */}
      <div
        className="relative flex items-center justify-center z-10 top-[2.6vw]"
        style={{ width: "calc(4 * 6vw + 3 * 0.25rem)", height: "calc(9 * 3vw + 8 * 0.25rem)" }}
      >
        <div className="grid grid-cols-4 gap-2 w-full h-full">
          {Array.from({ length: 9 }).map((_, rowIdx) => (
            <React.Fragment key={rowIdx}>
              {Array.from({ length: 4 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="flex items-center justify-center aspect-[16/9] w-[6vw] h-[3vw] perspective"
                  onClick={() => handleFlip(rowIdx, colIdx)}
                  style={{
                    cursor:
                      rowIdx === currentRow && !rowPicked[rowIdx] && !gameOver && gameStarted
                        ? "pointer"
                        : "not-allowed",
                    opacity:
                      rowIdx > currentRow ||
                      (rowPicked[rowIdx] && !flipped[rowIdx][colIdx])
                        ? 0.5
                        : 1,
                  }}
                >
                  <div
                    className={`card-inner transition-transform duration-500 ${
                      flipped[rowIdx][colIdx] ? "rotate-y-180" : ""
                    } w-full h-full`}
                  >
                    {/* Card Front */}
                    <div className="card-face card-front absolute inset-0 w-full h-full flex items-center justify-center rounded-lg backface-hidden">
                      <img
                        src={findthecard}
                        alt="Find The Card"
                        className="rounded-lg shadow-lg border-2 border-[#462320] w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    {/* Card Back */}
                    <div
                      className={`card-face card-back absolute inset-0 w-full h-full flex items-center justify-center rounded-lg backface-hidden rotate-y-180 ${
                        matrix && matrix[rowIdx] && matrix[rowIdx][colIdx] === 1
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      <span className="text-white text-xl font-bold">
                        {matrix && matrix[rowIdx] && matrix[rowIdx][colIdx] === 1 ? "✔" : "✖"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <style>
        {`
          .perspective {
            perspective: 800px;
          }
          .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
          }
          .card-back {
            transform: rotateY(180deg);
          }
        `}
      </style>
    </div>
  );
}