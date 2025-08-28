/**
 * BlackReaper v2 - Journal System
 * Handles the journal functionality
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Require authentication for this page
  requireAuth().then(initJournalSystem).catch(error => {
    console.error('Authentication error:', error);
  });
});

// Journal system state
const journalState = {
  entries: {},
  currentMood: 'neutral',
  filter: 'all',
  sort: 'newest',
  isEditing: false,
  editingId: null
};

// Cache DOM elements
const elements = {};

/**
 * Initialize the journal system
 */
function initJournalSystem() {
  // Cache DOM elements
  elements.journalForm = document.getElementById('journal-form');
  elements.entryTitle = document.getElementById('entry-title');
  elements.entryContent = document.getElementById('entry-content');
  elements.moodOptions = document.querySelectorAll('.mood-option');
  elements.formMessage = document.querySelector('.form-message');
  elements.journalEntries = document.getElementById('journal-entries');
  elements.noEntries = document.getElementById('no-entries');
  elements.filterButtons = document.querySelectorAll('.filter-btn');
  elements.sortBtn = document.getElementById('sort-btn');
  elements.sortOptions = document.getElementById('sort-options');
  
  // Set up event listeners
  setupEventListeners();
  
  // Load journal entries
  loadJournalEntries();
  
  // Setup firebase state subscription for realtime updates
  setupStateSubscription();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Journal form submission
  elements.journalForm.addEventListener('submit', handleFormSubmit);
  
  // Mood selection
  elements.moodOptions.forEach(option => {
    option.addEventListener('click', () => {
      setMood(option.dataset.mood);
    });
  });
  
  // Filter buttons
  elements.filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      setFilter(button.dataset.filter);
    });
  });
  
  // Sort dropdown
  elements.sortBtn.addEventListener('click', () => {
    elements.sortOptions.classList.toggle('active');
  });
  
  // Sort options
  document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', () => {
      setSort(option.dataset.sort);
      elements.sortOptions.classList.remove('active');
    });
  });
  
  // Close sort dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.sort-dropdown')) {
      elements.sortOptions.classList.remove('active');
    }
  });
}

/**
 * Set up Firebase state subscription
 */
function setupStateSubscription() {
  // Subscribe to journal updates
  firebaseState.subscribe('journal-updated', (journalData) => {
    journalState.entries = journalData || {};
    renderJournalEntries();
  });
}

/**
 * Load journal entries from Firebase
 */
