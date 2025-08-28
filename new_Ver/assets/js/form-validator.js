// Form validation utilities for BlackReaper

/**
 * Form validation utilities
 */
class FormValidator {
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  validateEmail(email) {
    // Basic email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Trim whitespace
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return { valid: false, message: 'Email is required' };
    }
    
    if (!emailPattern.test(trimmedEmail)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    return { valid: true };
  }

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    
    return { valid: true };
  }

  /**
   * Validate display name
   * @param {string} displayName - Display name to validate
   * @returns {Object} Validation result
   */
  validateDisplayName(displayName) {
    // Trim whitespace
    const trimmedName = displayName.trim();
    
    if (!trimmedName) {
      return { valid: false, message: 'Display name is required' };
    }
    
    if (trimmedName.length < 3) {
      return { valid: false, message: 'Display name must be at least 3 characters' };
    }
    
    if (trimmedName.length > 50) {
      return { valid: false, message: 'Display name cannot exceed 50 characters' };
    }
    
    return { valid: true };
  }

  /**
   * Validate form data
   * @param {Object} data - Form data to validate
   * @param {Array} rules - Validation rules
   * @returns {Object} Validation results
   */
  validateForm(data, rules) {
    const errors = {};
    let isValid = true;
    
    rules.forEach(rule => {
      const { field, validator, message } = rule;
      const value = data[field];
      
      // Skip if no validator function
      if (!validator) {
        return;
      }
      
      // Run validator function
      const result = typeof validator === 'function' 
        ? validator(value) 
        : { valid: !!validator, message };
      
      if (!result.valid) {
        errors[field] = result.message || `${field} is invalid`;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }

  /**
   * Validate task data
   * @param {Object} task - Task data to validate
   * @returns {Object} Validation result
   */
  validateTask(task) {
    const errors = {};
    let isValid = true;
    
    // Validate title
    if (!task.title || task.title.trim() === '') {
      errors.title = 'Task title is required';
      isValid = false;
    } else if (task.title.length > 200) {
      errors.title = 'Task title cannot exceed 200 characters';
      isValid = false;
    }
    
    // Validate description (if provided)
    if (task.description && task.description.length > 1000) {
      errors.description = 'Task description cannot exceed 1000 characters';
      isValid = false;
    }
    
    // Validate dueDate (if provided)
    if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
      errors.dueDate = 'Invalid due date';
      isValid = false;
    }
    
    // Validate rcReward (if provided)
    if (task.rcReward !== undefined) {
      if (isNaN(task.rcReward)) {
        errors.rcReward = 'RC reward must be a number';
        isValid = false;
      } else if (task.rcReward < 0 || task.rcReward > 1000) {
        errors.rcReward = 'RC reward must be between 0 and 1000';
        isValid = false;
      }
    }
    
    return { isValid, errors };
  }

  /**
   * Validate journal entry data
   * @param {Object} entry - Journal entry data to validate
   * @returns {Object} Validation result
   */
  validateJournalEntry(entry) {
    const errors = {};
    let isValid = true;
    
    // Validate title
    if (!entry.title || entry.title.trim() === '') {
      errors.title = 'Entry title is required';
      isValid = false;
    } else if (entry.title.length > 200) {
      errors.title = 'Entry title cannot exceed 200 characters';
      isValid = false;
    }
    
    // Validate content
    if (!entry.content || entry.content.trim() === '') {
      errors.content = 'Entry content is required';
      isValid = false;
    } else if (entry.content.length > 10000) {
      errors.content = 'Entry content cannot exceed 10,000 characters';
      isValid = false;
    }
    
    // Validate mood (if provided)
    if (entry.mood && entry.mood.length > 20) {
      errors.mood = 'Mood cannot exceed 20 characters';
      isValid = false;
    }
    
    // Validate imageBase64 (if provided)
    if (entry.imageBase64 && entry.imageBase64.length > 500000) {
      errors.imageBase64 = 'Image size is too large';
      isValid = false;
    }
    
    return { isValid, errors };
  }

  /**
   * Show validation errors in form
   * @param {Object} form - Form element
   * @param {Object} errors - Validation errors
   */
  showValidationErrors(form, errors) {
    // Clear previous error messages
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    // Remove error classes
    const inputElements = form.querySelectorAll('.error');
    inputElements.forEach(el => el.classList.remove('error'));
    
    // Add new error messages
    Object.entries(errors).forEach(([field, message]) => {
      const input = form.querySelector(`[name="${field}"]`);
      
      if (!input) {
        return;
      }
      
      // Add error class to input
      input.classList.add('error');
      
      // Create error message element
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = message;
      
      // Insert after input
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    });
  }

  /**
   * Validate file upload
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateFileUpload(file, options = {}) {
    const {
      maxSizeBytes = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    } = options;
    
    if (!file) {
      return { valid: false, message: 'No file selected' };
    }
    
    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
    
    // Check file size
    if (maxSizeBytes && file.size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return { 
        valid: false, 
        message: `File size exceeds maximum allowed (${maxSizeMB}MB)`
      };
    }
    
    return { valid: true };
  }
}

// Export singleton instance
const formValidator = new FormValidator();
export default formValidator;
