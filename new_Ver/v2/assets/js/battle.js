/**
 * BlackReaper v2 - Battle System
 * Handles the kagune battle system functionality
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Require authentication for this page
  requireAuth().then(initBattleSystem).catch(error => {
    console.error('Authentication error:', error);
  });
});

// Battle system state
const battleState = {
  isActive: false,
  playerHealth: 100,
  opponentHealth: 100,
  playerKagune: 'rinkaku',
  opponentKagune: null,
  battleInProgress: false,
  playerBuffs: [],
  opponentBuffs: [],
  rcCells: 0,
  animationPlaying: false
};

// Kagune type stats
const kaguneStats = {
  rinkaku: { damage: 25, defense: 10, speed: 15, specialChance: 0.3 },
  ukaku: { damage: 15, defense: 10, speed: 30, specialChance: 0.4 },
  koukaku: { damage: 15, defense: 25, speed: 10, specialChance: 0.3 },
  bikaku: { damage: 20, defense: 15, speed: 15, specialChance: 0.25 }
};

// Opponent types
const opponents = [
  { name: 'Rookie Ghoul', level: 1, kagune: 'bikaku', healthMod: 1.0, damageMod: 1.0 },
  { name: 'Experienced Ghoul', level: 3, kagune: 'ukaku', healthMod: 1.2, damageMod: 1.1 },
  { name: 'Veteran Ghoul', level: 5, kagune: 'koukaku', healthMod: 1.4, damageMod: 1.3 },
  { name: 'S-Rated Ghoul', level: 8, kagune: 'rinkaku', healthMod: 1.6, damageMod: 1.5 },
  { name: 'SS-Rated Ghoul', level: 12, kagune: 'bikaku', healthMod: 1.8, damageMod: 1.7 },
  { name: 'SSS-Rated Ghoul', level: 15, kagune: 'ukaku', healthMod: 2.0, damageMod: 2.0 }
];

// Current opponent
let currentOpponent = null;

// Animation frames for kagune activation
const animationFrameCount = 23;
const animationBasePath = '../animation_sprites/';

// Cache DOM elements
const elements = {};

/**
 * Initialize the battle system
 */
function initBattleSystem() {
  // Cache DOM elements
  elements.rcMeterFill = document.getElementById('rc-meter-fill');
  elements.rcCellsCount = document.getElementById('rc-cells-count');
  elements.kaguneOptions = document.querySelectorAll('.kagune-option');
  elements.activateButton = document.querySelector('.battle-button.activate');
  elements.attackButton = document.querySelector('.battle-button.attack');
  elements.defendButton = document.querySelector('.battle-button.defend');
  elements.playerHealth = document.querySelector('.health-bar-fill.player-health');
  elements.opponentHealth = document.querySelector('.health-bar-fill.opponent-health');
  elements.playerStatus = document.querySelector('.status-effects.player-status');
  elements.opponentStatus = document.querySelector('.status-effects.opponent-status');
  elements.battleLog = document.getElementById('battle-log');
  elements.animationContainer = document.getElementById('animation-container');
  elements.animationFrame = document.getElementById('animation-frame');
  
  // Load user data
  loadUserData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Log system ready
  addLogEntry('Battle system initialized. Ready for combat.', 'system');
}

/**
 * Load user data from Firebase
 */
function loadUserData() {
  const userId = auth.getCurrentUser().uid;
  
  // Get user profile data
  db.get(`users/${userId}/profile`).then(snapshot => {
    const profile = snapshot.val();
    
    if (profile) {
      // Update RC cells count
      battleState.rcCells = profile.rcCells || 0;
      updateRCMeter();
      
      // Set selected kagune
      if (profile.kagune) {
        setKaguneType(profile.kagune);
      }
    }
  }).catch(error => {
    console.error('Error loading user data:', error);
  });
}

/**
 * Setup event listeners for battle controls
 */
function setupEventListeners() {
  // Kagune selection
  elements.kaguneOptions.forEach(option => {
    option.addEventListener('click', () => {
      const kaguneType = option.dataset.type;
      setKaguneType(kaguneType);
    });
  });
  
  // Activate kagune button
  elements.activateButton.addEventListener('click', toggleKagune);
  
  // Attack button
  elements.attackButton.addEventListener('click', performAttack);
  
  // Defend button
  elements.defendButton.addEventListener('click', performDefend);
}

/**
 * Set the player's kagune type
 * @param {string} type - Kagune type
 */