function loadJournalEntries() {
  const userId = auth.getCurrentUser().uid;
  
  // Get journal entries
  db.get(`users/${userId}/journal`).then(snapshot => {
    journalState.entries = snapshot.val() || {};
    renderJournalEntries();
  }).catch(error => {
    console.error('Error loading journal entries:', error);
    showFormMessage('Error loading journal entries', 'error');
  });
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const title = elements.entryTitle.value.trim();
  const content = elements.entryContent.value.trim();
  const mood = journalState.currentMood;
  
  if (!title || !content) {
    showFormMessage('Please fill in all fields', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = elements.journalForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;
  
  const userId = auth.getCurrentUser().uid;
  
  // Create entry data
  const entryData = {
    title,
    content,
    mood,
    createdAt: db.timestamp()
  };
  
  let savePromise;
  
  if (journalState.isEditing && journalState.editingId) {
    // Update existing entry
    savePromise = db.update(`users/${userId}/journal/${journalState.editingId}`, {
      ...entryData,
      updatedAt: db.timestamp()
    });
  } else {
    // Add new entry
    savePromise = firebaseBridge.addJournalEntry(userId, entryData);
  }
  
  savePromise
    .then(() => {
      // Reset form
      elements.journalForm.reset();
      setMood('neutral');
      
      // Reset editing state
      journalState.isEditing = false;
      journalState.editingId = null;
      
      // Update button text
      submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Entry';
      
      // Show success message
      showFormMessage('Journal entry saved successfully', 'success');
      
      // Refresh entries
      loadJournalEntries();
    })
    .catch(error => {
      console.error('Error saving journal entry:', error);
      showFormMessage('Error saving journal entry', 'error');
    })
    .finally(() => {
      // Restore button state
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    });
}

/**
 * Set mood
 * @param {string} mood - Mood to set
 */
function setMood(mood) {
  journalState.currentMood = mood;
  
  // Update UI
  elements.moodOptions.forEach(option => {
    if (option.dataset.mood === mood) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

/**
 * Set filter
 * @param {string} filter - Filter to set
 */
function setFilter(filter) {
  journalState.filter = filter;
  
  // Update UI
  elements.filterButtons.forEach(button => {
    if (button.dataset.filter === filter) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Re-render entries
  renderJournalEntries();
}

/**
 * Set sort
 * @param {string} sort - Sort to set
 */
function setSort(sort) {
  journalState.sort = sort;
  
  // Update UI
  elements.sortBtn.innerHTML = `<i class="fa-solid fa-sort"></i> Sort by: ${sort === 'newest' ? 'Newest' : 'Oldest'}`;
  
  // Re-render entries
  renderJournalEntries();
}

/**
 * Render journal entries
 */
function renderJournalEntries() {
  // Check if there are entries
  if (!journalState.entries || Object.keys(journalState.entries).length === 0) {
    elements.noEntries.style.display = 'block';
    elements.journalEntries.innerHTML = '';
    return;
  }
  
  elements.noEntries.style.display = 'none';
  
  // Convert entries object to array
  let entriesArray = Object.keys(journalState.entries).map(id => {
    return {
      id,
      ...journalState.entries[id]
    };
  });
  
  // Apply filter
  if (journalState.filter !== 'all') {
    entriesArray = entriesArray.filter(entry => entry.mood === journalState.filter);
  }
  
  // Apply sort
  entriesArray.sort((a, b) => {
    const dateA = a.createdAt;
    const dateB = b.createdAt;
    
    if (journalState.sort === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  
  // If after filtering, there are no entries
  if (entriesArray.length === 0) {
    elements.journalEntries.innerHTML = `
      <div class="no-entries">
        <i class="fa-solid fa-filter"></i>
        <h3>No entries match your filter</h3>
        <p>Try a different filter or create a new entry</p>
      </div>
    `;
    return;
  }
  
  // Render entries
  elements.journalEntries.innerHTML = entriesArray.map(entry => {
    const date = new Date(entry.createdAt);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const moodEmoji = getMoodEmoji(entry.mood);
    
    return `
      <div class="journal-entry" data-id="${entry.id}">
        <div class="entry-header">
          <div class="entry-title">${escapeHTML(entry.title)}</div>
          <div class="entry-date">${formattedDate}</div>
        </div>
        <div class="entry-mood mood-${entry.mood}">
          ${moodEmoji} ${capitalizeFirstLetter(entry.mood)}
        </div>
        <div class="entry-content">${escapeHTML(entry.content)}</div>
        <div class="entry-actions">
          <button class="entry-action-btn edit-btn" data-id="${entry.id}">
            <i class="fa-solid fa-edit"></i> Edit
          </button>
          <button class="entry-action-btn delete-btn" data-id="${entry.id}">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners for action buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
      editEntry(button.dataset.id);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      deleteEntry(button.dataset.id);
    });
  });
}

/**
 * Edit entry
 * @param {string} id - Entry ID
 */
function editEntry(id) {
  const entry = journalState.entries[id];
  
  if (!entry) {
    showFormMessage('Entry not found', 'error');
    return;
  }
  
  // Set form values
  elements.entryTitle.value = entry.title;
  elements.entryContent.value = entry.content;
  setMood(entry.mood);
  
  // Set editing state
  journalState.isEditing = true;
  journalState.editingId = id;
  
  // Update button text
  const submitBtn = elements.journalForm.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Update Entry';
  
  // Scroll to form
  elements.journalForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete entry
 * @param {string} id - Entry ID
 */
function deleteEntry(id) {
  if (!confirm('Are you sure you want to delete this entry?')) {
    return;
  }
  
  const userId = auth.getCurrentUser().uid;
  
  db.remove(`users/${userId}/journal/${id}`)
    .then(() => {
      showFormMessage('Journal entry deleted', 'success');
      
      // If we were editing the deleted entry, reset the form
      if (journalState.isEditing && journalState.editingId === id) {
        elements.journalForm.reset();
        setMood('neutral');
        journalState.isEditing = false;
        journalState.editingId = null;
        
        const submitBtn = elements.journalForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Entry';
      }
      
      // Refresh entries
      delete journalState.entries[id];
      renderJournalEntries();
    })
    .catch(error => {
      console.error('Error deleting journal entry:', error);
      showFormMessage('Error deleting journal entry', 'error');
    });
}

/**
 * Show form message
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error)
 */
function showFormMessage(message, type) {
  elements.formMessage.textContent = message;
  elements.formMessage.className = 'form-message';
  elements.formMessage.classList.add(type);
  
  setTimeout(() => {
    elements.formMessage.textContent = '';
    elements.formMessage.className = 'form-message';
  }, 3000);
}

/**
 * Get mood emoji
 * @param {string} mood - Mood
 * @returns {string} Emoji
 */
function getMoodEmoji(mood) {
  const emojis = {
    excited: '😄',
    happy: '😊',
    neutral: '😐',
    sad: '😔',
    angry: '😠'
  };
  
  return emojis[mood] || '😐';
}

/**
 * Capitalize first letter
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Escape HTML
 * @param {string} unsafe - Unsafe string
 * @returns {string} Safe string
 */
function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
