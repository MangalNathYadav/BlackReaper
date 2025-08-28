/**
 * BlackReaper v2 - Notification Manager
 * Handles toast notifications and alerts
 */

// Create a self-contained module
const notificationManager = (() => {
  // Toast container element
  let toastContainer = null;
  
  /**
   * Initialize the toast container
   */
  function initToastContainer() {
    // If container already exists, return it
    if (toastContainer) {
      return toastContainer;
    }
    
    // Create container
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    return toastContainer;
  }
  
  /**
   * Create and show a toast notification
   * @param {Object} options - Notification options
   */
  function showNotification(options = {}) {
    const container = initToastContainer();
    const title = options.title || 'Notification';
    const message = options.message || '';
    const type = options.type || 'info';
    const duration = options.duration || 5000;
    const icon = options.icon || getIconForType(type);
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add inner content
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <div class="toast-close">
        <i class="fas fa-times"></i>
      </div>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Set up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      closeToast(toast);
    });
    
    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          closeToast(toast);
        }
      }, duration);
    }
    
    // Return the toast element
    return toast;
  }
  
  /**
   * Close and remove a toast
   * @param {HTMLElement} toast - Toast element to close
   */
  function closeToast(toast) {
    // Add closing animation
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    
    // Remove after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  /**
   * Get icon class for notification type
   * @param {string} type - Notification type
   * @returns {string} Icon class
   */
  function getIconForType(type) {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-info-circle';
    }
  }
  
  /**
   * Show a success notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {HTMLElement} Toast element
   */
  function showSuccess(title, message) {
    return showNotification({
      title,
      message,
      type: 'success'
    });
  }
  
  /**
   * Show an error notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {HTMLElement} Toast element
   */
  function showError(title, message) {
    return showNotification({
      title,
      message,
      type: 'error'
    });
  }
  
  /**
   * Show a warning notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {HTMLElement} Toast element
   */
  function showWarning(title, message) {
    return showNotification({
      title,
      message,
      type: 'warning'
    });
  }
  
  /**
   * Show a simple text notification
   * @param {string} message - Notification message
   * @returns {HTMLElement} Toast element
   */
  function showMessage(message) {
    return showNotification({
      title: 'Notification',
      message
    });
  }
  
  /**
   * Clear all notifications
   */
  function clearAll() {
    if (toastContainer) {
      toastContainer.innerHTML = '';
    }
  }
  
  // Return public API
  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showMessage,
    clearAll
  };
})();

// Expose notification manager globally
window.notificationManager = notificationManager;
