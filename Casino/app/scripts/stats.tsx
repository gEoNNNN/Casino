type GameName = "mines" | "bombdrop" | "findthe";

interface GameStats {
  wins: number;
  losses: number;
  moneyWon: number;
  moneyLost: number;
}

const STATS_KEY = "gameStats";

function getStats(): Record<GameName, GameStats> {
  if (typeof window === "undefined") return {
    mines: { wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 },
    bombdrop: { wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 },
    findthe: { wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 },
  };
  const raw = localStorage.getItem(STATS_KEY);
  if (!raw) {
    const initial = {
      mines: { wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 },
      bombdrop: { wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 },
      findthe: { wins: 0, losses: 0, moneyWon: 0, moneyLost: 0 },
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

function saveStats(stats: Record<GameName, GameStats>) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordWin(game: GameName, amount: number) {
  const stats = getStats();
  stats[game].wins += 1;
  stats[game].moneyWon += amount;
  saveStats(stats);
}

export function recordLoss(game: GameName, amount: number) {
  const stats = getStats();
  stats[game].losses += 1;
  stats[game].moneyLost += amount;
  saveStats(stats);
}

export function getGameStats(game: GameName): GameStats {
  return getStats()[game];
}

export function resetStats() {
  localStorage.removeItem(STATS_KEY);
}