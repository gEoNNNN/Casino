// Store a balance value with 2 decimal places
export function storeBalance(balance: number) {
  const roundedBalance = parseFloat(balance.toFixed(2)); // Round to 2 decimal places
  localStorage.setItem('balance', JSON.stringify(roundedBalance));
}

// Update the balance value with 2 decimal places
export function updateBalance(newBalance: number) {
  if (localStorage.getItem('balance') !== null) {
    const roundedBalance = parseFloat(newBalance.toFixed(2)); // Round to 2 decimal places
    localStorage.setItem('balance', JSON.stringify(roundedBalance));
  } else {
    console.warn('Balance does not exist. Use storeBalance to set it first.');
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
