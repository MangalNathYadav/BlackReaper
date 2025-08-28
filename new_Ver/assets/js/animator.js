// Animation utilities for BlackReaper

/**
 * Animation utilities
 */
class Animator {
  constructor() {
    this.animations = new Map();
  }

  /**
   * Create a sprite animation
   * @param {Object} options - Animation options
   * @returns {Object} Animation controller
   */
  createSpriteAnimation(options) {
    const {
      container,
      frames,
      frameRate = 30,
      loop = true,
      autoPlay = true,
      onComplete = null
    } = options;
    
    // Validate container
    if (!container) {
      console.error('Animation container is required');
      return null;
    }
    
    // Validate frames
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      console.error('Animation frames are required');
      return null;
    }
    
    // Create animation object
    const animation = {
      container,
      frames,
      frameRate,
      loop,
      onComplete,
      currentFrame: 0,
      isPlaying: false,
      intervalId: null
    };
    
    // Generate a unique ID for this animation
    const id = `anim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Store the animation
    this.animations.set(id, animation);
    
    // Create animation controller
    const controller = {
      id,
      play: () => this.playAnimation(id),
      pause: () => this.pauseAnimation(id),
      stop: () => this.stopAnimation(id),
      setFrame: (frame) => this.setAnimationFrame(id, frame),
      getFrame: () => this.getAnimationFrame(id),
      isPlaying: () => this.isAnimationPlaying(id),
      destroy: () => this.destroyAnimation(id)
    };
    
    // Auto-play if specified
    if (autoPlay) {
      this.playAnimation(id);
    }
    
    return controller;
  }

  /**
   * Play an animation
   * @param {string} id - Animation ID
   */
  playAnimation(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    // If already playing, do nothing
    if (animation.isPlaying) {
      return;
    }
    
    animation.isPlaying = true;
    
    // Clear any existing interval
    if (animation.intervalId) {
      clearInterval(animation.intervalId);
    }
    
    // Set interval to advance frames
    const frameInterval = 1000 / animation.frameRate;
    
    animation.intervalId = setInterval(() => {
      this.advanceAnimationFrame(id);
    }, frameInterval);
    
    // Update display
    this.updateAnimationDisplay(id);
  }

  /**
   * Pause an animation
   * @param {string} id - Animation ID
   */
  pauseAnimation(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    animation.isPlaying = false;
    
    // Clear interval
    if (animation.intervalId) {
      clearInterval(animation.intervalId);
      animation.intervalId = null;
    }
  }

  /**
   * Stop an animation and reset to first frame
   * @param {string} id - Animation ID
   */
  stopAnimation(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    animation.isPlaying = false;
    animation.currentFrame = 0;
    
    // Clear interval
    if (animation.intervalId) {
      clearInterval(animation.intervalId);
      animation.intervalId = null;
    }
    
    // Update display
    this.updateAnimationDisplay(id);
  }

  /**
   * Set animation to specific frame
   * @param {string} id - Animation ID
   * @param {number} frame - Frame index
   */
  setAnimationFrame(id, frame) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    // Validate frame
    if (frame < 0 || frame >= animation.frames.length) {
      console.warn('Invalid frame index:', frame);
      return;
    }
    
    animation.currentFrame = frame;
    
    // Update display
    this.updateAnimationDisplay(id);
  }

  /**
   * Get current animation frame
   * @param {string} id - Animation ID
   * @returns {number} Current frame index
   */
  getAnimationFrame(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return -1;
    }
    
    return animation.currentFrame;
  }

  /**
   * Check if animation is playing
   * @param {string} id - Animation ID
   * @returns {boolean} Whether animation is playing
   */
  isAnimationPlaying(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return false;
    }
    
    return animation.isPlaying;
  }

  /**
   * Destroy animation and remove from tracking
   * @param {string} id - Animation ID
   */
  destroyAnimation(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    // Clear interval
    if (animation.intervalId) {
      clearInterval(animation.intervalId);
    }
    
    // Remove from tracking
    this.animations.delete(id);
  }

  /**
   * Advance animation to next frame
   * @param {string} id - Animation ID
   */
  advanceAnimationFrame(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    // Advance frame
    animation.currentFrame++;
    
    // Check if animation is complete
    if (animation.currentFrame >= animation.frames.length) {
      if (animation.loop) {
        // Loop back to start
        animation.currentFrame = 0;
      } else {
        // Stop animation
        this.pauseAnimation(id);
        
        // Reset to last frame
        animation.currentFrame = animation.frames.length - 1;
        
        // Call onComplete if provided
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    }
    
    // Update display
    this.updateAnimationDisplay(id);
  }

  /**
   * Update animation display
   * @param {string} id - Animation ID
   */
  updateAnimationDisplay(id) {
    const animation = this.animations.get(id);
    
    if (!animation) {
      return;
    }
    
    // Get current frame
    const frameIndex = animation.currentFrame;
    const frame = animation.frames[frameIndex];
    
    // Update container
    if (frame) {
      // If frame is a string (URL)
      if (typeof frame === 'string') {
        if (animation.container.tagName === 'IMG') {
          animation.container.src = frame;
        } else {
          animation.container.style.backgroundImage = `url(${frame})`;
        }
      }
      // If frame is an object with src property
      else if (frame.src) {
        if (animation.container.tagName === 'IMG') {
          animation.container.src = frame.src;
        } else {
          animation.container.style.backgroundImage = `url(${frame.src})`;
        }
      }
    }
  }

  /**
   * Create a CSS animation
   * @param {Object} options - Animation options
   * @returns {Object} Animation controller
   */
  createCssAnimation(options) {
    const {
      element,
      keyframes,
      duration = 1000,
      easing = 'linear',
      delay = 0,
      iterations = 1,
      direction = 'normal',
      fillMode = 'forwards',
      onStart = null,
      onComplete = null,
      onIteration = null
    } = options;
    
    // Validate element
    if (!element) {
      console.error('Animation element is required');
      return null;
    }
    
    // Validate keyframes
    if (!keyframes || !Array.isArray(keyframes) || keyframes.length === 0) {
      console.error('Animation keyframes are required');
      return null;
    }
    
    // Create animation
    const animation = element.animate(keyframes, {
      duration,
      easing,
      delay,
      iterations,
      direction,
      fill: fillMode
    });
    
    // Set up event handlers
    if (onStart) {
      animation.onstart = onStart;
    }
    
    if (onComplete) {
      animation.onfinish = onComplete;
    }
    
    if (onIteration) {
      animation.oniterationstart = onIteration;
    }
    
    // Create animation controller
    const controller = {
      play: () => animation.play(),
      pause: () => animation.pause(),
      cancel: () => animation.cancel(),
      finish: () => animation.finish(),
      reverse: () => animation.reverse(),
      updatePlaybackRate: (rate) => {
        animation.playbackRate = rate;
      },
      getAnimation: () => animation
    };
    
    return controller;
  }

  /**
   * Create a typing animation
   * @param {Object} options - Animation options
   * @returns {Object} Animation controller
   */
  createTypingAnimation(options) {
    const {
      element,
      text,
      speed = 50,
      delay = 0,
      cursor = true,
      cursorChar = '|',
      cursorClass = 'typing-cursor',
      onComplete = null
    } = options;
    
    // Validate element
    if (!element) {
      console.error('Animation element is required');
      return null;
    }
    
    // Validate text
    if (!text) {
      console.error('Animation text is required');
      return null;
    }
    
    // Create typing state
    const typing = {
      element,
      text,
      speed,
      delay,
      cursor,
      cursorChar,
      cursorClass,
      onComplete,
      currentIndex: 0,
      isPlaying: false,
      timeoutId: null,
      cursorElement: null
    };
    
    // Generate a unique ID for this animation
    const id = `typing_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Store the animation
    this.animations.set(id, typing);
    
