import React, { useState, useEffect } from "react";
import { findthebobr } from "../scripts/finthescript";
import { getBalance, updateBalance } from "../scripts/balance";
import { recordWin, recordLoss } from "../scripts/stats";
import findthegamebg from "../../assets/img/findthegamebg.png";
import findthecard from "../../assets/img/findthecard.png";
import wallet from "../../assets/img/wallet.png";

export default function FindThe() {
  // Balance and bet
  const [balance, setBalance] = useState<number | null>(0);
  const [betAmount, setBetAmount] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);

  // Level: 1 = easy, 2 = medium, 3 = expert
  const [level, setLevel] = useState<number>(1);

  // Game state
  const [matrix, setMatrix] = useState(() => findthebobr(1));
  const [flipped, setFlipped] = useState(Array.from({ length: 9 }, () => Array(4).fill(false)));
  const [rowPicked, setRowPicked] = useState(Array(9).fill(false));
  const [currentRow, setCurrentRow] = useState(8); // Start from the bottom (row 8)
  const [gameOver, setGameOver] = useState(false);

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

    // Record win in local storage
    recordWin("findthe", winnings - bet); // profit only, or use winnings for total payout

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

      // Record loss in local storage
      recordLoss("findthe", Number(betAmount));

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181c2f] relative">
      {/* Balance on top left */}
      <div className="flex items-center mb-8 w-full max-w-[92.9vw] justify-start relative z-20">
        <div className="flex items-center ml-8">
          <img src={wallet} className="w-[3vw] mr-2" alt="Wallet" />
          <span className="text-white text-[1.5vw] font-bold">
            {balance !== null ? `${balance.toFixed(2)} mdl` : "..."}
          </span>
        </div>
      </div>

      {/* Level selector, Bet Input and Bet/Withdraw Button centered */}
      <div className="absolute ml-[-75vw] flex flex-col items-center justify-center mt-[15vw] z-20">
        {/* Level selector */}
        <div className="mb-4">
          <label className="text-white mr-2 font-bold">Level:</label>
          <select
            className="rounded-lg px-4 py-2 bg-[#504c54] text-white"
            value={level}
            onChange={e => setLevel(Number(e.target.value))}
            disabled={gameStarted}
          >
            <option value={1}>Easy (1 wrong, 3 correct)</option>
            <option value={2}>Medium (2 wrong, 2 correct)</option>
            <option value={3}>Expert (3 wrong, 1 correct)</option>
          </select>
        </div>
        <form className="w-[15vw] mb-4" onSubmit={e => e.preventDefault()}>
          <input
            type="number"
            min={0}
            value={betAmount}
            onChange={e => setBetAmount(e.target.value)}
            className="bg-[#504c54] border border-gray-900 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:text-white text-center"
            placeholder="Bet amount"
            required
            disabled={gameStarted}
          />
        </form>
        {!gameStarted ? (
          <button
            className={`px-8 py-2 rounded-lg font-bold text-white transition ${
              !betAmount || Number(betAmount) <= 0 || Number(betAmount) > (balance ?? 0) || gameStarted
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
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
            className={`px-8 py-2 rounded-lg font-bold text-white transition ${
              gameOver
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            disabled={gameOver}
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        )}
        {/* Multiplier display */}
        <div className="flex gap-8 mt-6">
          <div className="text-white text-lg">
            Previous Multiplier: <span className="font-bold">{currentMultiplier.toFixed(3)}x</span>
          </div>
          <div className="text-white text-lg">
            Next Multiplier: <span className="font-bold">{nextMultiplier ? nextMultiplier.toFixed(3) : "-"}x</span>
          </div>
        </div>
      </div>

      {/* Background image centered on the page */}
      <div className="absolute flex items-center justify-center z-0 w-full h-full">
        <img
          src={findthegamebg}
          alt="Game Background"
          className="w-[33vw] opacity-60"
          draggable={false}
        />
      </div>

      {/* Cards grid on top */}
      <div
        className="relative flex items-center justify-center z-10 top-[0.4vw]"
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