function setKaguneType(type) {
  // Update selected class
  elements.kaguneOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.type === type) {
      option.classList.add('selected');
    }
  });
  
  // Update battle state
  battleState.playerKagune = type;
  
  // Update in database
  const userId = auth.getCurrentUser().uid;
  db.update(`users/${userId}/profile`, { kagune: type })
    .catch(error => console.error('Error updating kagune type:', error));
  
  addLogEntry(`Kagune type changed to: ${type}`, 'system');
}

/**
 * Toggle kagune activation
 */
function toggleKagune() {
  if (battleState.animationPlaying) return;
  
  if (!battleState.isActive) {
    // Activate kagune
    if (battleState.rcCells < 5) {
      addLogEntry('Not enough RC cells. Minimum 5 required to activate kagune.', 'system');
      return;
    }
    
    // Play activation animation
    playKaguneAnimation('activate');
    
    // Consume RC cells
    updateRCCells(-5);
    
    // Select random opponent
    selectOpponent();
    
  } else {
    // Deactivate kagune
    playKaguneAnimation('deactivate');
    
    // Reset battle state
    resetBattleState();
    
    // Update buttons
    elements.attackButton.disabled = true;
    elements.defendButton.disabled = true;
    elements.activateButton.innerHTML = '<i class="fa-solid fa-power-off"></i> Activate Kagune';
    elements.activateButton.classList.remove('activate');
    elements.activateButton.classList.add('activate');
  }
}

/**
 * Play kagune animation
 * @param {string} type - Animation type ('activate' or 'deactivate')
 */
function playKaguneAnimation(type) {
  battleState.animationPlaying = true;
  
  // Show animation container
  elements.animationContainer.classList.add('active');
  
  // Play sound effect if available
  if (window.audio && window.audio.playSound) {
    window.audio.playSound(`kagune-${type}`);
  }
  
  let currentFrame = 1;
  const frameInterval = 50;
  
  // Function to update animation frame
  function updateFrame() {
    const frameNumber = currentFrame.toString().padStart(2, '0');
    elements.animationFrame.src = `../animation_sprites/frame${currentFrame}.png`;
    
    currentFrame++;
    
    if (type === 'deactivate') {
      if (currentFrame <= animationFrameCount) {
        setTimeout(updateFrame, frameInterval);
      } else {
        finishAnimation();
        battleState.isActive = false;
      }
    } else {
      if (currentFrame <= animationFrameCount) {
        setTimeout(updateFrame, frameInterval);
      } else {
        finishAnimation();
        battleState.isActive = true;
        
        // Update buttons
        elements.attackButton.disabled = false;
        elements.defendButton.disabled = false;
        elements.activateButton.innerHTML = '<i class="fa-solid fa-power-off"></i> Deactivate Kagune';
        elements.activateButton.classList.remove('activate');
        elements.activateButton.classList.add('deactivate');
        
        // Start battle
        startBattle();
      }
    }
  }
  
  // Start animation
  updateFrame();
}

/**
 * Finish animation
 */
function finishAnimation() {
  elements.animationContainer.classList.remove('active');
  battleState.animationPlaying = false;
}

/**
 * Select a random opponent
 */
function selectOpponent() {
  // Get user level
  const userLevel = Math.floor(battleState.rcCells / 20) + 1;
  
  // Filter opponents by level
  const availableOpponents = opponents.filter(opponent => {
    // Allow opponents within +/- 2 levels of the user
    return opponent.level >= Math.max(1, userLevel - 2) &&
           opponent.level <= userLevel + 2;
  });
  
  // If no opponents in range, use the lowest level one
  const opponentPool = availableOpponents.length > 0 ? availableOpponents : [opponents[0]];
  
  // Randomly select from available opponents
  currentOpponent = opponentPool[Math.floor(Math.random() * opponentPool.length)];
  
  // Set opponent kagune
  battleState.opponentKagune = currentOpponent.kagune;
  
  // Set opponent health
  battleState.opponentHealth = 100 * currentOpponent.healthMod;
}

/**
 * Start battle
 */
function startBattle() {
  battleState.battleInProgress = true;
  
  // Reset health bars
  updateHealthBars();
  
  // Add battle start log entry
  addLogEntry(`Battle started against ${currentOpponent.name} (${currentOpponent.kagune} kagune)`, 'system');
}

/**
 * Reset battle state
 */
function resetBattleState() {
  battleState.battleInProgress = false;
  battleState.playerHealth = 100;
  battleState.opponentHealth = 100;
  battleState.playerBuffs = [];
  battleState.opponentBuffs = [];
  
  updateHealthBars();
  updateStatusEffects();
}

