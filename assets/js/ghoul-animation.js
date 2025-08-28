/**
 * Tokyo Ghoul Frame-based Animation Module
 * This module provides a reusable animation sequence for theme switching
 * and app loading based on Tokyo Ghoul aesthetics.
 */

// Animation constants
const ANIMATION = {
    totalFrames: 23,
    frameDuration: 120, // milliseconds per frame
    framesPath: 'animation_sprites/'
};

/**
 * Creates a frame-based animation overlay for theme transitions
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Duration in ms (default: 3000ms)
 * @param {Function} options.onComplete - Callback when animation completes
 * @param {boolean} options.showProgress - Whether to show progress bar
 * @param {boolean} options.fullscreen - Whether animation should be full viewport
 * @param {string} options.caption - Initial caption for the animation
 * @returns {Object} Animation control object with start/stop methods
 */
function createThemeAnimation(options = {}) {
    // Default options
    const settings = {
        duration: options.duration || 3000,
        onComplete: options.onComplete || function() {},
        showProgress: options.showProgress !== undefined ? options.showProgress : true,
        fullscreen: options.fullscreen !== undefined ? options.fullscreen : true,
        caption: options.caption || "Becoming Ghoul"
    };

    // Frame captions for key frames
    const frameCaptions = {
        1: "Becoming Ghoul",
        5: "Power Awakening",
        8: "Transformation Beginning",
        12: "Kagune Emerging",
        16: "The Eyepatch Ghoul",
        19: "Flames of Power Rising",
        23: "BLACK REAPER AWAKENED"
    };

    // Create animation container
    const container = document.createElement('div');
    container.className = 'tg-animation-container';
    if (!settings.fullscreen) {
        container.style.position = 'absolute';
        container.style.zIndex = '9999';
    }

    // Create frame sequence container
    const frameSequence = document.createElement('div');
    frameSequence.className = 'frame-sequence';
    container.appendChild(frameSequence);

    // Create caption
    const caption = document.createElement('div');
    caption.className = 'animation-caption';
    caption.textContent = settings.caption;
    container.appendChild(caption);

    // Create progress bar if needed
    let progressBar = null;
    let progressBarContainer = null;
    let loadingText = null;
    
    if (settings.showProgress) {
        progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'loading-progress';
        
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBarContainer.appendChild(progressBar);
        container.appendChild(progressBarContainer);
        
        loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Transforming...';
        container.appendChild(loadingText);
    }

    // Variables for animation control
    let currentFrame = 1;
    let frameInterval = null;
    let loadProgress = 0;
    let animationActive = false;

    // Preload frames
    function preloadFrames() {
        // Clear existing content
        frameSequence.innerHTML = '';
        
        // Create image elements for all frames
        for (let i = 1; i <= ANIMATION.totalFrames; i++) {
            const img = document.createElement('img');
            img.src = `${ANIMATION.framesPath}frame${i}.png`;
            img.alt = `Animation Frame ${i}`;
            img.className = i === 1 ? 'active' : ''; // First frame is active initially
            
            // Add error handling for image loading
            img.onerror = function() {
                console.log(`Could not load frame ${i}`);
            };
            
            frameSequence.appendChild(img);
        }
    }

    // Animate frames sequentially
    function animateFrames() {
        // Get all frame images
        const frames = frameSequence.querySelectorAll('img');
        
        // Hide current frame
        frames[currentFrame - 1].classList.remove('active');
        
        // Advance to next frame
        currentFrame = currentFrame >= ANIMATION.totalFrames ? 1 : currentFrame + 1;
        
        // Show next frame
        frames[currentFrame - 1].classList.add('active');
        
        // Update caption if there's a specific one for this frame
        if (frameCaptions[currentFrame]) {
            caption.textContent = frameCaptions[currentFrame];
            caption.classList.add('caption-change');
            setTimeout(() => {
                caption.classList.remove('caption-change');
            }, 500);
        }
        
        // Update loading progress
        if (settings.showProgress) {
            updateLoadingProgress();
        }
    }

    // Update loading progress
    function updateLoadingProgress() {
        // Calculate frame-based progress speed based on desired duration
        const progressIncrement = 100 / ((settings.duration / ANIMATION.frameDuration) * 1);
        
        // Increment progress
        loadProgress += progressIncrement;
        if (loadProgress > 100) loadProgress = 100;
        
        // Update progress bar
        progressBar.style.width = `${loadProgress}%`;
        
        // Update loading text
        if (loadingText) {
            loadingText.textContent = `Transforming... ${Math.floor(loadProgress)}%`;
        }
        
        // Check if animation is complete
        if (loadProgress >= 100 && animationActive) {
            stop();
            settings.onComplete();
        }
    }

    // Start animation
    function start() {
        if (animationActive) return;
        
        // Reset progress
        loadProgress = 0;
        currentFrame = 1;
        if (progressBar) progressBar.style.width = '0%';
        
        // Add container to body if not already there
        if (!document.body.contains(container)) {
            document.body.appendChild(container);
        }
        
        // Preload frames
        preloadFrames();
        
        // Start animation
        animationActive = true;
        frameInterval = setInterval(animateFrames, ANIMATION.frameDuration);
        
        // Play sound effect if available
        try {
            const audio = new Audio('assets/audio/kagune-activate.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => console.log('Audio play failed:', err));
        } catch (err) {
            console.log('Audio not available:', err);
        }
        
        return container;
    }

    // Stop animation
    function stop() {
        if (!animationActive) return;
        
        // Clear interval
        clearInterval(frameInterval);
        
        // Reset flags
        animationActive = false;
        
        // Remove container after fade out
        container.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }, 500);
    }

    // Add required CSS if not already present
    addRequiredCSS();

    // Return control object
    return {
        start,
        stop,
        container
    };
}

// Add required CSS if not already in document
function addRequiredCSS() {
    if (document.getElementById('tokyo-ghoul-animation-css')) return;
    
    const style = document.createElement('style');
    style.id = 'tokyo-ghoul-animation-css';
    style.textContent = `
        /* Tokyo Ghoul Animation Styles */
        .tg-animation-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            overflow: hidden;
            transition: opacity 0.5s ease;
        }
        
        .frame-sequence {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .frame-sequence img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none; /* Hide all frames initially */
            opacity: 0;
            transition: opacity 0.1s ease;
        }
        
        .frame-sequence img.active {
            display: block; /* Show only active frame */
            opacity: 1;
        }
        
        .animation-caption {
            position: absolute;
            bottom: 15%;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 2rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #fff;
            text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
            z-index: 10;
        }
        
        .loading-progress {
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            width: 0;
            background-color: #ff0000;
            transition: width 0.3s ease;
        }
        
        .loading-text {
            position: absolute;
            bottom: 7%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
        }
    `;
    
    document.head.appendChild(style);
}

// Export the animation module
window.tokyoGhoulAnimation = {
    createThemeAnimation,
    ANIMATION
};
