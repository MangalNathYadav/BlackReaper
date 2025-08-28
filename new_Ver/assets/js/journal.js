// Journal JavaScript file

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in before initializing journal
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      initJournal(user);
    }
  });
  
  // Listen for theme changes to check journal visibility
  document.addEventListener('themeChanged', event => {
    const mode = event.detail.mode;
    checkJournalAccess(mode);
  });
});

// Initialize journal page
async function initJournal(user) {
  try {
    // Check if we're in the appropriate mode
    const currentMode = document.body.classList.contains('ghoul-mode') ? 'ghoul' : 'human';
    checkJournalAccess(currentMode);
    
    // Fetch journal entries if in ghoul mode
    if (currentMode === 'ghoul') {
      await loadJournalEntries(user.uid);
    }
    
    // Set up new entry functionality
    setupNewEntryForm(user.uid);
    
    // Set up switch to ghoul mode button
    const switchBtn = document.getElementById('switch-to-ghoul-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        // Toggle to ghoul mode
        document.body.className = 'ghoul-mode';
        
        // Update toggle button
        const toggleBtn = document.getElementById('mode-toggle-btn');
        if (toggleBtn) {
          toggleBtn.className = 'ghoul-mode';
          toggleBtn.querySelector('.mode-label').textContent = 'Ghoul';
        }
        
        // Save preference
        localStorage.setItem('theme-mode', 'ghoul');
        
        // Save to database if user is logged in
        if (user) {
          database.updateUserMode(user.uid, 'ghoul');
        }
        
        // Show journal content
        checkJournalAccess('ghoul');
        
        // Load journal entries
        loadJournalEntries(user.uid);
      });
    }
    
  } catch (error) {
    console.error('Error initializing journal:', error);
  }
}

// Check if user can access journal (only in ghoul mode)
function checkJournalAccess(mode) {
  const journalContent = document.getElementById('journal-content');
  const ghoulWarning = document.getElementById('ghoul-mode-required');
  
  if (mode === 'ghoul') {
    // Show journal content in ghoul mode
    if (journalContent) journalContent.style.display = 'block';
    if (ghoulWarning) ghoulWarning.style.display = 'none';
  } else {
    // Hide journal content in human mode
    if (journalContent) journalContent.style.display = 'none';
    if (ghoulWarning) ghoulWarning.style.display = 'block';
  }
}

// Load journal entries from database
async function loadJournalEntries(userId) {
  try {
    const entries = await database.getJournalEntries(userId);
    
    const journalContent = document.getElementById('journal-content');
    if (!journalContent) return;
    
    // Clear existing content
    journalContent.innerHTML = '';
    
    if (entries.length === 0) {
      // Show empty state
      journalContent.innerHTML = `
        <div class="empty-state">
          <p>No journal entries yet. Share your thoughts...</p>
        </div>
      `;
      return;
    }
    
    // Add entries to container
    entries.forEach(entry => {
      const entryElement = createEntryElement(entry);
      journalContent.appendChild(entryElement);
    });
    
  } catch (error) {
    console.error('Error loading journal entries:', error);
  }
}

// Create journal entry element
function createEntryElement(entry) {
  const entryCard = document.createElement('div');
  entryCard.className = `card journal-entry mood-${entry.mood}`;
  
  // Format date
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Create entry content
  entryCard.innerHTML = `
    <div class="entry-header">
      <h3 class="entry-title">${entry.title}</h3>
      <span class="entry-date">${formattedDate}</span>
    </div>
    <div class="entry-mood">Mood: ${entry.mood}</div>
    <div class="entry-content">${formatJournalContent(entry.content)}</div>
    ${entry.imageData ? `<div class="entry-image"><img src="${entry.imageData}" alt="Journal image"></div>` : ''}
  `;
  
  return entryCard;
}

// Format journal content with line breaks
function formatJournalContent(content) {
  return content.replace(/\n/g, '<br>');
}

// Set up new entry form
function setupNewEntryForm(userId) {
  const newEntryBtn = document.getElementById('new-entry-btn');
  const modal = document.getElementById('new-entry-modal');
  const form = document.getElementById('journal-form');
  const cancelBtn = document.getElementById('cancel-entry');
  const imageInput = document.getElementById('entry-image');
  const imagePreview = document.getElementById('image-preview');
  
  // Show modal when new entry button is clicked
  if (newEntryBtn) {
    newEntryBtn.addEventListener('click', () => {
      // Only allow new entries in ghoul mode
      if (!document.body.classList.contains('ghoul-mode')) {
        alert('You must be in Ghoul Mode to add journal entries.');
        return;
      }
      
      if (modal) {
        modal.style.display = 'flex';
        resetForm();
      }
    });
  }
  
  // Hide modal when cancel is clicked
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (modal) {
        modal.style.display = 'none';
        resetForm();
      }
    });
  }
  
  // Close modal when clicking outside content
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        resetForm();
      }
    });
  }
  
  // Handle image preview
  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Selected image">`;
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = '';
      }
    });
  }
  
  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const title = document.getElementById('entry-title').value.trim();
        const mood = document.getElementById('entry-mood').value;
        const content = document.getElementById('entry-content').value.trim();
        const imageFile = document.getElementById('entry-image').files[0];
        
        let imageData = null;
        
        // Convert image to base64 if provided
        if (imageFile) {
          imageData = await convertImageToBase64(imageFile);
        }
        
        // Create entry in database
        const entryData = {
          title,
          mood,
          content,
          imageData,
        };
        
        await database.createJournalEntry(userId, entryData);
        
        // Hide modal
        if (modal) {
          modal.style.display = 'none';
        }
        
        // Reload entries
        await loadJournalEntries(userId);
        
      } catch (error) {
        console.error('Error creating journal entry:', error);
        alert('Failed to save journal entry. Please try again.');
      }
    });
  }
  
  // Reset form fields
  function resetForm() {
    if (form) {
      form.reset();
      if (imagePreview) {
        imagePreview.innerHTML = '';
      }
    }
  }
}

// Convert image file to base64 string
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsDataURL(file);
  });
}
