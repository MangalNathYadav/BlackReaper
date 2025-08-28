/**
 * BlackReaper v2 - Background Pattern Effects
 * This script adds interactivity to the background patterns
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get references to pattern elements
    const bgPatterns = document.querySelectorAll('.bg-pattern');
    const authContainer = document.querySelector('.auth-container');
    
    // Add parallax effect to background patterns
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth < 768) return; // Disable on mobile devices
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Apply subtle movement to patterns
        bgPatterns.forEach((pattern, index) => {
            const factor = (index + 1) * 15;
            const offsetX = (mouseX - 0.5) * factor;
            const offsetY = (mouseY - 0.5) * factor;
            
            pattern.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
    });
    
    // Enhance form focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            const bgPattern = document.querySelector('.bg-pattern-rc-cells');
            if (bgPattern) {
                bgPattern.style.opacity = '0.1';
            }
        });
        
        input.addEventListener('blur', function() {
            const bgPattern = document.querySelector('.bg-pattern-rc-cells');
            if (bgPattern) {
                bgPattern.style.opacity = '';
            }
        });
    });
    
    // Add pulse effect on login button hover
    const authButtons = document.querySelectorAll('.auth-btn');
    authButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            const isGhoulMode = document.body.classList.contains('ghoul-mode');
            const bgPattern = document.querySelector('.bg-pattern-kagune');
            
            if (bgPattern && isGhoulMode) {
                bgPattern.style.opacity = '0.15';
                bgPattern.style.transition = 'opacity 0.5s ease';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            const bgPattern = document.querySelector('.bg-pattern-kagune');
            if (bgPattern) {
                bgPattern.style.opacity = '';
            }
        });
    });
    
    // Add dynamic background effect on tab switch
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Create a ripple effect in the background pattern
            const ripple = document.createElement('div');
            ripple.className = 'bg-ripple';
            ripple.style.position = 'absolute';
            ripple.style.width = '300px';
            ripple.style.height = '300px';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'radial-gradient(circle, rgba(var(--primary-color-rgb), 0.2) 0%, transparent 70%)';
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
            ripple.style.animation = 'ripple-expand 1s ease-out forwards';
            
            // Position the ripple at the tab's center
            const rect = tab.getBoundingClientRect();
            const containerRect = authContainer.getBoundingClientRect();
            
            ripple.style.left = (rect.left + rect.width/2 - containerRect.left) + 'px';
            ripple.style.top = (rect.top + rect.height/2 - containerRect.top) + 'px';
            
            authContainer.appendChild(ripple);
            
            // Remove after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    });
    
    // Add a keyframe animation for the ripple effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-expand {
            to {
                transform: translate(-50%, -50%) scale(3);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
