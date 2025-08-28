/**
 * Script to add theme animation to all pages
 * This script should be included after ghoul-animation.js and before main.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if animation should play on initial load
    const animationPlayed = sessionStorage.getItem('animationPlayed');
    const savedMode = localStorage.getItem('theme-mode');
    
    // Only play animation on first load if user has ghoul mode saved or is switching to ghoul mode
    if (!animationPlayed && savedMode === 'ghoul') {
        // Play animation on first load for ghoul mode only
        setTimeout(() => {
            if (window.tokyoGhoulAnimation) {
                const loadAnimation = window.tokyoGhoulAnimation.createThemeAnimation({
                    duration: 3000, // 3 seconds for initial load
                    caption: "BLACK REAPER",
                    onComplete: () => {
                        console.log("Initial animation complete");
                    }
                });
                loadAnimation.start();
                
                // Mark that the animation has played in this session
                sessionStorage.setItem('animationPlayed', 'true');
            }
        }, 500);
    }

    // Check for any active theme buttons that might need the animation
    document.querySelectorAll('[id*="mode-toggle"], [id*="theme-toggle"]').forEach(button => {
        if (!button.hasAttribute('data-animation-attached')) {
            button.setAttribute('data-animation-attached', 'true');
            
            // Add our animation listener to the button if it doesn't use the main.js toggle
            if (!document.querySelector('script[src*="main.js"]')) {
                button.addEventListener('click', function() {
                    if (window.tokyoGhoulAnimation) {
                        const currentMode = document.body.classList.contains('ghoul-mode') ? 'ghoul' : 'human';
                        const newMode = currentMode === 'ghoul' ? 'human' : 'ghoul';
                        
                        // Only play animation when switching TO ghoul mode
                        if (newMode === 'ghoul') {
                            const themeAnimation = window.tokyoGhoulAnimation.createThemeAnimation({
                                duration: 3000, // 3 seconds for theme switching
                                caption: 'Becoming Ghoul',
                                onComplete: () => {
                                    // Update body class
                                    document.body.className = 'ghoul-mode';
                                    
                                    // Save preference to localStorage
                                    localStorage.setItem('theme-mode', 'ghoul');
                                }
                            });
                            themeAnimation.start();
                        } else {
                            // Just switch to human mode immediately with no animation
                            document.body.className = 'human-mode';
                            localStorage.setItem('theme-mode', 'human');
                        }
                    }
                });
            }
        }
    });
});
