// Firebase auth module
class Auth {
  constructor() {
    this.auth = firebase.auth();
    this.currentUser = null;

    // Listen for auth state changes
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      if (user) {
        console.log('Auth.js: User logged in:', user.uid);
        // Store current user in a global variable for easier access
        window._currentUser = user;
        
        // Update UI when user logs in
        this._updateUIForLoggedInUser(user);
        // Create user profile in database if it doesn't exist
        this._createUserProfileIfNeeded(user);
        
        // Dispatch custom event for other scripts to react to
        document.dispatchEvent(new CustomEvent('blackReaperUserLoggedIn', { detail: { user } }));
      } else {
        console.log('Auth.js: User logged out');
        // Clear global user variable
        window._currentUser = null;
        
        // Update UI when user logs out
        this._updateUIForLoggedOutUser();
        
        // Dispatch custom event for other scripts to react to
        document.dispatchEvent(new CustomEvent('blackReaperUserLoggedOut'));
      }
    });
  }

  // Create a new user with email and password
  async registerWithEmail(email, password, displayName) {
    try {
      const credential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Update the user profile with the display name
      await credential.user.updateProfile({ displayName });
      
      // Create user data in RTDB
      const db = firebase.database();
      const userRef = db.ref(`users/${credential.user.uid}`);
      
      const userData = {
        displayName,
        email,
        isAnonymous: false,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lastLogin: firebase.database.ServerValue.TIMESTAMP,
        rcCells: 100, // Starting RC cells
        mode: 'human', // Default mode
        stats: {
          tasksCompleted: 0,
          pomodorosCompleted: 0,
          battlesWon: 0,
          battlesLost: 0,
          journalEntries: 0
        },
        profile: {
          bio: '',
          avatar: '',
          level: 1,
          experience: 0,
          achievements: []
        }
      };
      
      await userRef.set(userData);
      console.log('User profile created in RTDB');
      
      return credential.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async loginWithEmail(email, password) {
    try {
      const credential = await this.auth.signInWithEmailAndPassword(email, password);
      return credential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Sign in anonymously (Guest mode)
  async loginAnonymously() {
    try {
      const credential = await this.auth.signInAnonymously();
      return credential.user;
    } catch (error) {
      console.error('Error with anonymous login:', error);
      throw error;
    }
  }

  // Sign out
  async logout() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser || firebase.auth().currentUser;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!(this.currentUser || firebase.auth().currentUser);
  }

  // Check if user is anonymous (Guest mode)
  isAnonymous() {
    return this.currentUser?.isAnonymous || false;
  }

  // Create user profile in database if it doesn't exist
  async _createUserProfileIfNeeded(user) {
    const db = firebase.database();
    const userRef = db.ref(`users/${user.uid}`);
    
    try {
      console.log('Checking if user profile exists for:', user.uid);
      
      // Check if the profile already exists
      const snapshot = await userRef.once('value');
      
      if (!snapshot.exists()) {
        console.log('User profile does not exist, creating new profile');
        
        // Create a new user profile
        const isAnonymous = user.isAnonymous;
        const displayName = user.displayName || (isAnonymous ? `Ghoul-${Math.floor(Math.random() * 10000)}` : 'Human');
        
        // Default user data
        const userData = {
          displayName,
          email: user.email || '',
          isAnonymous,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          lastLogin: firebase.database.ServerValue.TIMESTAMP,
          rcCells: 100, // Starting RC cells
          mode: 'human', // Default mode
          stats: {
            tasksCompleted: 0,
            pomodorosCompleted: 0,
            battlesWon: 0,
            battlesLost: 0,
            journalEntries: 0
          },
          profile: {
            bio: '',
            avatar: '',
            level: 1,
            experience: 0,
            achievements: []
          }
        };
        
        // Log the data we're about to save
        console.log('Creating user profile with data:', userData);
        
        try {
          // Set data
          await userRef.set(userData);
          console.log('User profile created successfully');
          
          // Verify data was written
          const verifySnapshot = await userRef.once('value');
          if (verifySnapshot.exists()) {
            console.log('Verified: User profile exists after creation');
          } else {
            console.error('Failed to verify user profile creation');
          }
        } catch (writeError) {
          console.error('Error writing user profile:', writeError);
          throw writeError;
        }
      } else {
        console.log('User profile exists, updating last login time');
        
        // Check if profile has all required fields and add any that are missing
        const userData = snapshot.val();
        const updates = { lastLogin: firebase.database.ServerValue.TIMESTAMP };
        
        if (!userData.profile) {
          console.log('Adding missing profile field');
          updates.profile = {
            bio: '',
            avatar: '',
            level: 1,
            experience: 0,
            achievements: []
          };
        }
        
        if (!userData.stats) {
          console.log('Adding missing stats field');
          updates.stats = {
            tasksCompleted: 0,
            pomodorosCompleted: 0,
            battlesWon: 0,
            battlesLost: 0,
            journalEntries: 0
          };
        }
        
        // Update the user profile with any missing fields and last login time
        await userRef.update(updates);
        console.log('User profile updated');
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      console.error('Error details:', error.code, error.message);
    }
  }

  // Update UI for logged-in user
  async _updateUIForLoggedInUser(user) {
    // Hide login/register forms
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => form.style.display = 'none');
    
    // Show user-specific elements
    const userElements = document.querySelectorAll('.user-specific');
    userElements.forEach(el => el.style.display = 'block');
    
    // Get user data from RTDB
    const db = firebase.database();
    try {
      const snapshot = await db.ref(`users/${user.uid}`).once('value');
      const userData = snapshot.val() || {};
      
      // Update user name in UI
      const userNameElements = document.querySelectorAll('.user-name');
      const displayName = userData.displayName || user.displayName || (user.isAnonymous ? 'Guest Ghoul' : 'Human');
      userNameElements.forEach(el => el.textContent = displayName);
      
      // Update RC cells count if element exists
      const rcCellsElements = document.querySelectorAll('.rc-cells-count');
      if (rcCellsElements.length > 0) {
        const rcCells = userData.rcCells || 100;
        rcCellsElements.forEach(el => el.textContent = rcCells);
      }
      
      // Set user mode
      if (userData.mode) {
        document.body.className = userData.mode === 'ghoul' ? 'ghoul-mode' : 'human-mode';
        // Update theme toggle if it exists
        const toggleBtn = document.getElementById('mode-toggle-btn');
        if (toggleBtn) {
          const knob = toggleBtn.querySelector('.mode-toggle-knob');
          const iconActive = toggleBtn.querySelector('.mode-icon-active');
          const humanIcon = toggleBtn.querySelector('.human-icon');
          const ghoulIcon = toggleBtn.querySelector('.ghoul-icon');
          
          if (userData.mode === 'ghoul') {
            if (knob) knob.style.transform = 'translateX(66px)';
            if (iconActive) iconActive.innerHTML = '<i class="fas fa-mask"></i>';
            if (humanIcon) humanIcon.style.opacity = '0.5';
            if (ghoulIcon) ghoulIcon.style.opacity = '1';
          } else {
            if (knob) knob.style.transform = 'translateX(0)';
            if (iconActive) iconActive.innerHTML = '<i class="fas fa-user"></i>';
            if (humanIcon) humanIcon.style.opacity = '1';
            if (ghoulIcon) ghoulIcon.style.opacity = '0.5';
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching user data from RTDB:', error);
    }
    
    // Display logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    // Dispatch event for other components to react
    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));
  }

  // Update UI for logged-out user
  _updateUIForLoggedOutUser() {
    // Show login/register forms
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => form.style.display = 'block');
    
    // Hide user-specific elements
    const userElements = document.querySelectorAll('.user-specific');
    userElements.forEach(el => el.style.display = 'none');
    
    // Hide logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    // Dispatch event for other components to react
    document.dispatchEvent(new CustomEvent('userLoggedOut'));
  }
}

// Export the Auth instance
const auth = new Auth();
window.auth = auth;
