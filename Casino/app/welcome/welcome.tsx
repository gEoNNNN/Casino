// src/components/Welcome.jsx

import React, { useState, useEffect } from 'react';
import balancebg      from '../../assets/img/balance_bg.png';
import rewardbg       from '../../assets/img/reward_bg.png';
import rewardbanner   from '../../assets/img/rewardbanner.png';
import rewardcardbg   from '../../assets/img/rewardcardbg.png';
import rewardcradgift from '../../assets/img/rewardcrdgift.png';
import statisticsbg   from '../../assets/img/statisticsbg.png';
import bombdrop       from '../../assets/img/bombdrop.png';
import mines          from '../../assets/img/mines.png';
import find           from '../../assets/img/find.png';

import {
  storeBalance,
  updateBalance,
  deleteBalance,
  getBalance
} from '../scripts/balance';

export function Welcome() {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    // Initialize balance if not present
    if (getBalance() === null) {
      storeBalance(0);
    }
    // Read and set into state
    setBalance(getBalance());
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#222B4C] text-white flex">
      <div className="relative w-[10vw] mt-[2vw] ml-[3vw]">
        <img className="w-[20vw]" src={balancebg} alt="balance background" />
        <h1 className="absolute top-[0.5vw] left-0 right-0 text-white text-[1.3vw] font-bold text-center">
          {balance !== null ? `${balance} mdl` : 'Loading...'}
        </h1>
      </div>

      <div className="flex mt-[10vw] ml-[-10vw]">
        <img src={statisticsbg} className="w-[10vw] h-[35vw]" alt="statistics background" />
      </div>

      <div className="relative left-[10vw] mt-[2vw] flex">
        <img src={rewardbg} className="h-[15vw]" alt="rewards background" />
        <img src={rewardbanner} className="absolute w-[30vw] left-[35vw] top-[-3vw]" alt="reward banner" />
        <img src={rewardcardbg} className="absolute w-[14vw] mt-[-1vw] ml-[7vw]" alt="reward card" />
        <img src={rewardcradgift} className="absolute w-[7vw] mt-[2vw] ml-[10.3vw]" alt="reward gift" />
        <button
          className="top-[10.8vw] left-[9.6vw] absolute rounded-md bg-green-600 py-1 px-2 border border-transparent text-[0.8vw] 
                     text-white transition-all shadow-md hover:shadow-lg focus:bg-green-700 active:bg-green-700 
                     disabled:pointer-events-none disabled:opacity-50 ml-2"
          type="button"
          onClick={() => {
            // e.g. claim reward ⇒ add 50
            const newBal = (getBalance() || 0) + 50;
            updateBalance(newBal);
            setBalance(newBal);
          }}
        >
          Claim Reward
        </button>
      </div>

      <div className="absolute grid grid-cols-3 gap-15 mt-[22vw] right-[15vw]">
        <div><img src={bombdrop} className="w-[15vw] rounded-xl" alt="bomb drop" /></div>
        <div><img src={mines}    className="w-[15vw] rounded-xl" alt="mines" /></div>
        <div><img src={find}     className="w-[15vw] rounded-xl" alt="find" /></div>
      </div>
    </main>
  );
}
