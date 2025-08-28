/**
 * BlackReaper v2 - Theme Animator
 * Handles the Tokyo Ghoul inspired animations
 */

// Create a self-contained module
const themeAnimator = (() => {
  // Animation states and elements
  let animationContainer = null;
  let animationInProgress = false;
  let frameIndex = 1;
  let totalFrames = 23;
  let animationInterval = null;
  
  /**
   * Initialize the animation container
   */
  function initAnimationContainer() {
    // If container already exists, remove it
    if (animationContainer) {
      document.body.removeChild(animationContainer);
    }
    
    // Create animation container
    animationContainer = document.createElement('div');
    animationContainer.classList.add('theme-animation-container');
    animationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.7);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    // Create animation frame element
    const frameElement = document.createElement('div');
    frameElement.classList.add('animation-frame');
    frameElement.style.cssText = `
      width: 100%;
      max-width: 500px;
      height: 300px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    `;
    
    // Create progress elements
    const progressContainer = document.createElement('div');
    progressContainer.classList.add('animation-progress-container');
    progressContainer.style.cssText = `
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.classList.add('animation-progress-bar');
    progressBar.style.cssText = `
      width: 100%;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    `;
    
    const progressFill = document.createElement('div');
    progressFill.classList.add('animation-progress-fill');
    progressFill.style.cssText = `
      height: 100%;
      width: 0%;
      background-color: #ff0033;
      border-radius: 4px;
      transition: width 0.1s linear;
    `;
    
    const captionElement = document.createElement('div');
    captionElement.classList.add('animation-caption');
    captionElement.style.cssText = `
      color: white;
      font-size: 16px;
      text-align: center;
      font-family: 'Segoe UI', sans-serif;
    `;
    
    // Assemble the container
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(captionElement);
    
    animationContainer.appendChild(frameElement);
    animationContainer.appendChild(progressContainer);
    
    document.body.appendChild(animationContainer);
    
    return {
      container: animationContainer,
      frame: frameElement,
      progress: progressFill,
      caption: captionElement
    };
  }
  
  /**
   * Update the animation frame
   * @param {Object} elements - Animation elements
   * @param {number} currentFrame - Current frame index
   * @param {number} total - Total frames
   */
  function updateAnimationFrame(elements, currentFrame, total) {
    const progressPercent = (currentFrame / total) * 100;
    
    // Update frame image
    elements.frame.style.backgroundImage = `url('animation_sprites/frame${currentFrame}.png')`;
    
    // Update progress bar
    elements.progress.style.width = `${progressPercent}%`;
  }
  
  /**
   * Play the theme change animation
   * @param {Object} options - Animation options
   */
  function playThemeAnimation(options = {}) {
    if (animationInProgress) return;
    
    const duration = options.duration || 3000;
    const showProgress = options.showProgress !== false;
    const caption = options.caption || 'Transforming...';
    const onComplete = options.onComplete || (() => {});
    
    // Calculate timing
    const frameDelay = duration / totalFrames;
    
    // Initialize animation container
    const elements = initAnimationContainer();
    
    // Show caption if needed
    if (caption && showProgress) {
      elements.caption.textContent = caption;
    }
    
    // Make container visible
    setTimeout(() => {
      elements.container.style.opacity = '1';
    }, 10);
    
    // Set initial animation state
    frameIndex = 1;
    animationInProgress = true;
    
    // Start animation
    updateAnimationFrame(elements, frameIndex, totalFrames);
    
    // Create animation interval
    animationInterval = setInterval(() => {
      frameIndex++;
      
      if (frameIndex <= totalFrames) {
        updateAnimationFrame(elements, frameIndex, totalFrames);
      } else {
        // Animation complete
        clearInterval(animationInterval);
        
        // Fade out animation container
        elements.container.style.opacity = '0';
        
        // Remove container after fade out
        setTimeout(() => {
          if (elements.container.parentNode) {
            document.body.removeChild(elements.container);
          }
          animationContainer = null;
          animationInProgress = false;
          
          // Call complete callback
          onComplete();
        }, 300);
      }
    }, frameDelay);
  }
  
  /**
   * Check if animation is currently in progress
   * @returns {boolean} True if animation is in progress
   */
  function isAnimating() {
    return animationInProgress;
  }
  
  /**
   * Cancel any ongoing animation
   */
  function cancelAnimation() {
    if (!animationInProgress) return;
    
    clearInterval(animationInterval);
    
    if (animationContainer && animationContainer.parentNode) {
      document.body.removeChild(animationContainer);
    }
    
    animationContainer = null;
    animationInProgress = false;
  }
  
  // Return public API
  return {
    playThemeAnimation,
    isAnimating,
    cancelAnimation
  };
})();

// Expose the theme animator globally
window.themeAnimator = themeAnimator;
