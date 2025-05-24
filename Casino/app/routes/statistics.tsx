import React from "react";
import { getGameStats, resetStats } from "../scripts/stats";

const GAME_NAMES = [
  { key: "mines", label: "Pig Mines" },
  { key: "bombdrop", label: "Bomb Drop" },
  { key: "findthe", label: "Find The Card" },
] as const;

export default function Statistics() {
  const [stats, setStats] = React.useState(() =>
    Object.fromEntries(
      GAME_NAMES.map(({ key }) => [key, getGameStats(key as any)])
    )
  );

  const handleReset = () => {
    resetStats();
    setStats(
      Object.fromEntries(
        GAME_NAMES.map(({ key }) => [key, getGameStats(key as any)])
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c2f] to-[#232a3d] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8 tracking-wide">Game Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {GAME_NAMES.map(({ key, label }) => (
          <div
            key={key}
            className="bg-[#232a3d] rounded-2xl shadow-lg p-8 flex flex-col items-center border-2 border-[#41e1a6] hover:scale-105 transition"
          >
            <h2 className="text-2xl font-bold text-[#41e1a6] mb-4">{label}</h2>
            <div className="text-white text-lg space-y-2">
              <div>
                <span className="font-semibold">Wins:</span>{" "}
                <span className="text-green-400">{stats[key].wins}</span>
              </div>
              <div>
                <span className="font-semibold">Losses:</span>{" "}
                <span className="text-red-400">{stats[key].losses}</span>
              </div>
              <div>
                <span className="font-semibold">Money Won:</span>{" "}
                <span className="text-green-300">{stats[key].moneyWon.toFixed(2)} mdl</span>
              </div>
              <div>
                <span className="font-semibold">Money Lost:</span>{" "}
                <span className="text-red-300">{stats[key].moneyLost.toFixed(2)} mdl</span>
              </div>
              <div>
                <span className="font-semibold">Net Profit:</span>{" "}
                <span className={stats[key].moneyWon - stats[key].moneyLost >= 0 ? "text-green-400" : "text-red-400"}>
                  {(stats[key].moneyWon - stats[key].moneyLost).toFixed(2)} mdl
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-12 px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow transition"
        onClick={handleReset}
      >
        Reset Statistics
      </button>
    </div>
  );
}