/**
 * Perform attack action
 */
function performAttack() {
  if (!battleState.isActive || !battleState.battleInProgress) return;
  
  // Calculate damage based on kagune type
  const playerStats = kaguneStats[battleState.playerKagune];
  const opponentStats = kaguneStats[battleState.opponentKagune];
  
  // Apply damage modifiers
  const baseDamage = playerStats.damage;
  const damageReduction = opponentStats.defense / 100;
  
  // Calculate final damage with randomness
  const randomFactor = 0.8 + (Math.random() * 0.4); // 80% to 120% of base damage
  let damage = Math.round(baseDamage * randomFactor * (1 - damageReduction) * (1 + (playerStats.speed / 100)));
  
  // Apply opponent damage modifier
  damage = Math.round(damage * (1 / currentOpponent.damageMod));
  
  // Apply special effect (critical hit) if chance met
  let isCritical = false;
  if (Math.random() < playerStats.specialChance) {
    damage = Math.round(damage * 1.5);
    isCritical = true;
  }
  
  // Apply damage to opponent
  battleState.opponentHealth -= damage;
  if (battleState.opponentHealth < 0) battleState.opponentHealth = 0;
  
  // Log attack
  if (isCritical) {
    addLogEntry(`You land a critical hit for ${damage} damage!`, 'player');
  } else {
    addLogEntry(`You attack for ${damage} damage`, 'player');
  }
  
  // Update health bars
  updateHealthBars();
  
  // Check for battle end
  if (battleState.opponentHealth <= 0) {
    endBattle(true);
    return;
  }
  
  // Opponent's turn
  setTimeout(opponentTurn, 1000);
}

/**
 * Perform defend action
 */
function performDefend() {
  if (!battleState.isActive || !battleState.battleInProgress) return;
  
  // Add defense buff
  battleState.playerBuffs.push({
    type: 'defense',
    value: 30,
    duration: 1
  });
  
  // Update status effects
  updateStatusEffects();
  
  // Log defend
  addLogEntry('You prepare to defend against the next attack', 'player');
  
  // Opponent's turn
  setTimeout(opponentTurn, 1000);
}

/**
 * Opponent's turn
 */
function opponentTurn() {
  if (!battleState.isActive || !battleState.battleInProgress) return;
  
  // 70% chance to attack, 30% chance to defend
  const action = Math.random() < 0.7 ? 'attack' : 'defend';
  
  if (action === 'attack') {
    // Calculate damage
    const opponentStats = kaguneStats[battleState.opponentKagune];
    const playerStats = kaguneStats[battleState.playerKagune];
    
    // Apply damage modifiers
    let baseDamage = opponentStats.damage;
    let damageReduction = playerStats.defense / 100;
    
    // Apply defense buff if present
    const defenseBuff = battleState.playerBuffs.find(buff => buff.type === 'defense');
    if (defenseBuff) {
      damageReduction += defenseBuff.value / 100;
    }
    
    // Calculate final damage with randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 80% to 120% of base damage
    let damage = Math.round(baseDamage * randomFactor * (1 - damageReduction) * (1 + (opponentStats.speed / 100)));
    
    // Apply opponent damage modifier
    damage = Math.round(damage * currentOpponent.damageMod);
    
    // Apply special effect if chance met
    let isSpecial = false;
    if (Math.random() < opponentStats.specialChance) {
      damage = Math.round(damage * 1.5);
      isSpecial = true;
    }
    
    // Apply damage to player
    battleState.playerHealth -= damage;
    if (battleState.playerHealth < 0) battleState.playerHealth = 0;
    
    // Log attack
    if (isSpecial) {
      addLogEntry(`${currentOpponent.name} lands a critical hit for ${damage} damage!`, 'opponent');
    } else {
      addLogEntry(`${currentOpponent.name} attacks for ${damage} damage`, 'opponent');
    }
  } else {
    // Add defense buff
    battleState.opponentBuffs.push({
      type: 'defense',
      value: 30,
      duration: 1
    });
    
    // Update status effects
    updateStatusEffects();
    
    // Log defend
    addLogEntry(`${currentOpponent.name} prepares to defend`, 'opponent');
  }
  
  // Update health bars
  updateHealthBars();
  
  // Check for battle end
  if (battleState.playerHealth <= 0) {
    endBattle(false);
    return;
  }
  
  // Decrease buff durations
  decreaseBuffDurations();
  updateStatusEffects();
}

/**
 * End battle
 * @param {boolean} playerWon - Whether the player won
 */
