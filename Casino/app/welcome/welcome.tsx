import React, { useState } from 'react';
import balancebg from "../../assets/img/balance_bg.png";
import rewardbg from "../../assets/img/reward_bg.png";
import rewardbanner from "../../assets/img/rewardbanner.png";
import rewardcardbg from "../../assets/img/rewardcardbg.png";
import rewardcradgift from "../../assets/img/rewardcrdgift.png";
import statisticsbg from "../../assets/img/statisticsbg.png";
import bombdrop from "../../assets/img/bombdrop.png";
import mines from "../../assets/img/mines.png";
import find from "../../assets/img/find.png";


export function Welcome() {
  const [balance, setBalance] = useState(700);

  return (
    <main className="min-h-screen w-full bg-[#222B4C] text-white flex">
      <div className="relative w-[10vw] mt-[2vw] ml-[3vw]">
        <img className="w-[20vw]" src={balancebg} alt="balance background" />
        <h1 className="absolute top-[0.5vw] left-0 right-0 text-white text-[1.3vw] font-bold text-center">{balance} mdl</h1>
      </div>
      <div className='flex mt-[10vw] ml-[-10vw]'>
        <img src={statisticsbg} className='w-[10vw] h-[35vw]'/>
      </div>
      <div className='relative left-[10vw] mt-[2vw] flex'>
        <img src={rewardbg} className='h-[15vw]'/>
        <img src={rewardbanner} className='absolute w-[30vw] left-[35vw] top-[-3vw]' />
        <img className="absolute w-[14vw] mt-[-1vw] ml-[7vw]" src={rewardcardbg}/>
        <img className="absolute w-[7vw] mt-[2vw] ml-[10.3vw]" src={rewardcradgift}/>
        <button className="top-[10.8vw] left-[9.6vw] absolute rounded-md bg-green-600 py-1 px-2 border border-transparent text-center text-[0.8vw] text-white transition-all shadow-md hover:shadow-lg focus:bg-green-700 focus:shadow-none active:bg-green-700 hover:bg-green-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2" type="button">
        Claim Reward
        </button>
      </div>
      <div className="absolute grid grid-cols-3 gap-15 mt-[22vw] right-[15vw]">
          <div className="..."><img src={bombdrop} className='w-[15vw] rounded-xl' /></div>
          <div className="..."><img src={mines} className='w-[15vw] rounded-xl' /></div>
          <div className="..."><img src={find} className='w-[15vw] rounded-xl' /></div>
       </div>
    </main>
  );
}
