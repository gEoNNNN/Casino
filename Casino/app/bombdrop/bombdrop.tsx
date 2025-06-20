import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from "react-router";
import bg from "../../assets/img/bombdropbg.png";
import historybg from "../../assets/img/historybg.png";
import historytextbg from "../../assets/img/historytextbg.png";
import wallet from "../../assets/img/wallet.png";

import {
  storeBalance,
  updateBalance,
  getBalance
} from "../scripts/balance";

import {
  addToHistory,
  getHistory
} from "../scripts/history";

import { recordWin, recordLoss } from "../scripts/stats";

function generateRandomDecimal(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function crashSimulation(winChance: number): number {
  let count = 0;
  while (generateRandomDecimal(0, 10) < winChance) {
    count++;
  }
  if (count === 0) return generateRandomDecimal(1, 1.5);
  if (count === 1) return generateRandomDecimal(1.5, 5);
  if (count === 2) return generateRandomDecimal(5, 15);
  if (count === 3) return generateRandomDecimal(15, 50);
  if (count === 4) return generateRandomDecimal(50, 150);
  return generateRandomDecimal(150, 2000);
}

export default function BombDrop() {
  const [balance, setBalance] = useState<number | null>(0);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(1);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnimatedRef = useRef<boolean>(false);
  const [inBet, setInBet] = useState<boolean>(false);
  const [manuallyStopped, setManuallyStopped] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);
  const [crashed, setCrashed] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false); // NEW: win animation state
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") return true;
      if (storedTheme === "light") return false;
      // Use system preference if no theme is stored
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false; // Default to light on server
  });
  const navigate = useNavigate();

  const initBalance = () => {
    const storedBalance = getBalance();
    if (storedBalance !== null) {
      setBalance(storedBalance);
    } else {
      storeBalance(0);
      setBalance(0);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initBalance();
      setHistory(getHistory());
    }
  }, []);

  const animateMultiplier = () => {
    if (displayMultiplier >= targetMultiplier) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayMultiplier(prev => {
        const diff = targetMultiplier - prev;
        let increment = 0;

        if (prev < 2) increment = Math.max(diff / 3000, 0.01);
        else if (prev < 6) increment = Math.max(diff / 1000, 0.05);
        else if (prev < 20) increment = Math.max(diff / 500, 0.1);
        else if (prev < 50) increment = Math.max(diff / 250, 0.2);
        else increment = Math.max(diff / 100, 0.5);

        const next = prev + increment;

        if (next >= targetMultiplier) {
          clearInterval(intervalRef.current!);

          if (!hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            const finalValue = parseFloat(targetMultiplier.toFixed(2));
            addToHistory(finalValue);
            setHistory(getHistory());
          }

          setInBet(false);

          // Trigger crash animation if not manually stopped
          if (!manuallyStopped) {
            setCrashed(true);
            setTimeout(() => setCrashed(false), 1200); // 1.2s crash effect

            // Record loss in local storage
            recordLoss("bombdrop", betAmount);
          }

          return targetMultiplier;
        }

        return parseFloat(next.toFixed(2));
      });
    }, 100);
  };

  useEffect(() => {
    if (inBet) animateMultiplier();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetMultiplier, inBet]);

  // Reset crash state when new bet starts
  useEffect(() => {
    if (inBet) setCrashed(false);
  }, [inBet]);

  const handleClick = () => {
    if (balance !== null && betAmount > 0 && betAmount <= balance) {
      setInBet(true);
      setManuallyStopped(false);
      hasAnimatedRef.current = false;
      const result = crashSimulation(4);
      setDisplayMultiplier(1);
      setTargetMultiplier(result);

      const newBalance = balance - betAmount;
      setBalance(newBalance);
      updateBalance(newBalance);
    }
  };

  const handleStop = () => {
    if (balance !== null) {
      const winnings = betAmount * parseFloat(displayMultiplier.toFixed(2));
      const profit = winnings - betAmount;
      const newBalance = balance + winnings;
      setBalance(newBalance);
      updateBalance(newBalance);
      setManuallyStopped(true);
      setWon(true); // NEW: trigger win animation
      setTimeout(() => setWon(false), 1200); // NEW: remove win animation after 1.2s

      // Record win in local storage
      recordWin("bombdrop", profit);
    }
  };

  // Rising line points for SVG (simulate a crash curve, animated with displayMultiplier)
  const linePoints = useMemo(() => {
    const points: [number, number][] = [];
    let x = 0;
    let step = 8; // 400/50 steps
    let multiplier = 1;
    while (x <= 400 && multiplier <= displayMultiplier) {
      multiplier += inBet ? 0.018 * Math.pow(multiplier, 1.09) : 0;
      // Map multiplier to y so that at multiplier=1, y=400 (bottom), at higher multiplier, y approaches 0 (top)
      let y = 400 - ((multiplier - 1) * 200); // adjust 200 for steepness
      if (y < 0) y = 0;
      points.push([x, y]);
      if (y === 0) break;
      x += step;
    }
    return points;
    // eslint-disable-next-line
  }, [displayMultiplier, inBet, manuallyStopped]);

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

  return (
    <div className={`min-h-screen flex items-stretch justify-center relative transition-colors duration-300
      ${dark
        ? "bg-gradient-to-b from-[#181c2f] to-[#222B4C]"
        : "bg-gradient-to-br from-[#e0e7ef] to-[#bbf7d0]"}
    `}>
      {/* Crash animation overlay */}
      {crashed && (
        <div
          className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
          style={{
            background: "rgba(255,0,0,0.10)",
            boxShadow: "0 0 120px 60px rgba(255,0,0,0.45) inset",
            animation: "crash-flash 0.8s linear 2"
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "60%",
              transform: "translate(-50%, -50%)",
              color: "#ff3b3b",
              fontSize: "6vw",
              fontWeight: "bold",
              textShadow: "0 0 40px #ff3b3b, 0 0 80px #ff3b3b",
              letterSpacing: "0.1em",
              filter: "drop-shadow(0 0 24px #ff3b3b)"
            }}
          >
            CRASH
          </span>
        </div>
      )}
      {/* Win animation overlay */}
      {won && (
        <div
          className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
          style={{
            background: "rgba(0,255,100,0.10)",
            boxShadow: "0 0 120px 60px rgba(0,255,100,0.45) inset",
            animation: "win-flash 0.8s linear 2"
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "60%",
              transform: "translate(-50%, -50%)",
              color: "#41e1a6",
              fontSize: "6vw",
              fontWeight: "bold",
              textShadow: "0 0 40px #41e1a6, 0 0 80px #41e1a6",
              letterSpacing: "0.1em",
              filter: "drop-shadow(0 0 24px #41e1a6)"
            }}
          >
            WIN
          </span>
        </div>
      )}
      {/* Balance Top Left */}
      <div className="absolute top-[6vw] left-[8vw] flex items-center gap-4 z-20">
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
        onClick={() => navigate("/")}
        className="fixed right-12 bottom-12 px-10 py-4 rounded-full bg-[#8249B4] text-[#D9A2FF] text-2xl font-bold shadow-md hover:shadow-lg transition border border-transparent hover:bg-[#6d399e] z-30"
      >
        Back
      </button>
      {/* Custom grid: Left 30% (History + Bet), Right 70% (Graph + Multiplier) */}
      <div className="flex w-full max-w-[1800px] mx-auto ml-[8vw]" style={{minHeight: "80vh"}}>
        {/* Left: History + Bet Controls (30%) */}
        <div className="flex flex-col items-center justify-start mt-[14vw] w-[20vw]">
          {/* History */}
          <div className={`w-full rounded-2xl shadow-lg px-6 py-6 flex flex-col items-center mb-8
            ${dark ? "bg-[#232a3d]" : "bg-white"}`}>
            <span className={`text-lg mb-4 font-bold tracking-widest uppercase
              ${dark ? "text-gray-400" : "text-gray-800"}`}>History</span>
            <div className="flex flex-wrap gap-3 justify-center">
              {history.slice(-18).reverse().map((value, idx) => (
                <span
                  key={idx}
                  className={`font-bold text-lg rounded px-2 py-1 transition
                    ${
                      value >= 2
                        ? "text-green-500"
                        : value >= 1.5
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                    ${idx > 5 ? "opacity-60 grayscale" : ""}
                    ${dark ? "bg-[#232a3d]/60" : "bg-[#e0e7ef]/60"}
                  `}
                >
                  x{value.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
          {/* Bet Controls */}
          <div className={`flex flex-col items-center gap-4 rounded-2xl shadow-lg px-10 py-8 w-full max-w-[400px] mt-8 border-2 border-[#41e1a6]
            ${dark ? "bg-[#232a3d]" : "bg-white"}
            ${!inBet && betAmount <= 0 ? "opacity-70 grayscale" : ""}
          `}>
            <form
              className="flex flex-col items-center gap-2 w-full"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="number"
                min={1}
                value={betAmount === 0 ? "" : betAmount}
                onChange={e => setBetAmount(Number(e.target.value))}
                className={`border text-lg rounded-lg block w-full p-3 text-center focus:outline-none focus:ring-2 focus:ring-[#1884fc] transition
                  ${dark
                    ? "bg-[#181c2f] border-[#3a415a] text-white"
                    : "bg-[#e0e7ef] border-[#41e1a6] text-gray-900 font-bold"}
                  ${inBet ? "opacity-60 grayscale" : ""}
                `}
                placeholder="Enter bet amount"
                disabled={inBet}
              />
            </form>
            {!inBet ? (
              <button
                onClick={handleClick}
                className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                  betAmount > 0 && betAmount <= (balance ?? 0)
                    ? "bg-[#1884fc] hover:bg-blue-600 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed opacity-70 grayscale"
                }`}
                disabled={betAmount <= 0 || betAmount > (balance ?? 0)}
              >
                Bet
              </button>
            ) : manuallyStopped ? (
              <button
                className="w-full py-3 rounded-lg font-bold text-lg bg-gray-500 text-gray-300 cursor-not-allowed opacity-70 grayscale"
                disabled
              >
                Waiting...
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="w-full py-3 rounded-lg font-bold text-lg bg-yellow-400 hover:bg-yellow-500 text-[#181c2f] transition"
              >
                Withdraw
              </button>
            )}
          </div>
        </div>
        {/* Right: Graph + Multiplier (70%) */}
        <div className="flex flex-col items-center justify-center" style={{width: "70%"}}>
          {/* Crash Graph */}
          <div className="relative w-full flex justify-center items-end mt-[-10vw]" style={{height: 600, minHeight: 600, maxHeight: 600}}>
            <svg
              width="600"
              height="600"
              viewBox="0 0 600 600"
              className="absolute left-1/2 -translate-x-1/2 top-0 z-0"
              style={{ pointerEvents: "none" }}
            >
              <polyline
                fill="none"
                stroke="#41e1a6"
                strokeWidth="8"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={linePoints.map(([x, y]) => `${x * 1.5},${y * 1.5}`).join(" ")}
                style={{
                  filter: crashed
                    ? "drop-shadow(0 0 40px #ff3b3bcc)"
                    : won
                    ? "drop-shadow(0 0 40px #41e1a6cc)"
                    : "drop-shadow(0 0 18px #41e1a6cc)",
                  transition: "all 0.2s linear"
                }}
              />
            </svg>
          </div>
          {/* Multiplier */}
          <div className="flex flex-col items-center mt-2 mb-6">
            <span className={`text-lg tracking-widest uppercase mb-2
              ${dark ? "text-gray-400" : "text-gray-800 font-bold"}`}>Current Multiplier</span>
            <span
              className={`text-[6vw] md:text-[3vw] font-extrabold transition-all duration-200 ${
                inBet && !manuallyStopped
                  ? "text-green-500 animate-pulse"
                  : crashed
                  ? "text-red-600 animate-crash-shake"
                  : won
                  ? "text-green-500 animate-win-shake"
                  : dark
                  ? "text-white"
                  : "text-gray-900"
              }`}
              style={{ fontFamily: "Lexend, sans-serif" }}
            >
              x{displayMultiplier.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to your global CSS (e.g., styles/globals.css or in a <style> tag)
/*
@keyframes crash-flash {
  0% { opacity: 0.7; box-shadow: 0 0 120px 60px #ff3b3b77 inset; }
  50% { opacity: 0.2; box-shadow: 0 0 200px 120px #ff3b3bcc inset; }
  100% { opacity: 0.7; box-shadow: 0 0 120px 60px #ff3b3b77 inset; }
}
@keyframes win-flash {
  0% { opacity: 0.7; box-shadow: 0 0 120px 60px #41e1a677 inset; }
  50% { opacity: 0.2; box-shadow: 0 0 200px 120px #41e1a6cc inset; }
  100% { opacity: 0.7; box-shadow: 0 0 120px 60px #41e1a677 inset; }
}
@keyframes crash-shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
  100% { transform: translateX(0); }
}
@keyframes win-shake {
  0% { transform: translateY(0); }
  20% { transform: translateY(-10px); }
  40% { transform: translateY(10px); }
  60% { transform: translateY(-8px); }
  80% { transform: translateY(8px); }
  100% { transform: translateY(0); }
}
.animate-crash-shake {
  animation: crash-shake 0.6s;
}
.animate-win-shake {
  animation: win-shake 0.6s;
}
*/