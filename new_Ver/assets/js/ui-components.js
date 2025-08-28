// UI Components for BlackReaper
// Reusable UI components for use across the application

/**
 * UI Components for BlackReaper application
 */
class UIComponents {
  /**
   * Create a card component
   * @param {Object} options - Card options
   * @param {string} options.title - Card title
   * @param {string} options.content - Card content
   * @param {string} options.footer - Card footer content
   * @param {string} options.type - Card type (default, primary, secondary, etc.)
   * @param {string} options.icon - Icon class for the card header
   * @returns {HTMLElement} Card element
   */
  card(options) {
    const { 
      title, 
      content, 
      footer, 
      type = 'default',
      icon
    } = options;
    
    const card = document.createElement('div');
    card.className = `card ${type}-card`;
    
    // Card header
    if (title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      
      if (icon) {
        const iconEl = document.createElement('i');
        iconEl.className = icon;
        header.appendChild(iconEl);
      }
      
      const titleEl = document.createElement('h3');
      titleEl.textContent = title;
      header.appendChild(titleEl);
      
      card.appendChild(header);
    }
    
    // Card content
    if (content) {
      const contentEl = document.createElement('div');
      contentEl.className = 'card-content';
      
      if (typeof content === 'string') {
        contentEl.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        contentEl.appendChild(content);
      }
      
      card.appendChild(contentEl);
    }
    
    // Card footer
    if (footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'card-footer';
      
      if (typeof footer === 'string') {
        footerEl.innerHTML = footer;
      } else if (footer instanceof HTMLElement) {
        footerEl.appendChild(footer);
      }
      
      card.appendChild(footerEl);
    }
    
    return card;
  }

