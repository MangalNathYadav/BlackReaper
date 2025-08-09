// Dashboard JavaScript file

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in before initializing dashboard
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      initDashboard(user);
    }
  });
});

// Initialize dashboard with user data
async function initDashboard(user) {
  try {
    // Fetch user profile from database
    const userProfile = await database.getUserProfile(user.uid);
    
    if (!userProfile) {
      console.error('User profile not found');
      return;
    }
    
    // Update user info
    updateUserInfo(userProfile);
    
    // Update RC cell count display
    updateRCDisplay(userProfile.rcCells);
    
    // Load tasks
    loadTasks(user.uid);
    
    // Set up task form
    setupTaskForm(user.uid);
    
    // Load random quote
    loadRandomQuote();
    
    // Set up pomodoro button
    setupPomodoroButton();
    
    // Apply theme from user profile if available
    if (userProfile.mode) {
      applyTheme(userProfile.mode);
    }
    
    // Setup real-time listener for user profile
    setupProfileListener(user.uid);
    
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
}

// Update user info in the dashboard
function updateUserInfo(userProfile) {
  // Update username
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    el.textContent = userProfile.displayName || 'Anonymous Ghoul';
  });
  
  // Update user stats if they exist
  if (userProfile.stats) {
    const tasksCompleted = document.getElementById('tasks-completed-count');
    if (tasksCompleted) {
      tasksCompleted.textContent = userProfile.stats.tasksCompleted || 0;
    }
    
    const pomodorosCompleted = document.getElementById('pomodoros-completed-count');
    if (pomodorosCompleted) {
      pomodorosCompleted.textContent = userProfile.stats.pomodorosCompleted || 0;
    }
  }
}

// Set up real-time listener for profile updates
function setupProfileListener(userId) {
  return database.listenForUserProfile(userId, userData => {
    // Update UI with new data
    updateUserInfo(userData);
    updateRCDisplay(userData.rcCells || 0);
  });
}

// Update RC cell count display
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

