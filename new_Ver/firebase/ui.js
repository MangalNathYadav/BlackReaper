// UI utilities module for toast notifications, modals, and spinners

/**
 * UI Manager - Handles common UI elements like toasts, modals, and spinners
 */
class UIManager {
  constructor() {
    // Create container for toast notifications if it doesn't exist
    this.ensureToastContainer();
    
    // Cache for modals created
    this.modals = {};
  }
  
  /**
   * Ensure the toast container exists in the DOM
   */
  ensureToastContainer() {
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
      
      // Add styles for toast container
      const style = document.createElement('style');
      style.textContent = `
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column-reverse;
          align-items: flex-end;
          gap: 10px;
          pointer-events: none;
        }
        
        .toast {
          padding: 12px 20px;
          border-radius: 6px;
          min-width: 200px;
          max-width: 350px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          color: white;
          font-size: 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: auto;
          position: relative;
        }
        
        .toast.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .toast.success {
          background-color: var(--success-color, #28a745);
        }
        
        .toast.error {
          background-color: var(--error-color, #dc3545);
        }
        
        .toast.info {
          background-color: var(--primary-color, #007bff);
        }
        
        .toast.warning {
          background-color: var(--warning-color, #ffc107);
          color: #333;
        }
        
        .toast .toast-close {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          font-size: 16px;
        }
        
        .toast .toast-close:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info, warning)
   * @param {number} duration - Duration in ms before auto-dismiss
   */
  toast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-message">${message}</div>
      <div class="toast-close">&times;</div>
    `;
    
    const toastContainer = document.getElementById('toast-container');
    toastContainer.appendChild(toast);
    
    // Force reflow to enable transition
    toast.offsetHeight;
    toast.classList.add('show');
    
    // Add click handler for close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.closeToast(toast);
    });
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.closeToast(toast);
      }, duration);
    }
    
    return toast;
  }
  
  /**
   * Close and remove a toast
   * @param {HTMLElement} toast - Toast element to close
   */
  closeToast(toast) {
    toast.classList.remove('show');
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300); // Match the CSS transition duration
  }
  
  /**
   * Create and show a modal
   * @param {Object} options - Modal options
   * @param {string} options.id - Modal ID
   * @param {string} options.title - Modal title
   * @param {string} options.content - Modal HTML content
   * @param {Object} options.buttons - Modal buttons {id: {text, type, onClick}}
   * @param {boolean} options.closable - Whether modal can be closed by clicking outside
   * @returns {HTMLElement} Modal element
   */
  modal(options) {
    const {
      id,
      title = '',
      content = '',
      buttons = {},
      closable = true
    } = options;
    
    // Check if modal with this ID already exists
    let modal = this.modals[id];
    
    if (!modal) {
      // Create modal element
      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">${title}</h3>
              ${closable ? '<button class="modal-close">&times;</button>' : ''}
            </div>
            <div class="modal-body">
              ${content}
            </div>
            <div class="modal-footer"></div>
          </div>
        </div>
      `;
      
      // Add styles for modal
      if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
          }
          
          .modal.show {
            opacity: 1;
            visibility: visible;
          }
          
          .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: -1;
          }
          
          .modal-dialog {
            background-color: var(--card-bg);
            border-radius: 8px;
            max-width: 90%;
            width: 500px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            transform: translateY(-20px);
            transition: transform 0.3s;
          }
          
          .modal.show .modal-dialog {
            transform: translateY(0);
          }
          
          .modal-content {
            display: flex;
            flex-direction: column;
            max-height: 90vh;
            color: var(--text-color);
          }
          
          .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .modal-title {
            margin: 0;
            font-size: 1.25rem;
            color: var(--text-color);
          }
          
          .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-secondary);
            transition: color 0.2s;
          }
          
          .modal-close:hover {
            color: var(--text-color);
          }
          
          .modal-body {
            padding: 20px;
            overflow-y: auto;
          }
          
          .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          
          .modal-btn {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s, transform 0.1s;
          }
          
          .modal-btn:active {
            transform: translateY(1px);
          }
          
          .modal-btn-primary {
            background-color: var(--primary-color);
            color: white;
          }
          
          .modal-btn-primary:hover {
            background-color: var(--primary-hover);
          }
          
          .modal-btn-secondary {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            color: var(--text-color);
          }
          
          .modal-btn-secondary:hover {
            background-color: var(--bg-secondary);
          }
          
          .modal-btn-danger {
            background-color: var(--error-color);
            color: white;
          }
          
          .modal-btn-danger:hover {
            background-color: var(--error-hover);
          }
        `;
        document.head.appendChild(style);
      }
      
      // Add to DOM
      document.body.appendChild(modal);
      
      // Cache modal
      this.modals[id] = modal;
      
      // Add close functionality if closable
      if (closable) {
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            this.hideModal(id);
          });
        }
        
        if (backdrop) {
          backdrop.addEventListener('click', () => {
            this.hideModal(id);
          });
        }
      }
    } else {
      // Update existing modal
      modal.querySelector('.modal-title').textContent = title;
      modal.querySelector('.modal-body').innerHTML = content;
      
      // Clear existing footer
      const footer = modal.querySelector('.modal-footer');
      footer.innerHTML = '';
    }
    
    // Add buttons
    const footer = modal.querySelector('.modal-footer');
    Object.keys(buttons).forEach(buttonId => {
      const buttonConfig = buttons[buttonId];
      const button = document.createElement('button');
      button.id = buttonId;
      button.className = `modal-btn modal-btn-${buttonConfig.type || 'secondary'}`;
      button.textContent = buttonConfig.text;
      
      // Add click handler
      button.addEventListener('click', (event) => {
        if (buttonConfig.onClick) {
          buttonConfig.onClick(event);
        }
        
        // Close modal after button click unless explicitly prevented
        if (buttonConfig.closeOnClick !== false) {
          this.hideModal(id);
        }
      });
      
      footer.appendChild(button);
    });
    
    // Show modal
    this.showModal(id);
    
    return modal;
  }
  
  /**
   * Show a modal by ID
   * @param {string} id - Modal ID
   */
  showModal(id) {
    const modal = this.modals[id];
    
    if (modal) {
      // Force reflow to enable transition
      modal.offsetHeight;
      modal.classList.add('show');
      
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }
  }
  
  /**
   * Hide a modal by ID
   * @param {string} id - Modal ID
   */
  hideModal(id) {
    const modal = this.modals[id];
    
    if (modal) {
      modal.classList.remove('show');
      
      // Restore body scrolling
      document.body.style.overflow = '';
      
      // Allow time for exit animation
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }
  
  /**
   * Show a confirmation modal
   * @param {string} title - Modal title
   * @param {string} message - Modal message
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} onCancel - Callback when cancelled
   */
  confirm(title, message, onConfirm, onCancel) {
    return this.modal({
      id: 'confirm-modal',
      title,
      content: `<p>${message}</p>`,
      buttons: {
        'confirm-cancel': {
          text: 'Cancel',
          type: 'secondary',
          onClick: onCancel || (() => {})
        },
        'confirm-ok': {
          text: 'Confirm',
          type: 'primary',
          onClick: onConfirm || (() => {})
        }
      }
    });
  }
  
  /**
   * Create and show a spinner or loading indicator
   * @param {string} containerId - ID of container element or parent
   * @param {string} message - Optional loading message
   * @returns {HTMLElement} Spinner element
   */
  spinner(containerId, message = 'Loading...') {
    // Find container
    const container = containerId instanceof HTMLElement 
      ? containerId 
      : document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Container ${containerId} not found for spinner`);
      return null;
    }
    
    // Create spinner element
    const spinner = document.createElement('div');
    spinner.className = 'spinner-container';
    spinner.innerHTML = `
      <div class="spinner"></div>
      ${message ? `<div class="spinner-message">${message}</div>` : ''}
    `;
    
    // Add styles for spinner if not already added
    if (!document.getElementById('spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 20px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(var(--primary-color-rgb), 0.3);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .spinner-message {
          color: var(--text-color);
          font-size: 14px;
        }
        
        .spinner-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .spinner-fullscreen .spinner-container {
          background-color: var(--card-bg);
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
      `;
      document.head.appendChild(style);
    }
    
    // Append spinner to container
    container.appendChild(spinner);
    
    // Return spinner with remove method
    spinner.remove = () => {
      if (spinner.parentNode) {
        spinner.parentNode.removeChild(spinner);
      }
    };
    
    return spinner;
  }
  
  /**
   * Show a fullscreen loading spinner
   * @param {string} message - Loading message
   * @returns {Object} Spinner object with remove method
   */
  fullscreenSpinner(message = 'Loading...') {
    // Create fullscreen container
    const container = document.createElement('div');
    container.className = 'spinner-fullscreen';
    document.body.appendChild(container);
    
    // Create spinner inside container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    container.appendChild(spinnerContainer);
    
    // Add spinner elements
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinnerContainer.appendChild(spinner);
    
    if (message) {
      const messageEl = document.createElement('div');
      messageEl.className = 'spinner-message';
      messageEl.textContent = message;
      spinnerContainer.appendChild(messageEl);
    }
    
    // Return object with remove method
    return {
      remove: () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      },
      updateMessage: (newMessage) => {
        const messageEl = container.querySelector('.spinner-message');
        if (messageEl) {
          messageEl.textContent = newMessage;
        }
      }
    };
  }
}

// Create and export singleton instance
const ui = new UIManager();
export default ui;
