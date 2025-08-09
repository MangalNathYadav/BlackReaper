// Voice recognition for journal entries

// Speech recognition variables
let recognition;
let isListening = false;
let voiceJournalText = '';

// DOM Elements
const voiceJournalButton = document.createElement('button');
voiceJournalButton.id = 'voice-journal-btn';
voiceJournalButton.className = 'voice-btn';
voiceJournalButton.innerHTML = '<span class="mic-icon">🎙️</span>';
voiceJournalButton.title = 'Record voice journal entry';

// Initialize speech recognition
function initSpeechRecognition() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return false;
    }
    
    // Create recognition object
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Handle results
    recognition.onresult = handleSpeechResult;
    
    // Handle errors
    recognition.onerror = handleSpeechError;
    
    // Handle end of speech recognition
    recognition.onend = handleSpeechEnd;
    
    return true;
}

// Handle speech recognition results
function handleSpeechResult(event) {
    let interimTranscript = '';
    let finalTranscript = '';
    
    // Collect results
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
            finalTranscript += transcript;
        } else {
            interimTranscript += transcript;
        }
    }
    
    // Update journal entry field
    const journalEntry = document.getElementById('journal-entry');
    if (journalEntry) {
        // Append final transcript to existing text
        if (finalTranscript) {
            voiceJournalText += finalTranscript + ' ';
            journalEntry.value = voiceJournalText;
        }
        
        // Show interim transcript in placeholder
        if (interimTranscript) {
            journalEntry.setAttribute('placeholder', 'Listening: ' + interimTranscript);
        }
    }
}

// Handle speech recognition errors
function handleSpeechError(event) {
    console.error('Speech recognition error:', event.error);
    
    // Display error message
    const journalEntry = document.getElementById('journal-entry');
    if (journalEntry) {
        journalEntry.setAttribute('placeholder', 'Error: ' + event.error);
    }
    
    // Stop listening
    stopSpeechRecognition();
}

// Handle speech recognition end
function handleSpeechEnd() {
    // Only restart if still supposed to be listening
    if (isListening) {
        recognition.start();
    } else {
        // Reset button
        voiceJournalButton.classList.remove('listening');
        
        // Reset placeholder
        const journalEntry = document.getElementById('journal-entry');
        if (journalEntry && journalEntry.value.trim() === '') {
            journalEntry.setAttribute('placeholder', 'Begin typing your thoughts...');
        }
    }
}

// Start speech recognition
function startSpeechRecognition() {
    if (!recognition) {
        if (!initSpeechRecognition()) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }
    }
    
    try {
        recognition.start();
        isListening = true;
        
        // Update button state
        voiceJournalButton.classList.add('listening');
        
        // Get current text
        const journalEntry = document.getElementById('journal-entry');
        if (journalEntry) {
            voiceJournalText = journalEntry.value;
            journalEntry.setAttribute('placeholder', 'Listening...');
        }
    } catch (e) {
        console.error('Error starting speech recognition:', e);
    }
}

// Stop speech recognition
function stopSpeechRecognition() {
    if (recognition) {
        recognition.stop();
        isListening = false;
        
        // Update button state
        voiceJournalButton.classList.remove('listening');
        
        // Reset placeholder
        const journalEntry = document.getElementById('journal-entry');
        if (journalEntry) {
            journalEntry.setAttribute('placeholder', 'Begin typing your thoughts...');
        }
    }
}

// Toggle speech recognition
function toggleSpeechRecognition() {
    if (isListening) {
        stopSpeechRecognition();
    } else {
        startSpeechRecognition();
    }
}

// Add voice journal button to the journal page
function addVoiceJournalButton() {
    // Check if on journal page
    if (window.location.pathname.endsWith('journal.html')) {
        // Find the journal actions container
        const journalActions = document.querySelector('.journal-actions');
        
        if (journalActions) {
            // Insert button before the first child
            journalActions.insertBefore(voiceJournalButton, journalActions.firstChild);
            
            // Add event listener
            voiceJournalButton.addEventListener('click', toggleSpeechRecognition);
            
            // Add CSS for voice button
            const style = document.createElement('style');
            style.textContent = `
                .voice-btn {
                    background-color: var(--accent);
                    color: var(--bg);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .voice-btn.listening {
                    animation: pulse 1.5s infinite;
                    background-color: var(--text-ghoul);
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .mic-icon {
                    font-size: 1.2rem;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize voice journal feature
document.addEventListener('DOMContentLoaded', () => {
    addVoiceJournalButton();
});