// Load tasks from database
async function loadTasks(userId) {
  try {
    const tasks = await database.getUserTasks(userId);
    
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) return;
    
    // Clear any example tasks
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
      // Show empty state
      tasksContainer.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
      return;
    }
    
    // Sort tasks (incomplete first, then by creation date)
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });
    
    // Add tasks to container
    tasks.forEach(task => {
      const taskElement = createTaskElement(task, userId);
      tasksContainer.appendChild(taskElement);
    });
    
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Create task element
function createTaskElement(task, userId) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'task-completed' : ''}`;
  li.dataset.id = task.id;
  
  const taskContent = document.createElement('div');
  taskContent.className = 'task-content';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.disabled = task.completed;
  
  const taskText = document.createElement('span');
  taskText.className = 'task-text';
  taskText.textContent = task.text;
  
  taskContent.appendChild(checkbox);
  taskContent.appendChild(taskText);
  
  const taskActions = document.createElement('div');
  taskActions.className = 'task-actions';
  
  if (!task.completed) {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn icon edit-task';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit Task';
    
    taskActions.appendChild(editBtn);
    
    // Edit task event listener
    editBtn.addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText && newText !== task.text) {
        database.updateTask(userId, task.id, { text: newText })
          .then(() => {
            taskText.textContent = newText;
          })
          .catch(error => console.error('Error updating task:', error));
      }
    });
  }
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn icon delete-task';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Delete Task';
  
  taskActions.appendChild(deleteBtn);
  
  // Add event listeners
  checkbox.addEventListener('change', () => {
    if (checkbox.checked && !task.completed) {
      // Mark task as completed and award RC cells
      database.completeTask(userId, task.id)
        .then(() => {
          li.classList.add('task-completed');
          checkbox.disabled = true;
          
          // Remove edit button
          const editBtn = taskActions.querySelector('.edit-task');
          if (editBtn) {
            taskActions.removeChild(editBtn);
          }
          
          // Update RC count (fetch from database to ensure accuracy)
          database.getUserProfile(userId)
            .then(profile => {
              updateRCDisplay(profile.rcCells);
            });
        })
        .catch(error => {
          console.error('Error completing task:', error);
          checkbox.checked = false;
        });
    }
  });
  
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this task?')) {
      database.deleteTask(userId, task.id)
        .then(() => {
          li.remove();
          
          // Check if list is empty now
          const tasksContainer = document.getElementById('tasks-container');
          if (tasksContainer && tasksContainer.children.length === 0) {
            tasksContainer.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
          }
        })
        .catch(error => console.error('Error deleting task:', error));
    }
  });
  
  li.appendChild(taskContent);
  li.appendChild(taskActions);
  
  return li;
}

// Set up task form
function setupTaskForm(userId) {
  const newTaskInput = document.getElementById('new-task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  
  if (!newTaskInput || !addTaskBtn) return;
  
  // Add task on button click
  addTaskBtn.addEventListener('click', () => {
    addNewTask(newTaskInput, userId);
  });
  
  // Add task on enter key press
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addNewTask(newTaskInput, userId);
    }
  });
}

// Add new task
async function addNewTask(inputElement, userId) {
  const taskText = inputElement.value.trim();
  
  if (!taskText) return;
  
  try {
    // Create task in database
    const task = await database.createTask(userId, {
      text: taskText,
      completed: false
    });
    
    // Add task to UI
    const tasksContainer = document.getElementById('tasks-container');
    
    // Remove empty state if it exists
    const emptyState = tasksContainer.querySelector('.empty-state');
    if (emptyState) {
      tasksContainer.removeChild(emptyState);
    }
    
    const taskElement = createTaskElement(task, userId);
    tasksContainer.prepend(taskElement); // Add to top of list
    
    // Clear input
    inputElement.value = '';
    
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

// Load random quote
function loadRandomQuote() {
  const quotes = [
    {
      text: "I'm not the protagonist of a novel or anything. I'm just a college student who likes to read, like you could find anywhere. But... if, for argument's sake, you were to write a story with me in the lead role, it would certainly be... a tragedy.",
      author: "Ken Kaneki"
    },
    {
      text: "If you were to write a story with me in the lead role, it would certainly be... a tragedy.",
      author: "Ken Kaneki"
    },
    {
      text: "All of the liabilities in this world are due to the inadequacies of the person involved.",
      author: "Arima Kishou"
    },
    {
      text: "The pain you feel today will be the strength you feel tomorrow.",
      author: "Ken Kaneki"
    },
    {
      text: "Never trust anyone too much, remember the devil was once an angel.",
      author: "Ken Kaneki"
    },
    {
      text: "You're wrong. It's not the world that's messed up; it's those of us in it. Yes, some ghouls walk a path that leaves sorrow in their wake, but just like humans, we can choose a different path altogether. We have a lot to learn, both your kind and mine. We need to stop fighting, and start talking.",
      author: "Ken Kaneki"
    },
    {
      text: "If an angelic being fell from the sky and tried to live in this world of ours, I think even they would commit many wrongs.",
      author: "Juuzou Suzuya"
    },
    {
      text: "Human relationships are chemical reactions. If you have a reaction then you can never return back to your previous state of being.",
      author: "Kaneki Ken"
    }
  ];
  
  // Get random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Update UI
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.querySelector('.quote-author');
  
  if (quoteText && quoteAuthor) {
    quoteText.textContent = randomQuote.text;
    quoteAuthor.textContent = `- ${randomQuote.author}`;
  }
}

// Set up pomodoro button
function setupPomodoroButton() {
  const pomodoroBtn = document.getElementById('pomodoro-btn');
  const pomodoroContainer = document.getElementById('pomodoro-container');
  
  if (pomodoroBtn && pomodoroContainer) {
    pomodoroBtn.addEventListener('click', () => {
      if (pomodoroContainer.style.display === 'none') {
        pomodoroContainer.style.display = 'block';
        pomodoroBtn.textContent = 'Hide Pomodoro';
      } else {
        pomodoroContainer.style.display = 'none';
        pomodoroBtn.textContent = 'Start Pomodoro';
      }
    });
  }
}

// Apply theme from user profile
function applyTheme(mode) {
  if (mode === 'human' && document.body.classList.contains('ghoul-mode')) {
    document.body.className = 'human-mode';
    
    // Update toggle button
    const toggleBtn = document.getElementById('mode-toggle-btn');
    if (toggleBtn) {
      toggleBtn.className = 'human-mode';
      toggleBtn.querySelector('.mode-label').textContent = 'Human';
    }
    
    // Save to localStorage
    localStorage.setItem('theme-mode', 'human');
    
  } else if (mode === 'ghoul' && document.body.classList.contains('human-mode')) {
    document.body.className = 'ghoul-mode';
    
    // Update toggle button
    const toggleBtn = document.getElementById('mode-toggle-btn');
    if (toggleBtn) {
      toggleBtn.className = 'ghoul-mode';
      toggleBtn.querySelector('.mode-label').textContent = 'Ghoul';
    }
    
    // Save to localStorage
    localStorage.setItem('theme-mode', 'ghoul');
  }
}
