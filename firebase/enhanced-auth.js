/**
 * Enhanced Firebase Authentication Module
 * Handles user authentication with improved UI/UX, social logins, and verification
 * 
 * @version 2.0.0
 * @updated August 6, 2025
 */

// Get auth reference
const auth = firebase.auth();

// Set persistence to LOCAL by default (user stays logged in across browser sessions)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(error => {
    console.error("Authentication persistence error:", error);
  });

// DOM Elements for auth (if on index page)
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
const showForgotPasswordLink = document.getElementById('show-forgot-password');
const showLoginFromForgotLink = document.getElementById('show-login-from-forgot');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const resetPasswordButton = document.getElementById('reset-password-button');
const anonymousLoginButton = document.getElementById('anonymous-login');
const googleLoginButton = document.getElementById('google-login');
const twitterLoginButton = document.getElementById('twitter-login');
const logoutBtn = document.getElementById('logout-btn');
const passwordStrengthIndicator = document.getElementById('password-strength');
const authContainer = document.getElementById('auth-container');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// User variables
let currentUser = null;
let userProfile = null;

// Event listeners for auth UI
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the index page
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/') ||
                        window.location.pathname === '';
                        
    if (isIndexPage) {
        setupAuthUI();
        addKaguneDecorations();
        addBloodDripEffects();
    }
    
    // Check auth state on all pages
    auth.onAuthStateChanged(handleAuthStateChange);
    
    // Logout button (on pages other than index)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
});

// Setup authentication UI with enhanced UX
function setupAuthUI() {
    // Show login form by default
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    
    // Toggle between forms with smooth transitions
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchForms('login');
        });
    }
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchForms('signup');
        });
    }
    
    if (showForgotPasswordLink) {
        showForgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchForms('forgot');
        });
    }
    
    if (showLoginFromForgotLink) {
        showLoginFromForgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchForms('login');
        });
    }
    
    // Login button
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    
    // Signup button
    if (signupButton) {
        signupButton.addEventListener('click', handleSignup);
    }
    
    // Reset password button
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', handlePasswordReset);
    }
    
    // Anonymous login
    if (anonymousLoginButton) {
        anonymousLoginButton.addEventListener('click', handleAnonymousLogin);
    }
    
    // Social logins
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', handleGoogleLogin);
    }
    
    if (twitterLoginButton) {
        twitterLoginButton.addEventListener('click', handleTwitterLogin);
    }
    
    // Password strength meter
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput && passwordStrengthIndicator) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Toggle password visibility
    if (togglePasswordButtons) {
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', togglePasswordVisibility);
        });
    }
    
    // Add Enter key support for forms
    addEnterKeySupport();
}

// Switch between different forms with animation
function switchForms(formType) {
    // Hide all forms first
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    
    // Show requested form
    switch(formType) {
        case 'login':
            if (loginForm) loginForm.classList.remove('hidden');
            break;
        case 'signup':
            if (signupForm) signupForm.classList.remove('hidden');
            break;
        case 'forgot':
            if (forgotPasswordForm) forgotPasswordForm.classList.remove('hidden');
            break;
    }
    
    // Add glitch effect for transition
    applyGlitchEffect();
}

// Add kagune decorations to auth container
function addKaguneDecorations() {
    if (!authContainer) return;
    
    const kaguneLeft = document.createElement('div');
    kaguneLeft.className = 'kagune-decoration kagune-left';
    
    const kaguneRight = document.createElement('div');
    kaguneRight.className = 'kagune-decoration kagune-right';
    
    authContainer.appendChild(kaguneLeft);
    authContainer.appendChild(kaguneRight);
}

// Add blood drip effects for ghoul mode
function addBloodDripEffects() {
    if (!authContainer) return;
    
    for (let i = 0; i < 4; i++) {
        const bloodDrip = document.createElement('div');
        bloodDrip.className = 'blood-drip';
        authContainer.appendChild(bloodDrip);
    }
}

