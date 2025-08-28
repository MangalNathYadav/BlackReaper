/**
 * Form CSS Conflict Fixes
 * This script resolves styling conflicts for auth forms
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get all form inputs with icons
  const inputWithIcons = document.querySelectorAll('.input-with-icon');
  
  // Fix styling issues
  inputWithIcons.forEach(container => {
    const input = container.querySelector('input');
    const icon = container.querySelector('i');
    
    if (input && icon) {
      // Apply proper padding for inputs with icons
      input.style.paddingLeft = '40px';
      
      // Ensure icon positioning is correct
      icon.style.position = 'absolute';
      icon.style.left = '12px';
      icon.style.top = '50%';
      icon.style.transform = 'translateY(-50%)';
      icon.style.color = 'var(--text-muted)';
      
      // Add focus event listener to style icon on input focus
      input.addEventListener('focus', () => {
        icon.style.color = document.body.classList.contains('ghoul-mode') ? 
          'var(--danger-color)' : 'var(--accent-color)';
      });
      
      input.addEventListener('blur', () => {
        icon.style.color = 'var(--text-muted)';
      });
    }
    
    // Fix password toggle button if present
    const toggleBtn = container.querySelector('.password-toggle');
    if (toggleBtn) {
      toggleBtn.style.position = 'absolute';
      toggleBtn.style.right = '8px';
      toggleBtn.style.top = '50%';
      toggleBtn.style.transform = 'translateY(-50%)';
      toggleBtn.style.background = 'transparent';
      toggleBtn.style.border = 'none';
      toggleBtn.style.color = 'var(--text-muted)';
      toggleBtn.style.cursor = 'pointer';
      
      // Fix input padding for password fields
      input.style.paddingRight = '40px';
      
      // Add toggle functionality
      toggleBtn.addEventListener('click', () => {
        const type = input.getAttribute('type');
        input.setAttribute('type', type === 'password' ? 'text' : 'password');
        
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.className = type === 'password' ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
      });
    }
  });
  
  // Add container position relative style
  inputWithIcons.forEach(container => {
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
  });
  
  console.log('Form CSS conflict fixes applied');
});
