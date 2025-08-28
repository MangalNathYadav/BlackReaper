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
    
    // Load and set up tasks with real-time sync
    setupTasksRealtime(user.uid);
    
    // Set up task form with real-time updates
    setupTaskForm(user.uid);
    
    // Load random quote
    loadRandomQuote();
    
    // Set up pomodoro system with tracking
    setupPomodoroSystem(user.uid);
    
    // Apply theme from user profile if available and set up theme sync
    if (userProfile.mode) {
      applyTheme(userProfile.mode);
    }
    setupThemeSync(user.uid);
    
    // Setup real-time listener for user profile
    setupProfileListener(user.uid);
    
    // Initialize stats tracking
    initializeStatsTracking(user.uid);
    
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

// Set up real-time tasks management
function setupTasksRealtime(userId) {
  const tasksRef = firebase.database().ref(`tasks/${userId}`);
  const taskList = document.getElementById('task-list');
  
  // Clear existing tasks
  if (taskList) {
    taskList.innerHTML = '';
  }
  
  // Listen for tasks being added
  tasksRef.on('child_added', (snapshot) => {
    const task = snapshot.val();
    const taskId = snapshot.key;
    addTaskToUI(taskId, task);
  });
  
  // Listen for tasks being changed
  tasksRef.on('child_changed', (snapshot) => {
    const task = snapshot.val();
    const taskId = snapshot.key;
    updateTaskInUI(taskId, task);
  });
  
  // Listen for tasks being removed
  tasksRef.on('child_removed', (snapshot) => {
    const taskId = snapshot.key;
    removeTaskFromUI(taskId);
  });
  
  // Set up task form
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.onsubmit = async (e) => {
      e.preventDefault();
      const taskInput = document.getElementById('task-input');
      const taskText = taskInput.value.trim();
      
      if (taskText) {
        // Create new task in Firebase
        const newTaskRef = tasksRef.push();
        await newTaskRef.set({
          text: taskText,
          completed: false,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Clear input
        taskInput.value = '';
      }
    };
  }
}

// Add task to UI
function addTaskToUI(taskId, task) {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  const taskElement = document.createElement('div');
  taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
  taskElement.id = `task-${taskId}`;
  
  taskElement.innerHTML = `
    <div class="task-content">
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <span class="task-text">${task.text}</span>
    </div>
    <div class="task-actions">
      <button class="edit-task" title="Edit task"><i class="fas fa-edit"></i></button>
      <button class="delete-task" title="Delete task"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  // Setup event listeners
  const checkbox = taskElement.querySelector('input[type="checkbox"]');
  const editBtn = taskElement.querySelector('.edit-task');
  const deleteBtn = taskElement.querySelector('.delete-task');
  const textSpan = taskElement.querySelector('.task-text');
  
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
      taskId: type === 'task_completion' ? refId : undefined
    });
  }

  // Handle completion toggle
  checkbox.addEventListener('change', async () => {
    const completed = checkbox.checked;
    await firebase.database().ref(`tasks/${firebase.auth().currentUser.uid}/${taskId}`).update({
      completed,
      completedAt: completed ? firebase.database.ServerValue.TIMESTAMP : null
    });
    if (completed) {
      // Update user stats and award RC via engine
      const userRef = firebase.database().ref(`users/${firebase.auth().currentUser.uid}/stats`);
      await userRef.transaction(stats => {
        stats = stats || {};
        stats.tasksCompleted = (stats.tasksCompleted || 0) + 1;
        return stats;
      });
      await awardRC(firebase.auth().currentUser.uid, 50, 'task_completion', taskId);
    }
  });
  
  // Handle edit
  editBtn.addEventListener('click', () => {
    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim() !== '') {
      firebase.database().ref(`tasks/${firebase.auth().currentUser.uid}/${taskId}`).update({
        text: newText.trim()
      });
    }
  });
  
  // Handle delete
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this task?')) {
      firebase.database().ref(`tasks/${firebase.auth().currentUser.uid}/${taskId}`).remove();
    }
  });
  
  taskList.appendChild(taskElement);
}

// Update task in UI
function updateTaskInUI(taskId, task) {
  const taskElement = document.getElementById(`task-${taskId}`);
  if (taskElement) {
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskElement.querySelector('.task-text').textContent = task.text;
    taskElement.querySelector('input[type="checkbox"]').checked = task.completed;
  }
}

// Remove task from UI
function removeTaskFromUI(taskId) {
  const taskElement = document.getElementById(`task-${taskId}`);
  if (taskElement) {
    taskElement.remove();
  }
}
  
  // Listen for tasks being changed
  tasksRef.on('child_changed', (snapshot) => {
    const task = snapshot.val();
    const taskId = snapshot.key;
    updateTaskInUI(taskId, task);
  });
  
  // Listen for tasks being removed
  tasksRef.on('child_removed', (snapshot) => {
    const taskId = snapshot.key;
    removeTaskFromUI(taskId);
  });


// Add task to UI
function addTaskToUI(taskId, task) {
  const taskList = document.getElementById('task-list');
  const taskItem = document.createElement('div');
  taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
  taskItem.id = `task-${taskId}`;
  
  taskItem.innerHTML = `
    <input type="checkbox" ${task.completed ? 'checked' : ''}>
    <span class="task-text">${task.text}</span>
    <button class="delete-task"><i class="fas fa-trash"></i></button>
  `;
  
  // Set up event listeners for the task item
  setupTaskItemListeners(taskItem, taskId);
  
  taskList.appendChild(taskItem);
}

// Setup task item event listeners
function setupTaskItemListeners(taskItem, taskId) {
  const checkbox = taskItem.querySelector('input[type="checkbox"]');
  const deleteBtn = taskItem.querySelector('.delete-task');
  const userId = firebase.auth().currentUser.uid;
  
  // Handle task completion
  checkbox.addEventListener('change', async () => {
    const completed = checkbox.checked;
    await firebase.database().ref(`tasks/${userId}/${taskId}`).update({
      completed,
      completedAt: completed ? Date.now() : null
    });
    
    // Update stats if task is completed
    if (completed) {
      await updateUserStats(userId, 'tasksCompleted', 1);
      await updateRCCells(userId, 50); // Award 50 RC cells for completing a task
    }
  });
  
  // Handle task deletion
  deleteBtn.addEventListener('click', async () => {
    await firebase.database().ref(`tasks/${userId}/${taskId}`).remove();
  });
}

// Setup Pomodoro System with tracking
function setupPomodoroSystem(userId) {
  const pomodoroBtn = document.getElementById('pomodoro-btn');
  if (!pomodoroBtn) return;
  
  pomodoroBtn.addEventListener('click', () => {
    startPomodoro(userId);
  });
}

// Start Pomodoro session
async function startPomodoro(userId) {
  // Start 25-minute timer
  const pomodoroLength = 25 * 60 * 1000; // 25 minutes in milliseconds
  const startTime = Date.now();
  
  // Create pomodoro session in database
  const pomodoroRef = firebase.database().ref(`pomodoros/${userId}`).push();
  await pomodoroRef.set({
    startTime,
    expectedEndTime: startTime + pomodoroLength,
    status: 'active'
  });
  
  // Set timer
  const timer = setTimeout(async () => {
    // Update pomodoro session
    await pomodoroRef.update({
      status: 'completed',
      actualEndTime: Date.now()
    });
    
    // Update user stats
    await updateUserStats(userId, 'pomodorosCompleted', 1);
    await updateRCCells(userId, 100); // Award 100 RC cells for completing a pomodoro
    
    alert('Pomodoro session completed! Take a break.');
  }, pomodoroLength);
  
  // Store timer reference for cleanup
  pomodoroTimers[pomodoroRef.key] = timer;
}

// Update RC cell count display
// Real-time RC cell progress bar and count update
function updateRCDisplay() {
  const rcCountElement = document.getElementById('rc-cell-count');
  const progressBar = document.getElementById('rc-progress-bar');
  const currentRC = document.getElementById('current-rc');
  const currentLevel = document.getElementById('current-level');
  const targetRC = document.getElementById('target-rc');

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const rcRef = firebase.database().ref(`users/${user.uid}/rcCells`);
      rcRef.on('value', snapshot => {
        const rc = snapshot.val() || 0;
        if (rcCountElement) rcCountElement.textContent = rc;
        if (currentRC) currentRC.textContent = rc;
        if (progressBar) {
          const level = Math.floor(rc / 1000) + 1;
          const rcForNextLevel = level * 1000;
          const progress = ((rc % 1000) / 1000) * 100;
          progressBar.style.width = `${progress}%`;
          if (currentLevel) currentLevel.textContent = level;
          if (targetRC) targetRC.textContent = rcForNextLevel;
        }
      });
    }
  });
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
