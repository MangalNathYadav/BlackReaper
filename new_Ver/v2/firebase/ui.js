/**
 * BlackReaper v2 - Firebase UI Helper
 * Provides UI functionality for Firebase authentication
 */

window.firebaseUI = {
  /**
   * Initialize authentication forms
   * @param {Object} options - Configuration options
   */
  initAuthForms: (options = {}) => {
    const defaults = {
      loginForm: '#login-form',
      signupForm: '#signup-form',
      resetForm: '#reset-form',
      errorContainer: '.auth-error',
      successContainer: '.auth-success',
      onLoginSuccess: null,
      onSignupSuccess: null,
      onResetSuccess: null
    };
    
    const config = { ...defaults, ...options };
    
    // Login form
    const loginForm = document.querySelector(config.loginForm);
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const errorContainer = loginForm.querySelector(config.errorContainer);
        
        try {
          // Clear previous errors
          errorContainer.textContent = '';
          errorContainer.style.display = 'none';
          
          // Show loading state
          loginForm.classList.add('loading');
          
          // Sign in
          await auth.signIn(email, password);
          
          // Call success callback if provided
          if (typeof config.onLoginSuccess === 'function') {
            config.onLoginSuccess();
          }
          
          // Redirect to dashboard if no callback provided
          else if (window.location.pathname.includes('index.html') || 
                  window.location.pathname === '/' || 
                  window.location.pathname.endsWith('/')) {
            window.location.href = 'dashboard.html';
          }
        } catch (error) {
          // Show error
          errorContainer.textContent = firebaseUI.getErrorMessage(error);
          errorContainer.style.display = 'block';
        } finally {
          // Remove loading state
          loginForm.classList.remove('loading');
        }
      });
    }
    
    // Signup form
    const signupForm = document.querySelector(config.signupForm);
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const confirmPassword = signupForm.querySelector('input[name="confirm-password"]').value;
        const errorContainer = signupForm.querySelector(config.errorContainer);
        
        try {
          // Clear previous errors
          errorContainer.textContent = '';
          errorContainer.style.display = 'none';
          
          // Password validation
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
          }
          
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          
          // Show loading state
          signupForm.classList.add('loading');
          
          // Sign up
          await auth.signUp(email, password);
          
          // Call success callback if provided
          if (typeof config.onSignupSuccess === 'function') {
            config.onSignupSuccess();
          }
          
          // Redirect to dashboard if no callback provided
          else if (window.location.pathname.includes('index.html') || 
                  window.location.pathname === '/' || 
                  window.location.pathname.endsWith('/')) {
            window.location.href = 'dashboard.html';
          }
        } catch (error) {
          // Show error
          errorContainer.textContent = firebaseUI.getErrorMessage(error);
          errorContainer.style.display = 'block';
        } finally {
          // Remove loading state
          signupForm.classList.remove('loading');
        }
      });
    }
    
    // Password reset form
    const resetForm = document.querySelector(config.resetForm);
    if (resetForm) {
      resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = resetForm.querySelector('input[type="email"]').value;
        const errorContainer = resetForm.querySelector(config.errorContainer);
        const successContainer = resetForm.querySelector(config.successContainer);
        
        try {
          // Clear previous messages
          errorContainer.textContent = '';
          errorContainer.style.display = 'none';
          successContainer.textContent = '';
          successContainer.style.display = 'none';
          
          // Show loading state
          resetForm.classList.add('loading');
          
          // Send reset email
          await auth.resetPassword(email);
          
          // Show success message
          successContainer.textContent = 'Password reset email sent. Check your inbox.';
          successContainer.style.display = 'block';
          
          // Call success callback if provided
          if (typeof config.onResetSuccess === 'function') {
            config.onResetSuccess();
          }
        } catch (error) {
          // Show error
          errorContainer.textContent = firebaseUI.getErrorMessage(error);
          errorContainer.style.display = 'block';
        } finally {
          // Remove loading state
          resetForm.classList.remove('loading');
        }
      });
    }
  },
  
  /**
   * Get user-friendly error message from Firebase error
   * @param {Error} error - Firebase error
   * @returns {string} User-friendly error message
   */
  getErrorMessage: (error) => {
    // Map common Firebase error codes to user-friendly messages
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later.'
    };
    
    // Get error code from Firebase error
    const errorCode = error.code || '';
    
    // Return mapped message or default message
    return errorMessages[errorCode] || error.message || 'An error occurred. Please try again.';
  },
  
  /**
   * Initialize auth tab switching
   * @param {string} tabContainer - Selector for tab container
   * @param {string} contentContainer - Selector for content container
   */
  initAuthTabs: (tabContainer = '.auth-tabs', contentContainer = '.auth-content') => {
    const tabs = document.querySelectorAll(`${tabContainer} .auth-tab`);
    const contents = document.querySelectorAll(`${contentContainer} .auth-form`);
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Get target form id
        const target = tab.getAttribute('data-target');
        
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Add active class to current tab and content
        tab.classList.add('active');
        document.querySelector(`#${target}`).classList.add('active');
        
        // Play tab switch sound if available
        if (window.audio && window.audio.playSound) {
          window.audio.playSound('tab-switch');
        }
      });
    });
  }
};
