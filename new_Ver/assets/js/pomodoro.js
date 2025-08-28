// Pomodoro Timer JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Initialize pomodoro timer if we're on the dashboard page
  if (document.getElementById('pomodoro-container')) {
    initPomodoroTimer();
  }
});

function initPomodoroTimer() {
  // Timer elements
  const minutesDisplay = document.getElementById('timer-minutes');
  const secondsDisplay = document.getElementById('timer-seconds');
  const startButton = document.getElementById('timer-start');
  const pauseButton = document.getElementById('timer-pause');
  const resetButton = document.getElementById('timer-reset');
  const workDurationSelect = document.getElementById('work-duration');
  const breakDurationSelect = document.getElementById('break-duration');
  const pomodoroHistory = document.getElementById('pomodoro-history');
  const endButton = document.getElementById('timer-end');
  // Central RC calculation engine
  async function awardRC(userId, amount, type, refId) {
    const rcRef = firebase.database().ref(`users/${userId}/rcCells`);
    let prev = 0;
    await rcRef.transaction(rc => {
      prev = rc || 0;
      return prev + amount;
    });
    await firebase.database().ref(`transactions/${userId}`).push({
      amount,
      type,
      timestamp: Date.now(),
      previousBalance: prev,
      newBalance: prev + amount,
      pomodoroId: type === 'pomodoro_completion' ? refId : undefined
    });
  }
  
  // Get current user
  let currentUserId = null;
  let currentSessionId = null;
  let sessionStartTime = null;
  
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      currentUserId = user.uid;
      loadPomodoroHistory(currentUserId);
    }
  });
  
  // Load pomodoro history
  function loadPomodoroHistory(userId) {
    const historyRef = firebase.database().ref(`pomodoros/${userId}`);
    historyRef.orderByChild('startTime').limitToLast(20).on('value', (snapshot) => {
      if (pomodoroHistory) {
        pomodoroHistory.innerHTML = '';
        const sessions = [];
        snapshot.forEach(child => {
          sessions.unshift(child.val());
        });
        sessions.forEach((session, index) => {
          const duration = session.endTime && session.startTime ? Math.round((session.endTime - session.startTime) / 60000) : Math.round((session.duration || 0) / 60);
          const sessionElement = document.createElement('div');
          sessionElement.className = 'pomodoro-session';
          sessionElement.innerHTML = `
            <span class="session-number">Session ${sessions.length - index}</span>
            <span class="session-type">${session.type === 'break' ? 'Break' : 'Work'}</span>
            <span class="session-duration">${duration} minutes</span>
            <span class="session-status">${session.status || 'unknown'}</span>
            <span class="session-date">${session.startTime ? new Date(session.startTime).toLocaleString() : ''}</span>
          `;
          pomodoroHistory.appendChild(sessionElement);
        });
      }
    });
  }
  
  // Timer variables
  let timer;
  let isRunning = false;
  let isPaused = false;
  let isWorkSession = true;
  let timeLeft = parseInt(workDurationSelect.value) * 60; // in seconds
  let originalTime = timeLeft;
  
  // Update the timer display
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
  }
  
  // Start the timer
  function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    isPaused = false;
    
    if (!sessionStartTime) {
      sessionStartTime = Date.now();
      // Create new session in Firebase
      const sessionRef = firebase.database().ref(`pomodoros/${currentUserId}`).push();
      currentSessionId = sessionRef.key;
      sessionRef.set({
        startTime: sessionStartTime,
        duration: timeLeft,
        status: 'active',
        type: isWorkSession ? 'work' : 'break'
      });
    }
    
    // Show pause button, hide start button
    startButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
    
    // Disable duration selects during a session
    workDurationSelect.disabled = true;
    breakDurationSelect.disabled = true;
    
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      
      // Update session progress in Firebase
      if (currentSessionId && timeLeft % 15 === 0) { // Update every 15 seconds
        firebase.database().ref(`pomodoros/${currentUserId}/${currentSessionId}`).update({
          timeLeft: timeLeft,
          lastUpdated: Date.now()
        });
      }
      
      if (timeLeft <= 0) {
        completeSession();
      }
    }, 1000);
  }
  
  // Pause the timer
  async function pauseTimer() {
    if (!isRunning || isPaused) return;
    
    clearInterval(timer);
    isPaused = true;
    isRunning = false;
    
    // Update session in Firebase
    if (currentSessionId) {
      await firebase.database().ref(`pomodoros/${currentUserId}/${currentSessionId}`).update({
        status: 'paused',
        timeLeft: timeLeft,
        pauseTime: Date.now()
      });
    }
    
    // Show start button, hide pause button
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Resume';
  }
  
  // Reset the timer
  async function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    
    // If there's an active session, mark it as cancelled
    if (currentSessionId) {
      await firebase.database().ref(`pomodoros/${currentUserId}/${currentSessionId}`).update({
        status: 'cancelled',
        endTime: Date.now(),
        timeLeft: timeLeft
      });
      currentSessionId = null;
      sessionStartTime = null;
    }
    
    // Set time based on current mode
    timeLeft = isWorkSession 
      ? parseInt(workDurationSelect?.value || 25) * 60 
      : parseInt(breakDurationSelect?.value || 5) * 60;
    originalTime = timeLeft;
    
    // Update display
    updateDisplay();
    
    // Show start button, hide pause button
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Start';
    
    // Enable duration selects
    workDurationSelect.disabled = false;
    breakDurationSelect.disabled = false;
  }
  
  // Unified completeSession function
  async function completeSession(manual = false) {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    let sessionType = isWorkSession ? 'work' : 'break';
    let sessionDuration = originalTime;
    let rcCellsReward = isWorkSession ? Math.floor(originalTime / 60) : 0;
    let sessionStatus = manual ? 'completed' : 'completed';
    let now = Date.now();
    if (currentSessionId) {
      await firebase.database().ref(`pomodoros/${currentUserId}/${currentSessionId}`).update({
        status: sessionStatus,
        endTime: now,
        timeLeft: 0
      });
      if (isWorkSession && currentUserId) {
        // Update user stats
        const userStatsRef = firebase.database().ref(`users/${currentUserId}/stats`);
        await userStatsRef.transaction(stats => {
          stats = stats || {};
          stats.pomodorosCompleted = (stats.pomodorosCompleted || 0) + 1;
          return stats;
        });
        // Award RC via engine
        await awardRC(currentUserId, rcCellsReward, 'pomodoro_completion', currentSessionId);
        // Update RC display
        updateRCDisplay((await userStatsRef.once('value')).val()?.rcCells || 0);
      }
      currentSessionId = null;
      sessionStartTime = null;
    }
    // Play completion sound and show notification
    playCompletionSound();
    showNotification(
      sessionType === 'work' ? 'Work session completed!' : 'Break completed!',
      sessionType === 'work' ? `You earned ${rcCellsReward} RC cells.` : 'Time to get back to work.'
    );
    // Switch session type and reset
    isWorkSession = !isWorkSession;
    if (isWorkSession) {
      document.querySelector('.pomodoro-timer').classList.remove('break-mode');
      timeLeft = parseInt(workDurationSelect.value) * 60;
      originalTime = timeLeft;
    } else {
      document.querySelector('.pomodoro-timer').classList.add('break-mode');
      timeLeft = parseInt(breakDurationSelect.value) * 60;
      originalTime = timeLeft;
    }
    updateDisplay();
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Start';
    workDurationSelect.disabled = false;
    breakDurationSelect.disabled = false;
  }
  function bindEndSessionHandler() {
    if (!endButton) return;
    endButton.disabled = false;
    endButton.style.display = 'inline-block';
    endButton.removeEventListener('click', endSessionHandler); // Remove previous handler if any
    endButton.addEventListener('click', endSessionHandler);
  }

  async function endSessionHandler() {
    console.log('[Pomodoro] End Session button clicked. isRunning:', isRunning, 'currentSessionId:', currentSessionId);
    // End session regardless of running state
    if (currentSessionId) {
      // Mark session as completed
      await firebase.database().ref(`pomodoros/${currentUserId}/${currentSessionId}`).update({
        status: 'completed',
        endTime: Date.now(),
        timeLeft: timeLeft
      });
      if (isWorkSession && currentUserId) {
        // Award RC only for work session
        const userStatsRef = firebase.database().ref(`users/${currentUserId}/stats`);
        await userStatsRef.transaction(stats => {
          stats = stats || {};
          stats.pomodorosCompleted = (stats.pomodorosCompleted || 0) + 1;
          return stats;
        });
        await awardRC(currentUserId, Math.floor(originalTime / 60), 'pomodoro_completion', currentSessionId);
        updateRCDisplay((await userStatsRef.once('value')).val()?.rcCells || 0);
      }
      currentSessionId = null;
      sessionStartTime = null;
      playCompletionSound();
      showNotification('Session ended', isWorkSession ? 'Work session ended early.' : 'Break ended early.');
    } else {
      showNotification('No active session', 'Start a session before ending it.');
    }
    // Reset timer and UI
    isRunning = false;
    isPaused = false;
    timeLeft = isWorkSession ? parseInt(workDurationSelect.value) * 60 : parseInt(breakDurationSelect.value) * 60;
    originalTime = timeLeft;
    updateDisplay();
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Start';
    workDurationSelect.disabled = false;
    breakDurationSelect.disabled = false;
  }

  bindEndSessionHandler();

  // Fallback: re-bind handler if button is replaced in DOM
  const observer = new MutationObserver(() => {
    const btn = document.getElementById('timer-end');
    if (btn && btn !== endButton) {
      bindEndSessionHandler();
    }
  });
  observer.observe(document.getElementById('pomodoro-container'), { childList: true, subtree: true });
  
  // Play completion sound
  function playCompletionSound() {
    const audio = new Audio('assets/audio/complete.mp3');
    audio.play().catch(error => {
      console.log('Audio play failed:', error);
      // Audio may fail if user hasn't interacted with the page yet, that's ok
    });
  }
  
  // Show notification
  function showNotification(title, message) {
    // Check if browser supports notifications
    if ('Notification' in window) {
      // Request permission if needed
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body: message });
          }
        });
      }
    }
    
    // Fallback alert if notifications aren't available or permitted
    console.log(`${title}: ${message}`);
  }
  
  // Update RC cell display (this function is defined in dashboard.js, but we duplicate it here for modularity)
  function updateRCDisplay(rcCells) {
    // Update counter
    const rcCountElement = document.getElementById('rc-cell-count');
    if (rcCountElement) {
      rcCountElement.textContent = rcCells;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('rc-progress-bar');
    const progressText = document.getElementById('rc-progress-text');
    const nextLevelElement = document.getElementById('next-level');
    
    if (progressBar && progressText && nextLevelElement) {
      // Calculate progress to next level (each level requires 1000 RC cells)
      const currentLevel = Math.floor(rcCells / 1000);
      const nextLevel = currentLevel + 1;
      const progress = (rcCells % 1000) / 1000 * 100;
      
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${rcCells % 1000} / 1000`;
      nextLevelElement.textContent = nextLevel;
    }
  }
  
  // Add event listeners
  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  resetButton.addEventListener('click', resetTimer);
  
  workDurationSelect.addEventListener('change', () => {
    if (!isRunning && isWorkSession) {
      timeLeft = parseInt(workDurationSelect.value) * 60;
      originalTime = timeLeft;
      updateDisplay();
    }
  });
  
  breakDurationSelect.addEventListener('change', () => {
    if (!isRunning && !isWorkSession) {
      timeLeft = parseInt(breakDurationSelect.value) * 60;
      originalTime = timeLeft;
      updateDisplay();
    }
  });
  
  // Initialize display
  updateDisplay();
}
