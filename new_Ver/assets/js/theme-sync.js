// Theme synchronization module

// Set up theme synchronization
function setupThemeSync(userId) {
    const themeRef = firebase.database().ref(`themes/${userId}`);
    
    // Listen for theme changes
    themeRef.on('value', (snapshot) => {
        const themeData = snapshot.val();
        if (themeData && themeData.mode) {
            applyTheme(themeData.mode);
        }
    });
    
    // Set up theme toggle listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme(userId);
        });
    }
}

// Toggle theme
async function toggleTheme(userId) {
    try {
        const userRef = firebase.database().ref(`users/${userId}`);
        const themeRef = firebase.database().ref(`themes/${userId}`);
        
        // Get current mode
        const snapshot = await userRef.child('mode').once('value');
        const currentMode = snapshot.val() || 'human';
        
        // Calculate new mode
        const newMode = currentMode === 'human' ? 'ghoul' : 'human';
        
        // Update user profile and theme data
        await Promise.all([
            userRef.update({ mode: newMode }),
            themeRef.set({
                mode: newMode,
                lastChanged: firebase.database.ServerValue.TIMESTAMP
            })
        ]);
        
        // Play theme change sound
        playThemeChangeSound(newMode);
        
        return true;
    } catch (error) {
        console.error('Error toggling theme:', error);
        return false;
    }
}

// Play theme change sound
function playThemeChangeSound(newMode) {
    const soundFile = newMode === 'ghoul' 
        ? 'assets/audio/kagune-activate.mp3'
        : 'assets/audio/kagune-deactivate.mp3';
        
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
        console.warn('Could not play theme change sound:', error);
    });
}

// Apply theme to UI
function applyTheme(mode) {
    document.body.setAttribute('data-theme', mode);
    
    // Update UI elements
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.className = `theme-icon ${mode === 'ghoul' ? 'fa-moon' : 'fa-sun'}`;
    }
    
    const themeText = document.querySelector('.theme-text');
    if (themeText) {
        themeText.textContent = `${mode === 'ghoul' ? 'Ghoul' : 'Human'} Mode`;
    }
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode } }));
}
