const HISTORY_KEY = 'history';
const MAX_HISTORY = 30;

export function getHistory(): number[] {
    if (typeof window === "undefined") return [];
    const history = localStorage.getItem("history");
    return history ? JSON.parse(history) : [];
  }
  
  export function addToHistory(multiplier: number): void {
    if (typeof window === "undefined") return;
    const history = getHistory();
    history.push(multiplier);
    localStorage.setItem("history", JSON.stringify(history));
  }
  
  export function clearHistory(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("history");
  }