  /**
   * Create a task item component
   * @param {Object} task - Task data
   * @param {Object} options - Component options
   * @param {Function} options.onComplete - Completion handler
   * @param {Function} options.onEdit - Edit handler
   * @param {Function} options.onDelete - Delete handler
   * @returns {HTMLElement} Task item element
   */
  taskItem(task, options = {}) {
    const {
      onComplete,
      onEdit,
      onDelete
    } = options;
    
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskEl.dataset.id = task.id;
    
    if (task.priority) {
      taskEl.classList.add(`priority-${task.priority}`);
    }
    
    // Task checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      if (onComplete) onComplete(task.id, checkbox.checked);
    });
    taskEl.appendChild(checkbox);
    
    // Task content
    const content = document.createElement('div');
    content.className = 'task-content';
    
    // Task title
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    content.appendChild(title);
    
    // Task description (if any)
    if (task.description) {
      const description = document.createElement('div');
      description.className = 'task-description';
      description.textContent = task.description;
      content.appendChild(description);
    }
    
    // Task metadata
    const metadata = document.createElement('div');
    metadata.className = 'task-metadata';
    
    // Due date
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const dueDateEl = document.createElement('span');
      dueDateEl.className = 'task-due-date';
      dueDateEl.innerHTML = `<i class="fas fa-calendar"></i> ${dueDate.toLocaleDateString()}`;
      metadata.appendChild(dueDateEl);
    }
    
    // RC reward
    if (task.rcReward) {
      const rcReward = document.createElement('span');
      rcReward.className = 'task-rc-reward';
      rcReward.innerHTML = `<i class="fas fa-dna"></i> ${task.rcReward} RC`;
      metadata.appendChild(rcReward);
    }
    
    // Tags
    if (task.tags && task.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'task-tags';
      
      task.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'task-tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });
      
      metadata.appendChild(tagsContainer);
    }
    
    content.appendChild(metadata);
    taskEl.appendChild(content);
    
    // Task actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    // Edit button
    if (onEdit) {
      const editBtn = document.createElement('button');
      editBtn.className = 'task-action edit-btn';
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editBtn.addEventListener('click', () => onEdit(task));
      actions.appendChild(editBtn);
    }
    
    // Delete button
    if (onDelete) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-action delete-btn';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.addEventListener('click', () => onDelete(task.id));
      actions.appendChild(deleteBtn);
    }
    
    taskEl.appendChild(actions);
    
    return taskEl;
  }

  /**
   * Create a journal entry component
   * @param {Object} entry - Journal entry data
   * @param {Object} options - Component options
   * @param {Function} options.onView - View handler
   * @param {Function} options.onEdit - Edit handler
   * @param {Function} options.onDelete - Delete handler
   * @returns {HTMLElement} Journal entry element
   */
  journalEntry(entry, options = {}) {
    const {
      onView,
      onEdit,
      onDelete
    } = options;
    
    const entryEl = document.createElement('div');
    entryEl.className = 'journal-entry';
    entryEl.dataset.id = entry.id;
    
    // Entry header
    const header = document.createElement('div');
    header.className = 'entry-header';
    
    // Entry title
    const title = document.createElement('h3');
    title.className = 'entry-title';
    title.textContent = entry.title;
    header.appendChild(title);
    
    // Entry date
    const date = new Date(entry.createdAt);
    const dateEl = document.createElement('div');
    dateEl.className = 'entry-date';
    dateEl.textContent = date.toLocaleDateString();
    header.appendChild(dateEl);
    
    entryEl.appendChild(header);
    
    // Entry content preview
    const preview = document.createElement('div');
    preview.className = 'entry-preview';
    
    // Truncate content for preview
    const contentPreview = entry.content.length > 150 
      ? `${entry.content.substring(0, 150)}...` 
      : entry.content;
    
    preview.textContent = contentPreview;
    entryEl.appendChild(preview);
    
    // Entry footer
    const footer = document.createElement('div');
    footer.className = 'entry-footer';
    
    // Mood indicator
    if (entry.mood) {
      const moodEl = document.createElement('div');
      moodEl.className = `entry-mood mood-${entry.mood}`;
      
      // Get mood emoji
      const moodEmoji = this.getMoodEmoji(entry.mood);
      moodEl.innerHTML = `<span class="mood-emoji">${moodEmoji}</span> ${entry.mood}`;
      
      footer.appendChild(moodEl);
    }
    
    // Entry actions
    const actions = document.createElement('div');
    actions.className = 'entry-actions';
    
    // View button
    if (onView) {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'entry-action view-btn';
      viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
      viewBtn.addEventListener('click', () => onView(entry));
      actions.appendChild(viewBtn);
    }
    
    // Edit button
    if (onEdit) {
      const editBtn = document.createElement('button');
      editBtn.className = 'entry-action edit-btn';
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editBtn.addEventListener('click', () => onEdit(entry));
      actions.appendChild(editBtn);
    }
    
    // Delete button
    if (onDelete) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'entry-action delete-btn';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.addEventListener('click', () => onDelete(entry.id));
      actions.appendChild(deleteBtn);
    }
    
    footer.appendChild(actions);
    entryEl.appendChild(footer);
    
    return entryEl;
  }

  /**
   * Get emoji for a mood
   * @param {string} mood - Mood name
   * @returns {string} Emoji for the mood
   */
  getMoodEmoji(mood) {
    const moods = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'anxious': '😰',
      'excited': '😃',
      'relaxed': '😌',
      'neutral': '😐',
      'frustrated': '😤',
      'proud': '😎',
      'tired': '😴',
      'confused': '😕'
    };
    
    return moods[mood.toLowerCase()] || '😐';
  }

  /**
   * Create an opponent card component
   * @param {Object} opponent - Opponent data
   * @param {Object} options - Component options
   * @param {Function} options.onBattle - Battle handler
   * @param {boolean} options.isUnlocked - Whether the opponent is unlocked
   * @returns {HTMLElement} Opponent card element
   */
  opponentCard(opponent, options = {}) {
    const {
      onBattle,
      isUnlocked = true
    } = options;
    
    const cardEl = document.createElement('div');
    cardEl.className = `opponent-card ${opponent.type}-type`;
    cardEl.dataset.id = opponent.id;
    
    if (!isUnlocked) {
      cardEl.classList.add('locked');
    }
    
    // Opponent image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'opponent-image';
    
    const image = document.createElement('img');
    image.src = opponent.imageBase64 || 'assets/images/placeholder-frame.png';
    image.alt = opponent.name;
    imageContainer.appendChild(image);
    
    // Lock overlay for locked opponents
    if (!isUnlocked) {
      const lockOverlay = document.createElement('div');
      lockOverlay.className = 'lock-overlay';
      lockOverlay.innerHTML = '<i class="fas fa-lock"></i>';
      imageContainer.appendChild(lockOverlay);
    }
    
    cardEl.appendChild(imageContainer);
    
    // Opponent info
    const infoEl = document.createElement('div');
    infoEl.className = 'opponent-info';
    
    // Opponent name and rank
    const nameEl = document.createElement('div');
    nameEl.className = 'opponent-name';
    nameEl.innerHTML = `${opponent.name} <span class="opponent-rank">${opponent.rank}</span>`;
    infoEl.appendChild(nameEl);
    
    // Opponent type and level
    const typeEl = document.createElement('div');
    typeEl.className = 'opponent-type';
    typeEl.innerHTML = `${this.capitalize(opponent.type)} <span class="opponent-level">Lv.${opponent.level}</span>`;
    infoEl.appendChild(typeEl);
    
    cardEl.appendChild(infoEl);
    
    // Opponent stats
    if (opponent.stats) {
      const statsEl = document.createElement('div');
      statsEl.className = 'opponent-stats';
      
      // Create stat bars
      const stats = [
        { name: 'Power', value: opponent.stats.power },
        { name: 'Speed', value: opponent.stats.speed },
        { name: 'Durability', value: opponent.stats.durability },
        { name: 'Intelligence', value: opponent.stats.intelligence }
      ];
      
      stats.forEach(stat => {
        const statEl = document.createElement('div');
        statEl.className = 'stat-item';
        
        const statLabel = document.createElement('div');
        statLabel.className = 'stat-label';
        statLabel.textContent = stat.name;
        statEl.appendChild(statLabel);
        
        const statBar = document.createElement('div');
        statBar.className = 'stat-bar';
        
        const statFill = document.createElement('div');
        statFill.className = 'stat-fill';
        
        // Calculate percentage (max value is 150)
        const maxValue = 150;
        const percentage = Math.min(100, Math.max(0, (stat.value / maxValue) * 100));
        statFill.style.width = `${percentage}%`;
        
        statBar.appendChild(statFill);
        statEl.appendChild(statBar);
        
        const statValue = document.createElement('div');
        statValue.className = 'stat-value';
        statValue.textContent = stat.value;
        statEl.appendChild(statValue);
        
        statsEl.appendChild(statEl);
      });
      
      cardEl.appendChild(statsEl);
    }
    
    // Battle button
    const battleBtn = document.createElement('button');
    battleBtn.className = 'battle-btn';
    
    if (isUnlocked) {
      battleBtn.textContent = 'Battle';
      battleBtn.disabled = false;
      
      if (onBattle) {
        battleBtn.addEventListener('click', () => onBattle(opponent));
      }
    } else {
      battleBtn.textContent = 'Locked';
      battleBtn.disabled = true;
      
      // Show unlock requirements
      if (opponent.unlockRequirement) {
        const req = opponent.unlockRequirement;
        battleBtn.title = `Unlock at Level ${req.level} with ${req.rc} RC cells`;
      }
    }
    
    cardEl.appendChild(battleBtn);
    
    return cardEl;
  }

  /**
   * Create an achievement card component
   * @param {Object} achievement - Achievement data
   * @returns {HTMLElement} Achievement card element
   */
  achievementCard(achievement) {
    const cardEl = document.createElement('div');
    cardEl.className = `achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`;
    cardEl.dataset.id = achievement.id;
    
    // Achievement icon
    const iconEl = document.createElement('div');
    iconEl.className = 'achievement-icon';
    
    const icon = document.createElement('i');
    icon.className = achievement.icon || 'fas fa-trophy';
    iconEl.appendChild(icon);
    
    cardEl.appendChild(iconEl);
    
    // Achievement info
    const infoEl = document.createElement('div');
    infoEl.className = 'achievement-info';
    
    // Achievement name
    const nameEl = document.createElement('div');
    nameEl.className = 'achievement-name';
    nameEl.textContent = achievement.name;
    infoEl.appendChild(nameEl);
    
    // Achievement description
    const descEl = document.createElement('div');
    descEl.className = 'achievement-description';
    descEl.textContent = achievement.description;
    infoEl.appendChild(descEl);
    
    // Achievement progress
    const progress = achievement.isUnlocked ? 100 : (achievement.progress || 0);
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'achievement-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${progress}%`;
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = `${Math.round(progress)}%`;
    progressContainer.appendChild(progressText);
    
    infoEl.appendChild(progressContainer);
    
    // Unlock date for unlocked achievements
    if (achievement.isUnlocked && achievement.unlockedAt) {
      const unlockDate = new Date(achievement.unlockedAt);
      const unlockDateEl = document.createElement('div');
      unlockDateEl.className = 'unlock-date';
      unlockDateEl.textContent = `Unlocked on ${unlockDate.toLocaleDateString()}`;
      infoEl.appendChild(unlockDateEl);
    }
    
    cardEl.appendChild(infoEl);
    
    // Rewards section
    if (achievement.rewards) {
      const rewardsEl = document.createElement('div');
      rewardsEl.className = 'achievement-rewards';
      
      if (achievement.rewards.rc) {
        const rcReward = document.createElement('div');
        rcReward.className = 'reward-item rc-reward';
        rcReward.innerHTML = `<i class="fas fa-dna"></i> ${achievement.rewards.rc} RC`;
        rewardsEl.appendChild(rcReward);
      }
      
      if (achievement.rewards.xp) {
        const xpReward = document.createElement('div');
        xpReward.className = 'reward-item xp-reward';
        xpReward.innerHTML = `<i class="fas fa-star"></i> ${achievement.rewards.xp} XP`;
        rewardsEl.appendChild(xpReward);
      }
      
      cardEl.appendChild(rewardsEl);
    }
    
    return cardEl;
  }

  /**
   * Create a profile card component
   * @param {Object} user - User data
   * @returns {HTMLElement} Profile card element
   */
  profileCard(user) {
    const cardEl = document.createElement('div');
    cardEl.className = 'profile-card';
    
    // User avatar
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'profile-avatar-container';
    
    const avatar = document.createElement('img');
    avatar.className = 'profile-avatar';
    avatar.src = user.avatarBase64 || 'assets/images/placeholder-frame.png';
    avatar.alt = 'User Avatar';
    avatarContainer.appendChild(avatar);
    
    // Mode indicator
    const modeIndicator = document.createElement('div');
    modeIndicator.className = `mode-indicator ${user.mode}-mode`;
    modeIndicator.innerHTML = user.mode === 'human' 
      ? '<i class="fas fa-user"></i>' 
      : '<i class="fas fa-mask"></i>';
    avatarContainer.appendChild(modeIndicator);
    
    cardEl.appendChild(avatarContainer);
    
    // User info
    const infoEl = document.createElement('div');
    infoEl.className = 'profile-info';
    
    // User display name
    const nameEl = document.createElement('h3');
    nameEl.className = 'display-name';
    nameEl.textContent = user.displayName || 'User';
    infoEl.appendChild(nameEl);
    
    // User rank and level
    const rankEl = document.createElement('div');
    rankEl.className = 'rank-level';
    rankEl.innerHTML = `<span class="rank">${user.rank || 'C'}</span> · Level ${user.level || 1}`;
    infoEl.appendChild(rankEl);
    
    // User RC count
    const rcEl = document.createElement('div');
    rcEl.className = 'rc-count';
    rcEl.innerHTML = `<i class="fas fa-dna"></i> ${user.rc || 0} RC cells`;
    infoEl.appendChild(rcEl);
    
    cardEl.appendChild(infoEl);
    
    return cardEl;
  }

  /**
   * Create a stats card component
   * @param {Object} stats - Stats data
   * @returns {HTMLElement} Stats card element
   */
  statsCard(stats) {
    const cardEl = document.createElement('div');
    cardEl.className = 'stats-card';
    
    // Create stats grid
    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    
    // Define stats to display
    const statsToDisplay = [
      { key: 'tasksCompleted', label: 'Tasks Completed', icon: 'fas fa-tasks' },
      { key: 'pomodoros', label: 'Pomodoro Sessions', icon: 'fas fa-clock' },
      { key: 'journalEntries', label: 'Journal Entries', icon: 'fas fa-book' },
      { key: 'battles', label: 'Total Battles', icon: 'fas fa-swords' },
      { key: 'battlesWon', label: 'Battles Won', icon: 'fas fa-trophy' },
      { key: 'activeDays', label: 'Active Days', icon: 'fas fa-calendar-check' }
    ];
    
    statsToDisplay.forEach(stat => {
      const value = stats[stat.key] || 0;
      
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';
      
      const statIcon = document.createElement('div');
      statIcon.className = 'stat-icon';
      statIcon.innerHTML = `<i class="${stat.icon}"></i>`;
      statItem.appendChild(statIcon);
      
      const statValue = document.createElement('div');
      statValue.className = 'stat-value';
      statValue.textContent = value;
      statItem.appendChild(statValue);
      
      const statLabel = document.createElement('div');
      statLabel.className = 'stat-label';
      statLabel.textContent = stat.label;
      statItem.appendChild(statLabel);
      
      statsGrid.appendChild(statItem);
    });
    
    cardEl.appendChild(statsGrid);
    
    return cardEl;
  }
  
  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export UI components
const uiComponents = new UIComponents();
export default uiComponents;
