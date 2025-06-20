import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import {
  storeBalance,
  updateBalance,
  getBalance
} from '../scripts/balance';

import {
  claimReward,
  getReward,
} from '../scripts/reward';

import banner from "../../assets/img/casinotext.png"
import rewardbg from '../../assets/img/reward_bg.png';
import rewardbanner from '../../assets/img/rewardbanner.png';
import rewardcardbg from '../../assets/img/rewardcardbg.png';
import rewardcradgift from '../../assets/img/rewardcrdgift.png';
import statisticsbg from '../../assets/img/statisticsbg.png';
import bombdrop from '../../assets/img/bombdrop.png';
import mines from '../../assets/img/mines.png';
import find from '../../assets/img/find.png';
import fire from '../../assets/img/fire.png';

// Only animate the image content, not the container size
const zoomStyle = `
@keyframes zoomInOutBanner {
  0% { transform: scale(1);}
  50% { transform: scale(1.08);}
  100% { transform: scale(1);}
}
.banner-zoom-anim {
  animation: zoomInOutBanner 10s ease-in-out infinite;
  will-change: transform;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
`;

interface RewardObj {
  claimedAt: string;
  level: number;
  canClaimAt: string;
}

export function Welcome() {
  const [balance, setBalance] = useState<number | null>(null);
  const [reward, setReward] = useState<RewardObj | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [canClaim, setCanClaim] = useState(true);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });
  const navigate = useNavigate();

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

  const updateClaimStatus = (r: RewardObj | null) => {
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

  // On mount, sync theme from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setDark(true);
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
        setDark(false);
      }
    }
  }, []);

  // Toggle dark mode class on <html> and save to localStorage
  const toggleDarkMode = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  return (
    <main
      className="min-h-screen w-screen text-white flex items-center justify-center overflow-hidden transition-colors duration-300"
      style={{
        background: dark
          ? `
          linear-gradient(135deg, #1C0C54 0%, #E040FB 50%, #1E1A91 100%),
          radial-gradient(circle at 60% 40%, rgba(255,215,0,0.08) 0, transparent 60%),
          radial-gradient(circle at 30% 80%, rgba(255,0,128,0.08) 0, transparent 70%)
        `
          : `
          linear-gradient(135deg, #60a5fa 0%, #e0e7ef 40%, #d1c1f7 70%, #bbf7d0 100%),
          radial-gradient(circle at 60% 40%, rgba(96,165,250,0.18) 0, transparent 60%),
          radial-gradient(circle at 30% 80%, rgba(168, 85, 247, 0.12) 0, transparent 70%)
        `
      }}
    >
      {/* Dark/Light mode toggle button */}
      <button
        className={`
          fixed top-8 right-30 z-50 px-6 py-2 rounded-full flex items-center gap-2
          font-bold shadow transition-all duration-300
          ${dark
            ? "bg-[#232a3d] text-white hover:bg-[#181c2f]"
            : "bg-[#e0e7ef]/80 text-[#232a3d] hover:bg-blue-100"}
          ring-2 ring-[#8249B4] hover:scale-105 active:scale-95
        `}
        onClick={toggleDarkMode}
        type="button"
        style={{
          boxShadow: dark
            ? "0 0 16px #8249B4cc"
            : "0 0 16px #60a5fa88",
          transition: "background 0.3s, color 0.3s, box-shadow 0.3s, transform 0.15s"
        }}
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          <span
            className={`
              absolute transition-all duration-300
              ${dark
                ? "opacity-0 scale-75"
                : "opacity-100 scale-100"}
            `}
            style={{ left: 0, top: 0 }}
            aria-hidden="true"
          >
            {/* Sun icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" fill="#facc15" />
              <g stroke="#facc15" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
              </g>
            </svg>
          </span>
          <span
            className={`
              absolute transition-all duration-300
              ${dark
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75"}
            `}
            style={{ left: 0, top: 0 }}
            aria-hidden="true"
          >
            {/* Moon icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                fill="#a78bfa"
              />
            </svg>
          </span>
        </span>
        <span className="ml-2">
          {dark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
      {/* Inject zoom animation style */}
      <style>{zoomStyle}</style>
      {/* Balance in the top left corner */}
      <div className="fixed top-[1vw] left-[7vw] z-20">
        <div
          className="w-[9vw] h-[4vw] rounded-2xl flex flex-col items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #932C91 60%, #E040FB 100%)",
            boxShadow: "0 0 24px 0 #E040FB88",
          }}
        >
          <h1 className="font-lexend text-[1.2vw]">Total balance</h1>
          <h1 className="font-roboto text-[1.1vw] mr-[3vw]">
            {balance !== null ? `$ ${balance}` : 'Loading...'}
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full max-w-[100vw] mt-[5vw] overflow-hidden">
        {/* Banner */}
        <div className="col-span-2 w-[55vw] flex items-center justify-center min-h-[18vw] ml-[7vw] relative overflow-hidden rounded-[2vw]">
          <div className="w-[60vw] h-[20vw] flex items-center justify-center relative overflow-hidden">
            {/* Banner image with pulse effect, cropped to container */}
            <div className="absolute w-full h-full top-0 left-0 overflow-hidden z-0">
              <img
                src={banner}
                className="banner-zoom-anim"
                alt="Casino Banner"
              />
            </div>
            <h1 className='absolute text-[#D9A2FF] font-lexend font-bold text-[3vw] left-[2vw] top-[2vw] z-10'>WIN BIG</h1>
            <h1 className='absolute text-[#D9A2FF] font-lexend font-bold text-[1.6vw] left-[2vw] top-[8vw] w-[25vw] z-10'>One lucky spin is all it takes to turn your night into a legend.</h1>
            <button
              className="absolute left-[5vw] bottom-[2vw] w-[10vw] h-[2vw] rounded-full bg-[#8249B4] border border-transparent text-[1.1vw] 
                         text-[#D9A2FF] transition-all shadow-md hover:shadow-lg focus:bg-green-700 active:bg-green-700 
                         disabled:pointer-events-none disabled:opacity-50 z-10"
              type="button"
              onClick={() => navigate("/mines")}
            >
              Play Now
            </button>
          </div>
        </div>
        {/* Reward */}
        <div className="flex flex-col items-center justify-center min-h-[18vw] relative mr-[5vw]">
          <img src={rewardbg} className="w-[28vw] h-[20vw]" alt="rewards background"/>
          <img src={fire} className='absolute w-[2.5vw] ml-[22vw] mt-[9vw]' alt="fire effect" />
          <h1 className="absolute ml-[17vw] w-[10vw] text-[1.6vw] font-bold font-lexend text-[#D9A2FF]">
            Claim your daily reward  don’t let the streak burn out at  {reward ? reward.level : 0}
          </h1>
          <img src={rewardcardbg} className="absolute w-[16vw] mr-[10vw]" alt="reward card" />
          <img src={rewardcradgift} className="absolute w-[8vw] mt-[-3vw] mr-[9vw] -rotate-30" alt="reward gift" />
          <button
            className="mt-[11vw] mr-[10vw] absolute rounded-full bg-[#8249B4] py-2 px-4 border border-transparent text-[1.1vw] 
                       text-[#D9A2FF] transition-all shadow-md hover:shadow-lg focus:bg-green-700 active:bg-green-700 
                       disabled:pointer-events-none disabled:opacity-50"
            type="button"
            onClick={handleClaimReward}
            disabled={!canClaim}
          >
            {canClaim ? 'Claim Reward' : `Next ${timeLeft}`}
          </button>
        </div>
        {/* Statistics */}
        <div className="flex items-center justify-center w-[28vw] h-[22vw] overflow-hidden transform-gpu transition duration-500 hover:scale-105">
              <img src={statisticsbg} alt="mines" className=" w-[25vw] h-[21vw] object-contain transition duration-300" onClick={() => navigate("/statistics")} />
          <button
            className="w-[10vw] mb-[0.5vw] px-8 py-2 rounded-full bg-[#8249B4] border border-transparent text-[1.1vw] text-[#D9A2FF] transition-all shadow-md hover:shadow-lg focus:bg-green-700 active:bg-green-700 disabled:pointer-events-none disabled:opacity-50 absolute bottom-[2vw] left-1/2 -translate-x-1/2 z-10"
            type="button"
            onClick={() => navigate("/statistics")}
          >
            View
          </button>
        </div>
        {/* Games */}
        <div className="col-span-2 flex items-center justify-center min-h-[22vw] ml-[-7vw] mr-[6vw]">
          <div className="grid grid-cols-3 gap-[3vw] w-full">
            <div className="flex items-center justify-center w-[28vw] h-[22vw]  overflow-hidden transform-gpu transition duration-500 hover:scale-105">
              <img src={bombdrop} alt="bomb drop" className=" w-[25vw] h-[21vw] object-contain transition duration-300" onClick={() => navigate("/bombdrop")} />
            </div>
            <div className="flex items-center justify-center w-[28vw] h-[22vw] overflow-hidden transform-gpu transition duration-500 hover:scale-105">
              <img src={mines} alt="mines" className=" w-[25vw] h-[21vw] object-contain transition duration-300" onClick={() => navigate("/mines")} />
            </div>
            <div className="flex items-center justify-center w-[28vw] h-[22vw] overflow-hidden transform-gpu transition duration-500 hover:scale-105">
              <img src={find} alt="find" className=" w-[25vw] h-[21vw]  object-contain transition duration-300" onClick={() => navigate("/findthe")} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}