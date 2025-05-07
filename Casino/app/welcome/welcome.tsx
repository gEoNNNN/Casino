import React, { useState, useEffect } from 'react';
import {
  storeBalance,
  updateBalance,
  getBalance
} from '../scripts/balance';

import {
  claimReward,
  getReward,
} from '../scripts/reward';

import balancebg from '../../assets/img/balance_bg.png';
import rewardbg from '../../assets/img/reward_bg.png';
import rewardbanner from '../../assets/img/rewardbanner.png';
import rewardcardbg from '../../assets/img/rewardcardbg.png';
import rewardcradgift from '../../assets/img/rewardcrdgift.png';
import statisticsbg from '../../assets/img/statisticsbg.png';
import bombdrop from '../../assets/img/bombdrop.png';
import mines from '../../assets/img/mines.png';
import find from '../../assets/img/find.png';
import fire from '../../assets/img/fire.png';

export function Welcome() {
  const [balance, setBalance] = useState(null);
  const [reward, setReward] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [canClaim, setCanClaim] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (getBalance() === null) {
        storeBalance(0);
      }
      setBalance(getBalance());
      const r = getReward();
      setReward(r);
      updateClaimStatus(r);
    }
  }, []);

  useEffect(() => {
    if (!reward || !reward.canClaimAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const claimTime = new Date(reward.canClaimAt);
      const diff = claimTime.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setCanClaim(true);
        setTimeLeft('');
        setReward(getReward()); // refresh reward
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setCanClaim(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reward]);

  const updateClaimStatus = (r) => {
    if (!r || !r.canClaimAt) {
      setCanClaim(true);
      return;
    }
    const now = new Date();
    const claimTime = new Date(r.canClaimAt);
    setCanClaim(now >= claimTime);
  };

  const handleClaimReward = () => {
    if (!canClaim) return;
    const newBal = (getBalance() || 0) + 50;
    updateBalance(newBal);
    setBalance(newBal);
    claimReward();
    const r = getReward();
    setReward(r);
    updateClaimStatus(r);
  };

  return (
    <main className="min-h-screen w-full bg-[#222B4C] text-white flex">
      {/* Balance Display */}
      <div className="relative w-[10vw] mt-[2vw] ml-[3vw]">
        <img className="w-[20vw]" src={balancebg} alt="balance background" />
        <h1 className="absolute top-[0.5vw] left-0 right-0 text-white text-[1.3vw] font-bold text-center">
          {balance !== null ? `${balance} mdl` : 'Loading...'}
        </h1>
      </div>

      {/* Statistics Section */}
      <div className="flex mt-[10vw] ml-[-10vw]">
        <img src={statisticsbg} className="w-[10vw] h-[35vw]" alt="statistics background" />
      </div>

      {/* Reward Section */}
      <div className="relative left-[10vw] mt-[2vw] flex">
        <img src={rewardbg} className="h-[15vw]" alt="rewards background" />
        <img src={rewardbanner} className="absolute w-[30vw] left-[35vw] top-[-3vw]" alt="reward banner" />
        <img src={fire} className='absolute w-[13vw] ml-[17vw] mt-[1vw]' alt="fire effect" />
        <h1 className="absolute mt-[10vw] ml-[20vw] text-white text-[1.5vw] font-bold">
          Streak: {reward ? reward.level : 0}
        </h1>
        <img src={rewardcardbg} className="absolute w-[14vw] mt-[-1vw] ml-[3vw]" alt="reward card" />
        <img src={rewardcradgift} className="absolute w-[7vw] mt-[2vw] ml-[6.3vw]" alt="reward gift" />
        <button
          className="top-[10.8vw] left-[5.6vw] absolute rounded-md bg-green-600 py-1 px-2 border border-transparent text-[0.8vw] 
                     text-white transition-all shadow-md hover:shadow-lg focus:bg-green-700 active:bg-green-700 
                     disabled:pointer-events-none disabled:opacity-50 ml-2"
          type="button"
          onClick={handleClaimReward}
          disabled={!canClaim}
        >
          {canClaim ? 'Claim Reward' : `Next ${timeLeft}`}
        </button> 
      </div>

      {/* Extra Game Options */}
      <div className="absolute grid grid-cols-3 gap-15 mt-[22vw] right-[15vw]">
        {[{ src: bombdrop, alt: 'bomb drop' }, { src: mines, alt: 'mines' }, { src: find, alt: 'find' }].map(
          (item, index) => (
            <div
              key={index}
              className="relative w-[15vw] rounded-xl overflow-hidden transform-gpu transition duration-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            >
              <img src={item.src} alt={item.alt} className="w-full h-auto rounded-xl transition duration-300" />
            </div>
          )
        )}
      </div>
    </main>
  );
}
