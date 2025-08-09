// Firebase authentication handlers

// Get auth reference
const auth = firebase.auth();

// DOM Elements for auth (if on index page)
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showLoginLink = document.getElementById('show-login');
const showSignupLink = document.getElementById('show-signup');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const anonymousLoginButton = document.getElementById('anonymous-login');
const logoutBtn = document.getElementById('logout-btn');

// Event listeners for auth UI
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the index page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        setupAuthUI();
    }
    
    // Check auth state on all pages
    auth.onAuthStateChanged(handleAuthStateChange);
    
    // Logout button (on pages other than index)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
});

// Setup authentication UI
function setupAuthUI() {
    // Show login form by default
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    
    // Toggle between login and signup forms
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });
    }
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
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
    
    // Anonymous login
    if (anonymousLoginButton) {
        anonymousLoginButton.addEventListener('click', handleAnonymousLogin);
    }
}

// Handle login form submission
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    
    // For demo purposes, we'll simulate success
    // In production, this would use Firebase Auth
    simulateSuccessfulAuth(email, false);
}

// Handle signup form submission
function handleSignup() {
    const nickname = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (!nickname || !email || !password) {
        alert('Please fill out all fields.');
        return;
    }
    
    // For demo purposes, we'll simulate success
    // In production, this would use Firebase Auth
    localStorage.setItem('userNickname', nickname);
    simulateSuccessfulAuth(email, false);
}

// Handle anonymous login
function handleAnonymousLogin() {
    // For demo purposes, we'll simulate success
    // In production, this would use Firebase Auth anonymous signin
    simulateSuccessfulAuth('guest', true);
}

// Handle logout
function logoutUser() {
    // For demo purposes, we'll simulate logout
    // In production, this would use Firebase Auth signOut
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAnonymous');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Simulate successful authentication
function simulateSuccessfulAuth(email, isAnonymous) {
    // Save auth state to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isAnonymous', isAnonymous ? 'true' : 'false');
    
    // If first time, set a default nickname
    if (!localStorage.getItem('userNickname')) {
        localStorage.setItem('userNickname', isAnonymous ? 'Guest' : email.split('@')[0]);
    }
    
    // Set first visit timestamp if not already set
    if (!localStorage.getItem('firstVisit')) {
        localStorage.setItem('firstVisit', new Date().toISOString());
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Handle auth state changes
function handleAuthStateChange(user) {
    // For demo, we'll use localStorage
    // In production, this would check Firebase Auth user
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Pages that require authentication
    const authPages = ['dashboard.html', 'journal.html', 'profile.html'];
    
    // If on auth page but not logged in, redirect to login
    if (authPages.includes(currentPage) && !isLoggedIn) {
        window.location.href = 'index.html';
    }
    
    // If logged in but on index page, redirect to dashboard
    if (isLoggedIn && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'dashboard.html';
    }
}

// Export for use in other scripts
window.BlackReaperAuth = {
    login: handleLogin,
    signup: handleSignup,
    logout: logoutUser,
    anonymousLogin: handleAnonymousLogin
};
