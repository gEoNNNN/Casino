import React, { useState, useEffect, useRef } from 'react';
import bg from "../../assets/img/bombdropbg.png";
import historybg from "../../assets/img/historybg.png";
import historytextbg from "../../assets/img/historytextbg.png";
import wallet from "../../assets/img/wallet.png";
import {
  storeBalance,
  updateBalance,
  deleteBalance,
  getBalance
} from "../scripts/balance";

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
  const [inBet, setInBet] = useState<boolean>(false);
  const [manuallyStopped, setManuallyStopped] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);

  // Balance setup
  const initBalance = () => {
    const storedBalance = getBalance(); // Get the balance from localStorage
    if (storedBalance !== null) {
      setBalance(storedBalance); // Set the balance state to the value from localStorage
    } else {
      storeBalance(0); // If no balance exists, store an initial balance of 0
      setBalance(0); // Set the state to 0 as well
    }
  };

  useEffect(() => {
    initBalance();
  }, []);

  // Animate multiplier
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

          if (!manuallyStopped) {
            console.log(`Auto end at: ${targetMultiplier.toFixed(2)}x`);
            setInBet(false);
          }

          return targetMultiplier;
        }

        return parseFloat(next.toFixed(2));
      });
    }, 100);
  };

  useEffect(() => {
    animateMultiplier();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetMultiplier]);

  // Start round
  const handleClick = () => {
    if (balance !== null) {
      setInBet(true);
      setManuallyStopped(false);
      const result = crashSimulation(4);
      setDisplayMultiplier(1);
      setTargetMultiplier(result);
      const newBalance = balance - betAmount;
      setBalance(newBalance); // Update state
      updateBalance(newBalance); // Update localStorage
      console.log("User bet amount:", betAmount);
    }
  };

  // Stop button press
  const handleStop = () => {
    const newBalance = balance + betAmount * parseFloat(displayMultiplier.toFixed(2));
    console.log(`Manual stop at: ${displayMultiplier.toFixed(2)}x so you win ${betAmount} x ${displayMultiplier.toFixed(2)} = ${betAmount * parseFloat(displayMultiplier.toFixed(2))}`);
    setBalance(newBalance); // Update state
    updateBalance(newBalance); // Update localStorage
    setManuallyStopped(true);
  };

  return (
    <div className="text-white bg-[#222B4C] min-h-screen p-4">
      <div className="flex justify-center items-center relative">
        <img src={bg} className="w-[92.9vw] object-contain" alt="Bomb Drop Background" />
        <h1 className="absolute text-[5vw] mb-[10vw] ml-[20vw]">
          x{displayMultiplier.toFixed(2)}
        </h1>

        <img src={wallet} className="absolute w-[3vw] mb-[40vw] mr-[82vw]" alt="Wallet" />
        <h1 className="absolute z-10 mb-[39vw] mr-[70vw]">
          {balance !== null ? `${balance.toFixed(2)} mdl` : '...'}
        </h1>
        
        <img src={historybg} className="absolute w-[17vw] mr-[70vw] mt-[3vw] z-10" alt="History BG" />
        <img src={historytextbg} className="absolute w-[15vw] mb-[28vw] mr-[70vw] z-11" alt="History Text BG" />

        <div className="absolute flex flex-col space-y-4 mt-[30vw] z-30">
          {!inBet && (
            <button
              onClick={handleClick}
              className="bg-[#1884fc] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-[15vw]"
            >
              Bet
            </button>
          )}

          {inBet && manuallyStopped && (
            <button
              className="bg-[#1884fc] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-[15vw]"
            >
              Waiting ...
            </button>
          )}

          {inBet && !manuallyStopped &&(
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-[15vw]"
            >
              Withdraw
            </button>
          )}

          <form className="absolute max-w-sm mx-auto ml-[20vw] w-[15vw]">
            <input
              type="number"
              id="number-input"
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bg-[#504c54] border border-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Bet amount"
              required
            />
          </form>
        </div>
      </div>
    </div>
  );
}
