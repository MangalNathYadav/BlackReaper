/**
 * BlackReaper v2 - Transformation Animation
 * Handles the Tokyo Ghoul transformation animation sequence
 */

document.addEventListener('DOMContentLoaded', () => {
  // Animation elements
  const transformationOverlay = document.getElementById('transformation-overlay');
  const frameSequence = document.getElementById('frame-sequence');
  const animationCaption = document.getElementById('animation-caption');
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  
  // Animation settings
  const ANIMATION = {
    totalFrames: 23,
    frameDuration: 120, // ms per frame
    // Using direct path to animation_sprites folder with fallback options
    framesPath: detectFramesPath()
  };
  
  // Function to detect the correct path to animation frames
  function detectFramesPath() {
    const possiblePaths = [
      '../../animation_sprites/',  // Relative from v2/assets/js to root/animation_sprites
      '../../../animation_sprites/', // Alternative path
      './animation_sprites/'        // Direct path if folder is moved
    ];
    
    console.log('Detecting animation frames path...');
    
    // Try to load a test image from each path
    for (const path of possiblePaths) {
      const testImage = new Image();
      testImage.src = path + 'frame1.png';
      
      console.log(`Testing path: ${path}`);
      
      // If image loads successfully, use this path
      if (testImage.complete) {
        console.log(`✅ Found valid animation path: ${path}`);
        return path;
      }
    }
    
    // Default path if none work
    console.warn('⚠️ Could not validate animation path, using default path');
    return '../../animation_sprites/';
  
  let currentFrame = 1;
  let animationInterval;
  let isAnimating = false;
  
  // Frame captions based on animation progress
  const captions = {
    1: "Becoming Ghoul",
    5: "Power Awakening",
    8: "Kagune Forming",
    12: "Transformation Beginning",
    16: "The Eyepatch Ghoul",
    20: "BLACK REAPER RISING"
  };
  
  // Initialize animation frames
  function initFrames() {
    console.log('Initializing animation frames...');
    
    if (!frameSequence) {
      console.error('Error: Frame sequence element not found');
      return;
    }
    
    // Clear any existing frames
    frameSequence.innerHTML = '';
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'animation-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'animation-progress-bar';
    progressContainer.appendChild(progressBar);
    frameSequence.appendChild(progressContainer);
    
    console.log(`Using animation path: ${ANIMATION.framesPath}`);
    
    // Counter for successful loads
    let successfulLoads = 0;
    
    // Preload all frames
    for (let i = 1; i <= ANIMATION.totalFrames; i++) {
      const frame = document.createElement('img');
      frame.className = 'animation-frame';
      const frameSrc = `${ANIMATION.framesPath}frame${i}.png`;
      frame.src = frameSrc;
      frame.alt = `Transformation frame ${i}`;
      console.log(`Loading frame ${i} from: ${frameSrc}`);
      
      frame.onload = () => {
        console.log(`✅ Frame ${i} loaded successfully from ${frameSrc}`);
        successfulLoads++;
        
        // Check if all frames loaded successfully
        if (successfulLoads === ANIMATION.totalFrames) {
          console.log('✅ All animation frames loaded successfully');
        }
      };
      
      frame.onerror = (e) => {
        console.error(`❌ Error loading frame ${i} from ${frameSrc}`);
        console.error(e);
        
        // Try alternate path as fallback
        const alternateFrameSrc = `../../../animation_sprites/frame${i}.png`;
        console.log(`Trying alternate path: ${alternateFrameSrc}`);
        frame.src = alternateFrameSrc;
      };
      
      frameSequence.appendChild(frame);
    }
  }
  
  // Play the transformation animation
  function playTransformation(toGhoulMode = true) {
    if (isAnimating) return;
    isAnimating = true;
    
    console.log(`Starting transformation animation, toGhoulMode=${toGhoulMode}`);
    
    // Reset animation state
    currentFrame = 1;
    
    // Set initial caption
    if (captions[1]) {
      animationCaption.textContent = captions[1];
    } else {
      animationCaption.textContent = "Transforming...";
    }
    
    // Show overlay
    transformationOverlay.classList.add('active');
    
    // Get frames and progress bar
    const frames = frameSequence.querySelectorAll('.animation-frame');
    const progressBar = frameSequence.querySelector('.animation-progress-bar');
    
    // Make sure first frame is active
    frames.forEach(frame => frame.classList.remove('active'));
    frames[0].classList.add('active');
    
    // Play audio if available
    try {
      const audioFile = toGhoulMode ? 
        '../assets/audio/kagune-activate.mp3' : 
        '../assets/audio/kagune-deactivate.mp3';
        
      const audio = new Audio(audioFile);
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio not available:', err);
    }
    
    // Start animation sequence
    animationInterval = setInterval(() => {
      // Hide previous frame
      frames[currentFrame - 1].classList.remove('active');
      
      // Move to next frame
      currentFrame++;
      
      console.log(`Animation frame: ${currentFrame}/${ANIMATION.totalFrames}`);
      
      // Update progress
      const progressPercentage = (currentFrame / ANIMATION.totalFrames) * 100;
      progressBar.style.width = `${progressPercentage}%`;
      
      // Update caption at key frames
      if (captions[currentFrame]) {
        animationCaption.textContent = captions[currentFrame];
        // Add caption change effect
        animationCaption.classList.add('caption-change');
        setTimeout(() => {
          animationCaption.classList.remove('caption-change');
        }, 300);
      }
      
      // Show current frame
      if (currentFrame <= ANIMATION.totalFrames) {
        frames[currentFrame - 1].classList.add('active');
      } else {
        // Animation complete
        clearInterval(animationInterval);
        
        // Apply theme change
        if (toGhoulMode) {
          document.body.classList.remove('human-mode');
          document.body.classList.add('ghoul-mode');
        } else {
          document.body.classList.remove('ghoul-mode');
          document.body.classList.add('human-mode');
        }
        
        console.log('Transformation animation complete');
        
        // Hide overlay after a brief pause
        setTimeout(() => {
          transformationOverlay.classList.remove('active');
          isAnimating = false;
        }, 500);
      }
    }, ANIMATION.frameDuration);
  }
  
  // Toggle theme button event
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      const toGhoulMode = document.body.classList.contains('human-mode');
      console.log(`Mode toggle clicked, current mode: ${toGhoulMode ? 'human' : 'ghoul'}`);
      playTransformation(toGhoulMode);
    });
  }
  
  // Function to validate frames are available
  function validateFrames() {
    console.log('Validating frame availability...');
    console.log(`Using animation path: ${ANIMATION.framesPath}`);
    
    const missingFrames = [];
    let loadedFrames = 0;
    const totalToCheck = ANIMATION.totalFrames;
    
    function checkCompletion() {
      if (loadedFrames + missingFrames.length === totalToCheck) {
        if (missingFrames.length > 0) {
          console.error(`❌ Missing frames: ${missingFrames.join(', ')}`);
          console.error(`Animation may not work correctly. Check that images exist in: ${ANIMATION.framesPath}`);
        } else {
          console.log(`✅ All ${totalToCheck} frames validated successfully`);
        }
      }
    }
    
    for (let i = 1; i <= totalToCheck; i++) {
      const img = new Image();
      const frameSrc = `${ANIMATION.framesPath}frame${i}.png`;
      img.src = frameSrc;
      
      img.onload = () => {
        console.log(`✓ Frame ${i} exists`);
        loadedFrames++;
        checkCompletion();
      };
      
      img.onerror = () => {
        console.error(`✗ Frame ${i} missing at ${frameSrc}`);
        missingFrames.push(i);
        checkCompletion();
      };
    }
  }
  
  // Initialize frames on page load
  initFrames();
  
  // Log initialization message
  console.log('Transformation animation initialized and connected to mode toggle button');
  
  // Validate frames availability after a delay to ensure DOM is fully loaded
  setTimeout(validateFrames, 1000);
}});
