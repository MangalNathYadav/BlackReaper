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
    
    // Show pause button, hide start button
    startButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
    
    // Disable duration selects during a session
    workDurationSelect.disabled = true;
    breakDurationSelect.disabled = true;
    
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      
      if (timeLeft <= 0) {
        completeSession();
      }
    }, 1000);
  }
  
  // Pause the timer
  function pauseTimer() {
    if (!isRunning || isPaused) return;
    
    clearInterval(timer);
    isPaused = true;
    isRunning = false;
    
    // Show start button, hide pause button
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Resume';
  }
  
  // Reset the timer
  function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    
    // Set time based on current mode
    timeLeft = isWorkSession 
      ? parseInt(workDurationSelect.value) * 60 
      : parseInt(breakDurationSelect.value) * 60;
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
  
  // Complete a session (work or break)
  async function completeSession() {
    clearInterval(timer);
    
    if (isWorkSession) {
      // Work session completed
      playCompletionSound();
      
      // Award RC cells if user is logged in
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          // Calculate RC cells based on duration (1 RC cell per minute)
          const rcCellsReward = Math.floor(originalTime / 60);
          
          // Record completed pomodoro in database
          await database.completePomodoro(user.uid, originalTime, rcCellsReward);
          
          // Show completion notification
          showNotification('Work session completed!', `You earned ${rcCellsReward} RC cells.`);
          
          // Update RC display
          const userProfile = await database.getUserProfile(user.uid);
          updateRCDisplay(userProfile.rcCells);
        } catch (error) {
          console.error('Error recording pomodoro:', error);
        }
      }
      
      // Switch to break mode
      isWorkSession = false;
      document.querySelector('.pomodoro-timer').classList.add('break-mode');
      
      // Set break time
      timeLeft = parseInt(breakDurationSelect.value) * 60;
      originalTime = timeLeft;
      
    } else {
      // Break completed
      playCompletionSound();
      showNotification('Break completed!', 'Time to get back to work.');
      
      // Switch to work mode
      isWorkSession = true;
      document.querySelector('.pomodoro-timer').classList.remove('break-mode');
      
      // Set work time
      timeLeft = parseInt(workDurationSelect.value) * 60;
      originalTime = timeLeft;
    }
    
    // Reset UI state
    isRunning = false;
    isPaused = false;
    updateDisplay();
    
    // Show start button, hide pause button
    pauseButton.style.display = 'none';
    startButton.style.display = 'inline-block';
    startButton.textContent = 'Start';
    
    // Enable duration selects
    workDurationSelect.disabled = false;
    breakDurationSelect.disabled = false;
  }
  
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