    // Create cursor element if needed
    if (cursor) {
      typing.cursorElement = document.createElement('span');
      typing.cursorElement.className = cursorClass;
      typing.cursorElement.textContent = cursorChar;
      typing.cursorElement.style.animation = 'cursor-blink 1s infinite';
      
      // Add CSS if needed
      if (!document.getElementById('cursor-animation-style')) {
        const style = document.createElement('style');
        style.id = 'cursor-animation-style';
        style.textContent = `
          @keyframes cursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      element.appendChild(typing.cursorElement);
    }
    
    // Clear element content except cursor
    element.textContent = '';
    
    if (typing.cursorElement) {
      element.appendChild(typing.cursorElement);
    }
    
    // Create animation controller
    const controller = {
      id,
      play: () => this.playTypingAnimation(id),
      pause: () => this.pauseTypingAnimation(id),
      stop: () => this.stopTypingAnimation(id),
      isPlaying: () => this.isTypingAnimationPlaying(id),
      destroy: () => this.destroyTypingAnimation(id)
    };
    
    // Start animation after delay
    if (delay > 0) {
      typing.timeoutId = setTimeout(() => {
        this.playTypingAnimation(id);
      }, delay);
    } else {
      this.playTypingAnimation(id);
    }
    
    return controller;
  }

  /**
   * Play typing animation
   * @param {string} id - Animation ID
   */
  playTypingAnimation(id) {
    const typing = this.animations.get(id);
    
    if (!typing) {
      return;
    }
    
    // If already playing, do nothing
    if (typing.isPlaying) {
      return;
    }
    
    typing.isPlaying = true;
    
    // Start typing
    this.typeNextCharacter(id);
  }

  /**
   * Pause typing animation
   * @param {string} id - Animation ID
   */
  pauseTypingAnimation(id) {
    const typing = this.animations.get(id);
    
    if (!typing) {
      return;
    }
    
    typing.isPlaying = false;
    
    // Clear timeout
    if (typing.timeoutId) {
      clearTimeout(typing.timeoutId);
      typing.timeoutId = null;
    }
  }

  /**
   * Stop typing animation and reset
   * @param {string} id - Animation ID
   */
  stopTypingAnimation(id) {
    const typing = this.animations.get(id);
    
    if (!typing) {
      return;
    }
    
    typing.isPlaying = false;
    typing.currentIndex = 0;
    
    // Clear timeout
    if (typing.timeoutId) {
      clearTimeout(typing.timeoutId);
      typing.timeoutId = null;
    }
    
    // Clear element content except cursor
    typing.element.textContent = '';
    
    if (typing.cursorElement) {
      typing.element.appendChild(typing.cursorElement);
    }
  }

  /**
   * Check if typing animation is playing
   * @param {string} id - Animation ID
   * @returns {boolean} Whether animation is playing
   */
  isTypingAnimationPlaying(id) {
    const typing = this.animations.get(id);
    
    if (!typing) {
      return false;
    }
    
    return typing.isPlaying;
  }

  /**
   * Destroy typing animation
   * @param {string} id - Animation ID
   */
  destroyTypingAnimation(id) {
    const typing = this.animations.get(id);
    
    if (!typing) {
      return;
    }
    
    // Clear timeout
    if (typing.timeoutId) {
      clearTimeout(typing.timeoutId);
    }
    
    // Remove cursor element
    if (typing.cursorElement && typing.element.contains(typing.cursorElement)) {
      typing.element.removeChild(typing.cursorElement);
    }
    
    // Remove from tracking
    this.animations.delete(id);
  }

  /**
   * Type next character in typing animation
   * @param {string} id - Animation ID
   */
  typeNextCharacter(id) {
    const typing = this.animations.get(id);
    
    if (!typing || !typing.isPlaying) {
      return;
    }
    
    // If typing is complete
    if (typing.currentIndex >= typing.text.length) {
      typing.isPlaying = false;
      
      // Call onComplete if provided
      if (typing.onComplete) {
        typing.onComplete();
      }
      
      return;
    }
    
    // Get next character
    const char = typing.text.charAt(typing.currentIndex);
    
    // Create text node
    const textNode = document.createTextNode(char);
    
    // Insert before cursor if it exists
    if (typing.cursorElement) {
      typing.element.insertBefore(textNode, typing.cursorElement);
    } else {
      typing.element.appendChild(textNode);
    }
    
    // Advance to next character
    typing.currentIndex++;
    
    // Schedule next character
    typing.timeoutId = setTimeout(() => {
      this.typeNextCharacter(id);
    }, typing.speed);
  }
  
  /**
   * Create a loading animation
   * @param {Object} options - Animation options
   * @returns {HTMLElement} Loading animation element
   */
  createLoadingAnimation(options = {}) {
    const {
      type = 'spinner',
      size = 'medium',
      color = null,
      text = 'Loading...'
    } = options;
    
    // Create container
    const container = document.createElement('div');
    container.className = `loading-animation ${type} ${size}`;
    
    if (color) {
      container.style.setProperty('--loading-color', color);
    }
    
    // Create animation element based on type
    switch (type) {
      case 'spinner':
        this.createSpinnerAnimation(container);
        break;
      case 'dots':
        this.createDotsAnimation(container);
        break;
      case 'pulse':
        this.createPulseAnimation(container);
        break;
      case 'wave':
        this.createWaveAnimation(container);
        break;
      default:
        this.createSpinnerAnimation(container);
    }
    
    // Add loading text if provided
    if (text) {
      const textEl = document.createElement('div');
      textEl.className = 'loading-text';
      textEl.textContent = text;
      container.appendChild(textEl);
    }
    
    return container;
  }
  
  /**
   * Create a spinner animation
   * @param {HTMLElement} container - Container element
   */
  createSpinnerAnimation(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // Add CSS if needed
    if (!document.getElementById('spinner-animation-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-animation-style';
      style.textContent = `
        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--loading-color, var(--accent-color));
          animation: spinner-rotate 1s linear infinite;
        }
        