function endBattle(playerWon) {
  battleState.battleInProgress = false;
  
  if (playerWon) {
    // Calculate reward based on opponent level
    const baseReward = currentOpponent.level * 2;
    const randomBonus = Math.floor(Math.random() * 3);
    const totalReward = baseReward + randomBonus;
    
    // Add RC cells
    updateRCCells(totalReward);
    
    // Log victory
    addLogEntry(`Victory! You defeated ${currentOpponent.name} and gained ${totalReward} RC cells`, 'system');
    
    // Update user stats in database
    const userId = auth.getCurrentUser().uid;
    db.update(`users/${userId}/stats`, {
      battlesWon: db.increment(1),
      totalRCCellsEarned: db.increment(totalReward)
    }).catch(error => console.error('Error updating stats:', error));
    
  } else {
    // Log defeat
    addLogEntry(`Defeat! You were defeated by ${currentOpponent.name}`, 'system');
    
    // Update user stats in database
    const userId = auth.getCurrentUser().uid;
    db.update(`users/${userId}/stats`, {
      battlesLost: db.increment(1)
    }).catch(error => console.error('Error updating stats:', error));
  }
  
  // Reset battle controls
  elements.attackButton.disabled = true;
  elements.defendButton.disabled = true;
}

/**
 * Update RC cells
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 */
function updateRCCells(amount) {
  battleState.rcCells += amount;
  if (battleState.rcCells < 0) battleState.rcCells = 0;
  
  // Update user's RC cells in database
  const userId = auth.getCurrentUser().uid;
  db.update(`users/${userId}/profile`, {
    rcCells: battleState.rcCells
  }).catch(error => console.error('Error updating RC cells:', error));
  
  // Update RC meter
  updateRCMeter();
}

/**
 * Update RC meter display
 */
function updateRCMeter() {
  // Update count display
  elements.rcCellsCount.textContent = battleState.rcCells;
  
  // Calculate percentage (max 100 for display)
  const maxRCForMeter = 100;
  const percentage = Math.min(100, (battleState.rcCells / maxRCForMeter) * 100);
  
  // Update meter fill
  elements.rcMeterFill.style.width = `${percentage}%`;
}

/**
 * Update health bars
 */
function updateHealthBars() {
  // Convert health to percentages
  const playerHealthPercentage = (battleState.playerHealth / 100) * 100;
  const opponentHealthPercentage = (battleState.opponentHealth / (100 * currentOpponent.healthMod)) * 100;
  
  // Update health bar elements
  elements.playerHealth.style.width = `${playerHealthPercentage}%`;
  elements.opponentHealth.style.width = `${opponentHealthPercentage}%`;
}

/**
 * Decrease buff durations
 */
function decreaseBuffDurations() {
  battleState.playerBuffs = battleState.playerBuffs.map(buff => {
    return {
      ...buff,
      duration: buff.duration - 1
    };
  }).filter(buff => buff.duration > 0);
  
  battleState.opponentBuffs = battleState.opponentBuffs.map(buff => {
    return {
      ...buff,
      duration: buff.duration - 1
    };
  }).filter(buff => buff.duration > 0);
}

/**
 * Update status effects display
 */
function updateStatusEffects() {
  // Clear current status effects
  elements.playerStatus.innerHTML = '';
  elements.opponentStatus.innerHTML = '';
  
  // Add player buffs
  battleState.playerBuffs.forEach(buff => {
    const statusElement = document.createElement('div');
    statusElement.classList.add('status-effect', 'buff');
    statusElement.innerHTML = `<i class="fa-solid fa-shield"></i>`;
    statusElement.title = `Defense +${buff.value}% (${buff.duration} turns remaining)`;
    elements.playerStatus.appendChild(statusElement);
  });
  
  // Add opponent buffs
  battleState.opponentBuffs.forEach(buff => {
    const statusElement = document.createElement('div');
    statusElement.classList.add('status-effect', 'buff');
    statusElement.innerHTML = `<i class="fa-solid fa-shield"></i>`;
    statusElement.title = `Defense +${buff.value}% (${buff.duration} turns remaining)`;
    elements.opponentStatus.appendChild(statusElement);
  });
}

/**
 * Add entry to battle log
 * @param {string} message - Log message
 * @param {string} type - Log entry type (player, opponent, system)
 */
function addLogEntry(message, type) {
  const logEntry = document.createElement('div');
  logEntry.classList.add('log-entry', type);
  logEntry.textContent = message;
  
  elements.battleLog.appendChild(logEntry);
  
  // Scroll to bottom
  elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
}
