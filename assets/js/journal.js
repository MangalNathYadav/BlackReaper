// journal.js - Specific functionality for the journal page

// DOM Elements
const journalEntry = document.getElementById('journal-entry');
const moodSelect = document.getElementById('mood-select');
const saveJournalButton = document.getElementById('save-journal');
const clearJournalButton = document.getElementById('clear-journal');
const filterEntries = document.getElementById('filter-entries');
const entriesContainer = document.getElementById('entries-container');
const psychQuote = document.getElementById('psych-quote');

// Psychological quotes based on mood
const moodQuotes = {
    calm: [
        "Even in the midst of chaos, find stillness within.",
        "The sea is both calm and dangerous. So am I.",
        "Serenity isn't the absence of a storm but finding peace within it.",
        "I am the calm before the storm.",
        "My mind is a sanctuary only I control."
    ],
    anxious: [
        "Fear is a reaction. Courage is a decision.",
        "Anxiety is just a shadow. I am the light.",
        "In a world full of chaos, sometimes I need to be the storm.",
        "The fear we don't face becomes our limit.",
        "What scares me most is becoming the monster I fear."
    ],
    angry: [
        "My anger is a gift, a weapon I must learn to wield.",
        "I would rather be consumed by the truth than comforted with a lie.",
        "Sometimes you need to burn bridges to stop yourself from crossing them again.",
        "My rage is just my body's alarm system telling me something needs to change.",
        "The world broke me, but the cracks are where the light enters."
    ],
    hungry: [
        "This hunger inside me... I don't know if I can control it forever.",
        "The more I feed it, the more it wants.",
        "I'm afraid of what I'll become if I give in to this hunger.",
        "My appetite has become something more sinister.",
        "There's a void inside me that normal food can't fill."
    ],
    broken: [
        "Sometimes being broken means you were strong enough to endure.",
        "The world is cruel, but that doesn't mean I have to be.",
        "I am both the damaged and the damager.",
        "My scars tell the story of survival, not victimhood.",
        "Being broken means I have the opportunity to put myself back together differently."
    ]
};

// Initialize the journal when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Journal initializing...');
    initializeJournal();
});

// Initialize journal components
function initializeJournal() {
    loadJournalEntries();
    setupJournalEventListeners();
    updateQuoteForMood();
    setupTypingEffect();
}

// Load journal entries from localStorage or Firebase
function loadJournalEntries() {
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    displayJournalEntries(entries);
}

// Display journal entries in the UI
function displayJournalEntries(entries) {
    // Clear existing entries
    entriesContainer.innerHTML = '';
    
    if (entries.length === 0) {
        entriesContainer.innerHTML = '<p class="no-entries">No journal entries yet. Start writing!</p>';
        return;
    }
    
    // Sort entries by date (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add each entry to the UI
    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry blur-content human-only';
        
        const date = new Date(entry.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        div.innerHTML = `
            <div class="entry-header">
                <span class="entry-date">${formattedDate}</span>
                <span class="entry-mood ${entry.mood}">${entry.mood}</span>
            </div>
            <div class="entry-content">
                <p>${entry.text}</p>
            </div>
        `;
        
        entriesContainer.appendChild(div);
    });
}

// Save journal entry
function saveJournalEntry() {
    const text = journalEntry.value.trim();
    const mood = moodSelect.value;
    
    if (text) {
        // Get existing entries
        const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        
        // Add new entry
        entries.unshift({
            text,
            mood,
            date: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        
        // Also save to journal previews for dashboard
        saveJournalPreview(text, mood);
        
        // Clear input
        clearJournal();
        
        // Reload entries
        loadJournalEntries();
        
        // Apply glitch effect
        BlackReaper.applyGlitchEffect();
        
        // Show success message
        alert('Journal entry saved successfully.');
    }
}

// Clear journal input
function clearJournal() {
    journalEntry.value = '';
}

// Save journal preview for dashboard
function saveJournalPreview(text, mood) {
    const previews = JSON.parse(localStorage.getItem('journalPreviews')) || [];
    
    previews.unshift({
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        date: new Date().toISOString(),
        mood
    });
    
    // Keep only the 5 most recent previews
    if (previews.length > 5) {
        previews.pop();
    }
    
    localStorage.setItem('journalPreviews', JSON.stringify(previews));
}

// Filter journal entries
function filterJournalEntries() {
    const filter = filterEntries.value.toLowerCase();
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    if (!filter) {
        displayJournalEntries(entries);
        return;
    }
    
    const filteredEntries = entries.filter(entry => 
        entry.text.toLowerCase().includes(filter) || 
        entry.mood.toLowerCase().includes(filter)
    );
    
    displayJournalEntries(filteredEntries);
}

// Update psychological quote based on selected mood
function updateQuoteForMood() {
    const mood = moodSelect.value;
    const quotes = moodQuotes[mood] || moodQuotes.calm;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    
    psychQuote.textContent = quotes[randomIndex];
    
    // Add fade effect
    psychQuote.classList.add('fade-in');
    setTimeout(() => {
        psychQuote.classList.remove('fade-in');
    }, 1000);
}

// Setup typing effect for journal entry
function setupTypingEffect() {
    if (journalEntry) {
        journalEntry.addEventListener('input', function() {
            // Random chance to add glitch effect while typing
            if (Math.random() < 0.1) {
                this.classList.add('glitch-active');
                setTimeout(() => {
                    this.classList.remove('glitch-active');
                }, 200);
            }
        });
    }
}

// Setup event listeners specific to the journal
function setupJournalEventListeners() {
    // Save journal button
    if (saveJournalButton) {
        saveJournalButton.addEventListener('click', saveJournalEntry);
    }
    
    // Clear journal button
    if (clearJournalButton) {
        clearJournalButton.addEventListener('click', clearJournal);
    }
    
    // Filter entries input
    if (filterEntries) {
        filterEntries.addEventListener('input', filterJournalEntries);
    }
    
    // Mood select
    if (moodSelect) {
        moodSelect.addEventListener('change', updateQuoteForMood);
    }
    
    // Save on Ctrl+Enter
    if (journalEntry) {
        journalEntry.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                saveJournalEntry();
            }
        });
    }
}
