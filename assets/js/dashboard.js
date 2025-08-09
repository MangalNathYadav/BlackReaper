// dashboard.js - Specific functionality for the dashboard page

// DOM Elements
const taskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const newQuoteButton = document.getElementById('new-quote');
const dailyQuote = document.getElementById('daily-quote');
const userNickname = document.getElementById('user-nickname');
const rcLevel = document.getElementById('rc-level');
const rcMeterFill = document.querySelector('.rc-meter-fill');
const corruptedInput = document.getElementById('corrupted-input');
const generateCorruptionButton = document.getElementById('generate-corruption');
const corruptedText = document.getElementById('corrupted-text');
const journalPreviews = document.getElementById('journal-previews');

// Sample quotes for demo purposes (would come from Firebase in production)
const kanekiQuotes = [
    "The world is not wrong. I am.",
    "Never trust anyone too much, remember the devil was once an angel.",
    "I'm not the protagonist of a novel or anything... I'm a college student who likes to read.",
    "All of the liabilities in this world are due to the inadequacies of the person involved.",
    "If an angelic being fell from the sky and tried to live in this world of ours, they would be no different from a devil.",
    "Why should I apologize for being a monster? Has anyone ever apologized for turning me into one?",
    "Human relationships are chemical reactions. If you have a reaction then you can never return back to your previous state of being.",
    "The pain in my head is proof that I am alive.",
    "I'm not going to protect you by being your shield or armor, but I'll be the dagger hidden below your pillow."
];

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initializing...');
    initializeDashboard();
});

// Initialize dashboard components
function initializeDashboard() {
    loadUserData();
    loadTasks();
    loadRecentJournals();
    setupDashboardEventListeners();
    
    // Set initial RC meter value
    updateRCMeter(getUserRCLevel());
    
    // Set random quote
    updateDailyQuote();
}

// Load user data from Firebase
function loadUserData() {
    // This would fetch from Firebase in production
    // For demo, we'll use placeholder data
    userNickname.textContent = localStorage.getItem('userNickname') || 'Kaneki';
}

// Load tasks from localStorage or Firebase
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Clear existing task list
    taskList.innerHTML = '';
    
    // Add each task to the UI
    tasks.forEach(task => {
        addTaskToUI(task.text, task.completed);
    });
}

// Add a new task
function addNewTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        // Add to UI
        addTaskToUI(taskText, false);
        
        // Add to storage
        saveTask(taskText, false);
        
        // Clear input
        taskInput.value = '';
    }
}

// Add task to the UI
function addTaskToUI(taskText, isCompleted) {
    const li = document.createElement('li');
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    checkbox.addEventListener('change', function() {
        updateTaskStatus(this.parentNode.textContent.trim(), this.checked);
    });
    
    // Create task text
    const span = document.createElement('span');
    span.textContent = taskText;
    if (isCompleted) {
        span.style.textDecoration = 'line-through';
    }
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.classList.add('delete-task');
    deleteBtn.addEventListener('click', function() {
        deleteTask(this.parentNode);
    });
    
    // Append elements to list item
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    
    // Append to task list
    taskList.appendChild(li);
}

