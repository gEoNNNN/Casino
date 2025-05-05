import bg from "../../assets/img/bombdropbg.png";
import React, { useState, useEffect, useRef } from 'react';
import historybg from "../../assets/img/historybg.png"
import historytextbg from "../../assets/img/historytextbg.png"

function generateRandomDecimal(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function crashSimulation(winChance: number): number {
  let count = 0;
  let run = true;

  while (run) {
    if (generateRandomDecimal(0, 10) < winChance) {
      count++;
    } else {
      run = false;
    }
  }

  if (count === 0) return generateRandomDecimal(1, 1.5);
  if (count === 1) return generateRandomDecimal(1.5, 5);
  if (count === 2) return generateRandomDecimal(5, 15);
  if (count === 3) return generateRandomDecimal(15, 50);
  if (count === 4) return generateRandomDecimal(50, 150);
  return generateRandomDecimal(150, 2000);
}

export default function BombDrop() {
  const [targetMultiplier, setTargetMultiplier] = useState(1);
  const [displayMultiplier, setDisplayMultiplier] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    const result = crashSimulation(4);
    setTargetMultiplier(result);
    setDisplayMultiplier(1); // Reset the displayed multiplier when a new click happens
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log(`Animation stopped at: ${displayMultiplier.toFixed(2)}x`);
    }
  };

  useEffect(() => {
    if (displayMultiplier >= targetMultiplier) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayMultiplier(prev => {
        const diff = targetMultiplier - prev;
        let increment = 0;

        if (prev < 2) {
          increment = Math.max(diff / 3000, 0.01);  // Slower for 1-2
        } else if (prev < 6) {
          increment = Math.max(diff / 1000, 0.05);  // Slower for 2-6
        } else if (prev < 20) {
          increment = Math.max(diff / 500, 0.1);   // Slower for 6-20
        } else if (prev < 50) {
          increment = Math.max(diff / 250, 0.2);   // Slower for 20-50
        } else {
          increment = Math.max(diff / 100, 0.5);   // Slower for 50-2000
        }

        const next = prev + increment;
        if (next >= targetMultiplier) {
          clearInterval(intervalRef.current!);
          return targetMultiplier;
        }

        return parseFloat(next.toFixed(2));
      });
    }, 100); // Slower updates

    return () => clearInterval(intervalRef.current!);
  }, [targetMultiplier]);

  return (
    <div className="text-white bg-[#222B4C] min-h-screen p-4">
      <div className="flex justify-center items-center relative">
        <img src={bg} className="w-[92.9vw] object-contain" />
        <h1 className="absolute text-[5vw] mb-[10vw]">{displayMultiplier.toFixed(2)}x</h1>
        
        {/* History background */}
        <div className="absolute">
            <img src={historybg} className="w-[20vw] mr-[65vw] z-10" />
        </div>
        
        {/* History text background */}
        <div className="absolute">
          <img src={historytextbg} className="w-[18vw]" />
        </div>
  
        {/* Buttons */}
        <div className="absolute flex flex-col space-y-4 mt-[30vw] z-30">
          <button
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generate Random Decimal
          </button>
          <button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Stop Animation
          </button>
        </div>
      </div>
    </div>
  );  
  
}