// Add Enter key support for forms
function addEnterKeySupport() {
    const inputs = document.querySelectorAll('.auth-form input');
    
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = input.closest('.auth-form');
                
                if (form && form.id === 'login-form') {
                    handleLogin();
                } else if (form && form.id === 'signup-form') {
                    handleSignup();
                } else if (form && form.id === 'forgot-password-form') {
                    handlePasswordReset();
                }
            }
        });
    });
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const inputId = button.getAttribute('data-for');
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Update password strength meter
function updatePasswordStrength() {
    const password = document.getElementById('signup-password').value;
    const strengthIndicator = document.getElementById('password-strength');
    
    if (!password || !strengthIndicator) return;
    
    // Clear previous classes
    strengthIndicator.className = 'password-strength';
    
    // Check password strength
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const strength = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars, isLongEnough]
                     .filter(Boolean).length;
    
    // Update UI based on strength
    if (password.length === 0) {
        strengthIndicator.classList.add('empty');
    } else if (strength <= 2) {
        strengthIndicator.classList.add('weak');
        document.getElementById('password-feedback').textContent = "Password is weak";
    } else if (strength === 3) {
        strengthIndicator.classList.add('medium');
        document.getElementById('password-feedback').textContent = "Password is medium strength";
    } else if (strength === 4) {
        strengthIndicator.classList.add('strong');
        document.getElementById('password-feedback').textContent = "Password is strong";
    } else {
        strengthIndicator.classList.add('very-strong');
        document.getElementById('password-feedback').textContent = "Password is very strong";
    }
}

// Handle login form submission
function handleLogin() {
    // Show loading state
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="loader"></span> Logging in...';
    }
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showAuthError('Please enter both email and password.');
        resetLoginButton();
        return;
    }
    
    // Use Firebase Auth
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            
            // Check if email is verified
            if (!user.emailVerified && !user.isAnonymous) {
                showAuthError('Please verify your email before logging in. Check your inbox.');
                resetLoginButton();
                
                // Send verification email again
                user.sendEmailVerification().then(() => {
                    showAuthSuccess('A new verification email has been sent.');
                });
                
                // Sign out the user
                auth.signOut();
                return;
            }
            
            createNotification("Login Successful", "Welcome back to BlackReaper", "success");
            playSound('kagune.mp3');
            
            // Redirect to dashboard after short delay for notification visibility
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            console.error("Login error:", error);
            let errorMessage = "Login failed. Please check your email and password.";
            
            // Provide specific error messages
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email. Please sign up first.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed login attempts. Please try again later or reset your password.";
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = "This account has been disabled. Please contact support.";
            }
            
            showAuthError(errorMessage);
            resetLoginButton();
            
            // Apply glitch effect for error
            applyGlitchEffect(true);
        });
}

// Reset login button to default state
function resetLoginButton() {
    if (loginButton) {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Login';
    }
}

// Handle signup form submission with enhanced validation
function handleSignup() {
    // Show loading state
    if (signupButton) {
        signupButton.disabled = true;
        signupButton.innerHTML = '<span class="loader"></span> Creating account...';
    }
    
    const nickname = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;
    
    // Enhanced validation
    if (!nickname || !email || !password) {
        showAuthError('Please fill out all required fields.');
        resetSignupButton();
        return;
    }
    
    if (nickname.length < 3) {
        showAuthError('Nickname must be at least 3 characters long.');
        resetSignupButton();
        return;
    }
    
    if (confirmPassword && password !== confirmPassword) {
        showAuthError('Passwords do not match.');
        resetSignupButton();
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters.');
        resetSignupButton();
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthError('Please enter a valid email address.');
        resetSignupButton();
        return;
    }
    
    // Use Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            
            // Send email verification
            return user.sendEmailVerification().then(() => {
                // Update user profile with nickname
                return user.updateProfile({
                    displayName: nickname
                });
            }).then(() => {
                // Create user document in database with enhanced initial data
                return firebase.database().ref('users/' + user.uid).set({
                    nickname: nickname,
                    email: email,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    profileCompleted: false,
                    rcCells: 100, // Starting RC cells
                    level: 1,
                    mode: 'human', // Default mode
                    threat: {
                        level: 'C',
                        points: 0
                    },
                    stats: {
                        tasksCompleted: 0,
                        journalEntries: 0,
                        battlesWon: 0,
                        battlesLost: 0,
                        timeInGhoulMode: 0
                    },
                    unlocks: {
                        rinkaku: true, // First kagune type unlocked by default
                        ukaku: false,
                        koukaku: false,
                        bikaku: false
                    },
                    achievements: {
                        firstLogin: {
                            earned: true,
                            date: firebase.database.ServerValue.TIMESTAMP
                        },
                        firstJournal: {
                            earned: false,
                            date: null
                        },
                        ghoulAwakening: {
                            earned: false,
                            date: null
                        }
                    },
                    settings: {
                        autoGhoulMode: true,
                        notificationsEnabled: true,
                        soundEnabled: true
                    }
                });
            });
        })
        .then(() => {
            showAuthSuccess('Account created! Please check your email to verify your account.');
            resetSignupButton();
            
            // Show login form after short delay
            setTimeout(() => {
                switchForms('login');
            }, 3000);
        })
        .catch((error) => {
            console.error("Signup error:", error);
            let errorMessage = "Failed to create account. Please try again.";
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Email is already in use. Please login instead.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Use at least 6 characters.";
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = "Email/password accounts are not enabled. Please contact support.";
            }
            
            showAuthError(errorMessage);
            resetSignupButton();
            
            // Apply glitch effect for error
            applyGlitchEffect(true);
        });
}