// Save task to localStorage or Firebase
function saveTask(taskText, isCompleted) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    tasks.push({
        text: taskText,
        completed: isCompleted
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update task completion status
function updateTaskStatus(taskText, isCompleted) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const updatedTasks = tasks.map(task => {
        if (task.text === taskText) {
            task.completed = isCompleted;
        }
        return task;
    });
    
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // If task is completed, update RC level
    if (isCompleted) {
        increaseRCLevel();
    } else {
        decreaseRCLevel();
    }
    
    // Update tasks in UI
    loadTasks();
}

// Delete a task
function deleteTask(taskElement) {
    const taskText = taskElement.querySelector('span').textContent;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Remove from UI
    taskElement.remove();
}

// Update daily quote
function updateDailyQuote() {
    const randomIndex = Math.floor(Math.random() * kanekiQuotes.length);
    dailyQuote.textContent = kanekiQuotes[randomIndex];
    
    // Add typing animation
    dailyQuote.classList.add('typing-effect');
    
    setTimeout(() => {
        dailyQuote.classList.remove('typing-effect');
    }, 1000);
}

// Get user RC cell level
function getUserRCLevel() {
    // This would be calculated based on user stats in production
    // For demo, we'll use a placeholder value or localStorage
    return parseInt(localStorage.getItem('rcLevel')) || 74;
}

// Update RC meter in UI
function updateRCMeter(level) {
    // Ensure level is between 0 and 100
    level = Math.max(0, Math.min(100, level));
    
    // Update text
    rcLevel.textContent = level;
    
    // Update meter width
    rcMeterFill.style.width = `${level}%`;
    
    // Save to localStorage
    localStorage.setItem('rcLevel', level);
    
    // Change color based on level
    if (level < 30) {
        rcMeterFill.style.backgroundColor = '#4CAF50'; // Green
    } else if (level < 70) {
        rcMeterFill.style.backgroundColor = '#FFC107'; // Yellow
    } else {
        rcMeterFill.style.backgroundColor = '#e10000'; // Red
    }
}

// Increase RC level
function increaseRCLevel() {
    const currentLevel = getUserRCLevel();
    const newLevel = currentLevel + 2; // Increment by 2 for each completed task
    
    updateRCMeter(newLevel);
}

// Decrease RC level
function decreaseRCLevel() {
    const currentLevel = getUserRCLevel();
    const newLevel = currentLevel - 2; // Decrement by 2 for each uncompleted task
    
    updateRCMeter(newLevel);
}

// Generate corrupted text
function generateCorruptedText() {
    const input = corruptedInput.value.trim();
    
    if (input) {
        const corrupted = corruptText(input);
        corruptedText.textContent = corrupted;
        
        // Save to localStorage as a journal preview
        saveCorruptedThought(corrupted);
        
        // Apply glitch effect
        BlackReaper.applyGlitchEffect();
    }
}

// Corrupt text with random characters and formatting
function corruptText(text) {
    const glitchChars = '!@#$%^&*()_+-={}[]|:;"<>,.?/~`';
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        // 80% chance to keep the original character
        if (Math.random() < 0.8) {
            result += text[i];
        } else {
            // 10% chance for a random glitch character
            if (Math.random() < 0.5) {
                result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } 
            // 10% chance for uppercase version if it's a letter
            else if (/[a-zA-Z]/.test(text[i])) {
                result += text[i].toUpperCase();
            } 
            // Otherwise keep original
            else {
                result += text[i];
            }
        }
    }
    
    return result;
}

// Save corrupted thought as journal preview
function saveCorruptedThought(text) {
    const previews = JSON.parse(localStorage.getItem('journalPreviews')) || [];
    
    previews.unshift({
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        date: new Date().toISOString(),
        mood: 'corrupted'
    });
    
    // Keep only the 5 most recent previews
    if (previews.length > 5) {
        previews.pop();
    }
    
    localStorage.setItem('journalPreviews', JSON.stringify(previews));
    
    // Update previews in UI
    loadRecentJournals();
}

// Load recent journal entries
function loadRecentJournals() {
    if (!journalPreviews) return;
    
    const previews = JSON.parse(localStorage.getItem('journalPreviews')) || [];
    
    // Clear existing previews
    journalPreviews.innerHTML = '';
    
    if (previews.length === 0) {
        journalPreviews.innerHTML = '<p class="no-entries">No journal entries yet.</p>';
        return;
    }
    
    // Add each preview to the UI
    previews.forEach(preview => {
        const div = document.createElement('div');
        div.className = 'journal-preview';
        
        const date = new Date(preview.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        div.innerHTML = `
            <div class="preview-header">
                <span class="preview-date">${formattedDate}</span>
                <span class="preview-mood ${preview.mood}">${preview.mood}</span>
            </div>
            <div class="preview-content">
                <p>${preview.text}</p>
            </div>
        `;
        
        journalPreviews.appendChild(div);
    });
}

// Setup event listeners specific to the dashboard
function setupDashboardEventListeners() {
    // Add task button
    if (addTaskButton) {
        addTaskButton.addEventListener('click', addNewTask);
    }
    
    // New quote button
    if (newQuoteButton) {
        newQuoteButton.addEventListener('click', updateDailyQuote);
    }
    
    // Generate corrupted text button
    if (generateCorruptionButton) {
        generateCorruptionButton.addEventListener('click', generateCorruptedText);
    }
    
    // Add task on Enter key press
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewTask();
            }
        });
    }
}
