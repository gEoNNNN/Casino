import { useState } from 'react';

interface RewardObj {
  claimedAt: string;
  level: number;
  canClaimAt: string;
}

function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  const hours = `${now.getHours()}`.padStart(2, '0');
  const minutes = `${now.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getTomorrowMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.toISOString();
}

function isNextDay(previousDateStr: string): boolean {
  const previous = new Date(previousDateStr);
  const now = new Date();

  const prevDate = new Date(previous.getFullYear(), previous.getMonth(), previous.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffInMs = nowDate.getTime() - prevDate.getTime();
  return diffInMs === 86400000;
}

export function canClaimReward(): boolean {
  const rewardRaw = localStorage.getItem('reward');
  if (!rewardRaw) return true; // First time

  const reward = JSON.parse(rewardRaw);
  const canClaimAt = new Date(reward.canClaimAt);
  const now = new Date();

  return now >= canClaimAt;
}

export function getNextClaimTime(): string | null {
  const rewardRaw = localStorage.getItem('reward');
  if (!rewardRaw) return null;

  const reward = JSON.parse(rewardRaw);
  return reward.canClaimAt || null;
}

export function claimReward(): boolean {
  const rewardRaw = localStorage.getItem('reward');
  const nowStr = getFormattedDate();
  const canClaimAt = getTomorrowMidnight();
  const now = new Date();

  if (rewardRaw) {
    const reward = JSON.parse(rewardRaw);
    const lastClaimDate = new Date(reward.claimedAt);
    const nextClaimDate = new Date(reward.canClaimAt);

    if (now < nextClaimDate) {
      console.warn('Reward not yet available. Wait until next claim time.');
      return false;
    }

    const isStreak = isNextDay(reward.claimedAt);

    const updatedReward = {
      claimedAt: nowStr,
      canClaimAt,
      level: isStreak ? reward.level + 1 : 1,
    };

    localStorage.setItem('reward', JSON.stringify(updatedReward));
    console.log('Reward claimed!');
    return true;
  }

  // First-time claim
  const newReward = {
    claimedAt: nowStr,
    canClaimAt,
    level: 1,
  };
  localStorage.setItem('reward', JSON.stringify(newReward));
  console.log('First reward claimed!');
  return true;
}

export function getReward(): {
  claimedAt: string;
  level: number;
  canClaimAt: string;
} | null {
  const rewardRaw = localStorage.getItem('reward');
  return rewardRaw ? JSON.parse(rewardRaw) : null;
}

export function deleteReward(): void {
  localStorage.removeItem('reward');
}