// Reset signup button to default state
function resetSignupButton() {
    if (signupButton) {
        signupButton.disabled = false;
        signupButton.innerHTML = 'Sign Up';
    }
}

// Handle password reset with enhanced feedback
function handlePasswordReset() {
    if (resetPasswordButton) {
        resetPasswordButton.disabled = true;
        resetPasswordButton.innerHTML = '<span class="loader"></span> Sending...';
    }

    const email = document.getElementById('forgot-email').value;
    
    if (!email) {
        showAuthError('Please enter your email address.');
        resetResetPasswordButton();
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthError('Please enter a valid email address.');
        resetResetPasswordButton();
        return;
    }

    // Use Firebase Auth
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showAuthSuccess('Password reset email sent! Check your inbox.');
            resetResetPasswordButton();
        })
        .catch((error) => {
            console.error("Password reset error:", error);
            let errorMessage = "Failed to send password reset email. Please try again.";
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email. Please sign up first.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address format.";
            }
            
            showAuthError(errorMessage);
            resetResetPasswordButton();
        });
}

// Reset password reset button to default state
function resetResetPasswordButton() {
    if (resetPasswordButton) {
        resetPasswordButton.disabled = false;
        resetPasswordButton.innerHTML = 'Reset Password';
    }
}

// Handle anonymous login
function handleAnonymousLogin() {
    if (anonymousLoginButton) {
        anonymousLoginButton.disabled = true;
        anonymousLoginButton.innerHTML = '<span class="loader"></span> Continuing as guest...';
    }

    // Use Firebase Auth
    auth.signInAnonymously()
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Generate a random nickname for the anonymous user
            const randomNickname = generateAnonymousNickname();
            
            // Update profile with random nickname
            return user.updateProfile({
                displayName: randomNickname
            }).then(() => {
                // Create user document in database
                return firebase.database().ref('users/' + user.uid).set({
                    nickname: randomNickname,
                    isAnonymous: true,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    rcCells: 100, // Starting RC cells
                    level: 1,
                    mode: 'human', // Default mode
                    threat: {
                        level: 'C',
                        points: 0
                    },
                    stats: {
                        tasksCompleted: 0,
                        journalEntries: 0,
                        battlesWon: 0,
                        battlesLost: 0,
                        timeInGhoulMode: 0
                    },
                    unlocks: {
                        rinkaku: true, // First kagune type unlocked by default
                        ukaku: false,
                        koukaku: false,
                        bikaku: false
                    }
                });
            });
        })
        .then(() => {
            createNotification("Guest Access", "Welcome to BlackReaper. Your data will be lost when you log out.", "info");
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch((error) => {
            console.error("Anonymous login error:", error);
            showAuthError("Failed to continue as guest. Please try again.");
            
            if (anonymousLoginButton) {
                anonymousLoginButton.disabled = false;
                anonymousLoginButton.innerHTML = 'Continue as Guest';
            }
        });
}

// Handle Google login
function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create user document for new Google users
                return firebase.database().ref('users/' + user.uid).set({
                    nickname: user.displayName,
                    email: user.email,
                    profilePicture: user.photoURL,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    profileCompleted: true,
                    rcCells: 150, // Extra starting RC cells for social login
                    level: 1,
                    mode: 'human', // Default mode
                    threat: {
                        level: 'C',
                        points: 0
                    },
                    stats: {
                        tasksCompleted: 0,
                        journalEntries: 0,
                        battlesWon: 0,
                        battlesLost: 0,
                        timeInGhoulMode: 0
                    },
                    unlocks: {
                        rinkaku: true, // First kagune type unlocked by default
                        ukaku: false,
                        koukaku: false,
                        bikaku: false
                    },
                    loginMethod: 'google'
                });
            } else {
                // Update last login for existing users
                return firebase.database().ref('users/' + user.uid + '/lastLogin')
                    .set(firebase.database.ServerValue.TIMESTAMP);
            }
        })
        .then(() => {
            createNotification("Login Successful", "Welcome to BlackReaper", "success");
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            console.error("Google login error:", error);
            showAuthError("Google login failed. Please try again.");
        });
}

