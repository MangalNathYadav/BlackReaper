/**
 * Button Enhancement Script
 * Adds ripple effects and loading states to buttons
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to all auth buttons
    const buttons = document.querySelectorAll('.auth-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            
            // Calculate ripple position
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.className = 'ripple';
            
            // Remove existing ripples
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }
            
            button.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Function to show loading state
    window.showButtonLoading = function(buttonElement) {
        if (!buttonElement) return;
        
        // Store original content and add loading class
        buttonElement.dataset.originalContent = buttonElement.innerHTML;
        buttonElement.classList.add('loading');
        
        // Disable the button
        buttonElement.disabled = true;
    };
    
    // Function to hide loading state
    window.hideButtonLoading = function(buttonElement) {
        if (!buttonElement) return;
        
        // Restore original content and remove loading class
        buttonElement.innerHTML = buttonElement.dataset.originalContent;
        buttonElement.classList.remove('loading');
        
        // Re-enable the button
        buttonElement.disabled = false;
    };
    
    // Mode toggle enhancement
    const modeToggle = document.querySelector('.mode-toggle');
    const modeSlider = document.querySelector('.mode-toggle-slider');
    
    if (modeToggle && modeSlider) {
        // Add hover effect
        modeToggle.addEventListener('mouseenter', () => {
            modeSlider.style.transform = document.body.classList.contains('ghoul-mode') 
                ? 'translateX(calc(100% + 6px)) scale(1.05)' 
                : 'translateX(0) scale(1.05)';
        });
        
        modeToggle.addEventListener('mouseleave', () => {
            modeSlider.style.transform = document.body.classList.contains('ghoul-mode')
                ? 'translateX(calc(100% + 6px)) scale(1)' 
                : 'translateX(0) scale(1)';
        });
        
        // Add click effect
        modeToggle.addEventListener('click', (e) => {
            const clickX = e.clientX - modeToggle.getBoundingClientRect().left;
            const toggleWidth = modeToggle.offsetWidth;
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'mode-toggle-ripple';
            ripple.style.left = (clickX / toggleWidth * 100) + '%';
            
            modeToggle.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    }
});