        @keyframes spinner-rotate {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(spinner);
  }
  
  /**
   * Create a dots animation
   * @param {HTMLElement} container - Container element
   */
  createDotsAnimation(container) {
    const dots = document.createElement('div');
    dots.className = 'dots';
    
    // Create dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dots.appendChild(dot);
    }
    
    // Add CSS if needed
    if (!document.getElementById('dots-animation-style')) {
      const style = document.createElement('style');
      style.id = 'dots-animation-style';
      style.textContent = `
        .dots {
          display: flex;
          gap: 5px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--loading-color, var(--accent-color));
          animation: dot-pulse 1.5s infinite ease-in-out;
        }
        
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes dot-pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.6; }
          50% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(dots);
  }
  
  /**
   * Create a pulse animation
   * @param {HTMLElement} container - Container element
   */
  createPulseAnimation(container) {
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    
    // Add CSS if needed
    if (!document.getElementById('pulse-animation-style')) {
      const style = document.createElement('style');
      style.id = 'pulse-animation-style';
      style.textContent = `
        .pulse {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: var(--loading-color, var(--accent-color));
          animation: pulse 1.5s infinite ease-in-out;
        }
        
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 0.6; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.6); opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(pulse);
  }
  
  /**
   * Create a wave animation
   * @param {HTMLElement} container - Container element
   */
  createWaveAnimation(container) {
    const wave = document.createElement('div');
    wave.className = 'wave';
    
    // Create bars
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      wave.appendChild(bar);
    }
    
    // Add CSS if needed
    if (!document.getElementById('wave-animation-style')) {
      const style = document.createElement('style');
      style.id = 'wave-animation-style';
      style.textContent = `
        .wave {
          display: flex;
          gap: 3px;
          align-items: center;
          height: 30px;
        }
        
        .bar {
          width: 4px;
          background-color: var(--loading-color, var(--accent-color));
          animation: bar-wave 1.2s infinite ease-in-out;
        }
        
        .bar:nth-child(1) { height: 30%; animation-delay: -1.2s; }
        .bar:nth-child(2) { height: 50%; animation-delay: -1.0s; }
        .bar:nth-child(3) { height: 70%; animation-delay: -0.8s; }
        .bar:nth-child(4) { height: 50%; animation-delay: -0.6s; }
        .bar:nth-child(5) { height: 30%; animation-delay: -0.4s; }
        
        @keyframes bar-wave {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(wave);
  }
}

// Export singleton instance
const animator = new Animator();
export default animator;