// Handle Twitter login
function handleTwitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create user document for new Twitter users
                return firebase.database().ref('users/' + user.uid).set({
                    nickname: user.displayName,
                    profilePicture: user.photoURL,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    profileCompleted: true,
                    rcCells: 150, // Extra starting RC cells for social login
                    level: 1,
                    mode: 'human', // Default mode
                    threat: {
                        level: 'C',
                        points: 0
                    },
                    stats: {
                        tasksCompleted: 0,
                        journalEntries: 0,
                        battlesWon: 0,
                        battlesLost: 0,
                        timeInGhoulMode: 0
                    },
                    unlocks: {
                        rinkaku: true, // First kagune type unlocked by default
                        ukaku: false,
                        koukaku: false,
                        bikaku: false
                    },
                    loginMethod: 'twitter'
                });
            } else {
                // Update last login for existing users
                return firebase.database().ref('users/' + user.uid + '/lastLogin')
                    .set(firebase.database.ServerValue.TIMESTAMP);
            }
        })
        .then(() => {
            createNotification("Login Successful", "Welcome to BlackReaper", "success");
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            console.error("Twitter login error:", error);
            showAuthError("Twitter login failed. Please try again.");
        });
}

// Generate a random nickname for anonymous users
function generateAnonymousNickname() {
    const prefixes = ["Unknown", "Masked", "Shadow", "Hidden", "Faceless", "Nameless", "Ghost", "Phantom"];
    const suffixes = ["Ghoul", "Investigator", "Wanderer", "Observer", "Spectator", "Hunter", "Visitor"];
    const randomNum = Math.floor(Math.random() * 1000);
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}${suffix}${randomNum}`;
}

// Handle auth state changes
function handleAuthStateChange(user) {
    currentUser = user;
    
    if (user) {
        console.log("User is signed in:", user.uid);
        
        // Update last login time for the user
        if (!user.isAnonymous) {
            firebase.database().ref('users/' + user.uid + '/lastLogin')
                .set(firebase.database.ServerValue.TIMESTAMP);
        }
        
        // If on index page, redirect to dashboard
        if (window.location.pathname.endsWith('index.html') || 
            window.location.pathname.endsWith('/') ||
            window.location.pathname === '') {
            
            window.location.href = 'dashboard.html';
        }
        
        // Load user profile data
        loadUserProfile(user);
        
    } else {
        console.log("User is signed out");
        
        // If not on index page, redirect to login
        const isIndexPage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('/') ||
                          window.location.pathname === '';
                          
        if (!isIndexPage) {
            window.location.href = 'index.html';
        }
    }
}

// Load user profile data from database
function loadUserProfile(user) {
    if (!user) return;
    
    firebase.database().ref('users/' + user.uid)
        .once('value')
        .then((snapshot) => {
            userProfile = snapshot.val();
            
            if (userProfile) {
                // Dispatch an event that the user profile is loaded
                const event = new CustomEvent('userProfileLoaded', {
                    detail: { profile: userProfile }
                });
                document.dispatchEvent(event);
                
                // Update UI elements with user data
                updateUserUI(userProfile);
            }
        })
        .catch((error) => {
            console.error("Error loading user profile:", error);
        });
}

// Update UI elements with user data
function updateUserUI(profile) {
    // Update user nickname on pages
    const nicknameElements = document.querySelectorAll('.user-nickname, #user-nickname');
    nicknameElements.forEach(el => {
        if (el) el.textContent = profile.nickname;
    });
    
    // Update RC cell display
    const rcLevelElement = document.getElementById('rc-level');
    if (rcLevelElement && profile.rcCells) {
        rcLevelElement.textContent = profile.rcCells;
    }
    
    // Update RC meter
    const rcMeterFill = document.querySelector('.rc-meter-fill');
    if (rcMeterFill && profile.rcCells) {
        // Calculate percentage (max at 1000 RC cells)
        const percentage = Math.min(profile.rcCells / 1000 * 100, 100);
        rcMeterFill.style.width = `${percentage}%`;
    }
    
    // Set theme based on user preference
    if (profile.mode === 'ghoul') {
        document.body.classList.add('ghoul-mode');
        const modeToggle = document.getElementById('mode-toggle');
        if (modeToggle) modeToggle.checked = true;
    }
}

// Logout user
function logoutUser() {
    auth.signOut()
        .then(() => {
            // Clear any local user data
            localStorage.removeItem('rcCellCount');
            
            createNotification("Logged Out", "You have been logged out", "info");
            
            // Redirect to index page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        })
        .catch((error) => {
            console.error("Logout error:", error);
            createNotification("Error", "Failed to log out. Please try again.", "error");
        });
}

// Show auth error message
function showAuthError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.auth-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.textContent = message;
    
    // Find the active form
    let activeForm;
    if (loginForm && !loginForm.classList.contains('hidden')) {
        activeForm = loginForm;
    } else if (signupForm && !signupForm.classList.contains('hidden')) {
        activeForm = signupForm;
    } else if (forgotPasswordForm && !forgotPasswordForm.classList.contains('hidden')) {
        activeForm = forgotPasswordForm;
    }
    
    // Insert error message at the top of the active form
    if (activeForm) {
        activeForm.insertBefore(errorElement, activeForm.firstChild);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('fade-out');
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, 500);
        }, 5000);
    }
}

// Show auth success message
function showAuthSuccess(message) {
    // Remove any existing message
    const existingMessage = document.querySelector('.auth-success');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success element
    const successElement = document.createElement('div');
    successElement.className = 'auth-success';
    successElement.textContent = message;
    
    // Find the active form
    let activeForm;
    if (loginForm && !loginForm.classList.contains('hidden')) {
        activeForm = loginForm;
    } else if (signupForm && !signupForm.classList.contains('hidden')) {
        activeForm = signupForm;
    } else if (forgotPasswordForm && !forgotPasswordForm.classList.contains('hidden')) {
        activeForm = forgotPasswordForm;
    }
    
    // Insert success message at the top of the active form
    if (activeForm) {
        activeForm.insertBefore(successElement, activeForm.firstChild);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successElement.classList.add('fade-out');
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 500);
        }, 5000);
    }
}

// Play a sound effect if available
function playSound(soundName) {
    try {
        if (typeof window.BlackReaper !== 'undefined' && typeof window.BlackReaper.playSound === 'function') {
            window.BlackReaper.playSound(soundName);
        } else {
            const audio = new Audio(`assets/audio/${soundName}`);
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Could not play audio:", err.message));
        }
    } catch (e) {
        console.error("Error playing sound:", e);
    }
}

// Apply glitch effect if available
function applyGlitchEffect(isError = false) {
    try {
        if (typeof window.BlackReaper !== 'undefined' && typeof window.BlackReaper.applyGlitchEffect === 'function') {
            window.BlackReaper.applyGlitchEffect(isError);
        } else {
            // Simple fallback glitch effect
            const authContainer = document.getElementById('auth-container');
            if (authContainer) {
                authContainer.classList.add('glitch-effect');
                setTimeout(() => {
                    authContainer.classList.remove('glitch-effect');
                }, 1000);
            }
        }
    } catch (e) {
        console.error("Error applying glitch effect:", e);
    }
}

// Export user data for other scripts
window.BlackReaperAuth = {
    currentUser,
    userProfile,
    loadUserProfile
};
