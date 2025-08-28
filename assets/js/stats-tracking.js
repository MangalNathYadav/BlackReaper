// Stats tracking module

// Initialize stats tracking
async function initializeStatsTracking(userId) {
  // Set up real-time listener for user stats
  const statsRef = firebase.database().ref(`users/${userId}/stats`);
  statsRef.on('value', (snapshot) => {
    const stats = snapshot.val();
    if (stats) {
      updateStatsDisplay(stats);
    }
  });
}

// Update stats display in UI
function updateStatsDisplay(stats) {
  // Update tasks completed
  const tasksCompletedElement = document.getElementById('tasks-completed-count');
  if (tasksCompletedElement) {
    tasksCompletedElement.textContent = stats.tasksCompleted || 0;
  }
  
  // Update pomodoros completed
  const pomodorosCompletedElement = document.getElementById('pomodoros-completed-count');
  if (pomodorosCompletedElement) {
    pomodorosCompletedElement.textContent = stats.pomodorosCompleted || 0;
  }
  
  // Update battles stats if they exist
  const battlesWonElement = document.getElementById('battles-won-count');
  if (battlesWonElement) {
    battlesWonElement.textContent = stats.battlesWon || 0;
  }
  
  const battlesLostElement = document.getElementById('battles-lost-count');
  if (battlesLostElement) {
    battlesLostElement.textContent = stats.battlesLost || 0;
  }
  
  // Update journal entries count if it exists
  const journalEntriesElement = document.getElementById('journal-entries-count');
  if (journalEntriesElement) {
    journalEntriesElement.textContent = stats.journalEntries || 0;
  }
}

// Update user stats
async function updateUserStats(userId, statName, increment = 1) {
  try {
    const statsRef = firebase.database().ref(`users/${userId}/stats/${statName}`);
    
    // Get current value
    const snapshot = await statsRef.once('value');
    const currentValue = snapshot.val() || 0;
    
    // Update with increment
    await statsRef.set(currentValue + increment);
    
    return true;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return false;
  }
}

// Update RC Cells
async function updateRCCells(userId, amount) {
  try {
    const rcRef = firebase.database().ref(`users/${userId}/rcCells`);
    
    // Get current value
    const snapshot = await rcRef.once('value');
    const currentRCCells = snapshot.val() || 0;
    
    // Create transaction entry
    const transactionRef = firebase.database().ref(`transactions/${userId}`).push();
    await transactionRef.set({
      type: 'reward',
      amount: amount,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      previousBalance: currentRCCells,
      newBalance: currentRCCells + amount
    });
    
    // Update RC cells
    await rcRef.set(currentRCCells + amount);
    
    return true;
  } catch (error) {
    console.error('Error updating RC cells:', error);
    return false;
  }
}
