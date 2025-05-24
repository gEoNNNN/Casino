
// Store a balance value with 2 decimal places
export function storeBalance(balance: number) {
  const roundedBalance = parseFloat(balance.toFixed(2)); // Round to 2 decimal places
  localStorage.setItem('balance', JSON.stringify(roundedBalance));
  addBalancePoint(roundedBalance); // <-- Add this line
}

// Update the balance value with 2 decimal places
export function updateBalance(newBalance: number) {
  if (localStorage.getItem('balance') !== null) {
    const roundedBalance = parseFloat(newBalance.toFixed(2)); // Round to 2 decimal places
    localStorage.setItem('balance', JSON.stringify(roundedBalance));
    addBalancePoint(roundedBalance); // <-- Add this line
  } 
}

// Delete the balance value
export function deleteBalance() {
  localStorage.removeItem('balance');
}

// Get the balance value with 2 decimal places
export function getBalance() {
  const balance = localStorage.getItem('balance');
  return balance ? parseFloat(JSON.parse(balance).toFixed(2)) : null; // Ensure balance has 2 decimal places when retrieved
}

const BALANCE_HISTORY_KEY = "balanceHistory";

export function addBalancePoint(balance: number) {
  const now = new Date().toISOString();
  let history: { time: string; balance: number }[] = [];
  try {
    history = JSON.parse(localStorage.getItem(BALANCE_HISTORY_KEY) || "[]");
  } catch {}
  history.push({ time: now, balance });
  localStorage.setItem(BALANCE_HISTORY_KEY, JSON.stringify(history));
}

export function getBalanceHistory() {
  try {
    return JSON.parse(localStorage.getItem(BALANCE_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function resetBalanceHistory() {
  localStorage.removeItem(BALANCE_HISTORY_KEY);
}
