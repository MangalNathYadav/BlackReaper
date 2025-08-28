// Battle system for BlackReaper
import { 
  r, 
  db, 
  getData, 
  pushData, 
  updateData, 
  onValueChange, 
  getServerTimestamp, 
  orderByChild, 
  query, 
  limitToLast 
} from "../firebase/firebase.js";
import stateManager from "../firebase/state.js";
import ui from "../firebase/ui.js";

/**
 * BattleManager - Handles the battle system functionality
 */
class BattleManager {
  constructor() {
    this.opponents = [];
    this.user = null;
    this.userProfile = null;
    this.userStats = null;
    this.battleInProgress = false;
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the battle manager
   */
  async init() {
    // Listen for user profile updates
    document.addEventListener('blackreaper.profileUpdated', (event) => {
      this.userProfile = event.detail;
      this.updateUI();
      // Robust sidebar update
      function updateSidebar() {
        const sidebarUserName = document.querySelector('.sidebar .user-name');
        const sidebarRC = document.getElementById('rc-cell-count');
        if (sidebarUserName && sidebarRC) {
          sidebarUserName.textContent = event.detail.displayName || 'Anonymous Ghoul';
          sidebarRC.textContent = event.detail.rcCells || 0;
        } else {
          // Retry after short delay if sidebar not ready
          setTimeout(updateSidebar, 100);
        }
      }
      updateSidebar();
    });
    
    // Listen for stats updates
    document.addEventListener('blackreaper.statsUpdated', (event) => {
      this.userStats = event.detail;
    });
    
    // Load opponents when state manager has a user
    document.addEventListener('blackreaper.themeChanged', () => {
      this.updateUI();
    });
    
    // Load opponents when DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadOpponents());
    } else {
      this.loadOpponents();
    }
    
    // Set up battle button event listeners
    this.setupBattleButtons();
  }

  /**
   * Load opponents from the database
   */
  async loadOpponents() {
    try {
      const spinner = ui.spinner('opponents-container', 'Loading opponents...');
      
      const { success, exists, data } = await getData('opponents');
      
      if (success && exists && data) {
        this.opponents = Object.keys(data).map(id => ({
          id,
          ...data[id]
        }));
        
        console.log(`Loaded ${this.opponents.length} opponents`);
        this.renderOpponents();
      } else {
        console.warn('No opponents found in database');
        // Show error message in UI
        document.getElementById('opponents-container').innerHTML = `
          <div class="alert alert-warning">
            No opponents found. Please run the seed script to populate opponents.
          </div>
        `;
      }
      
      spinner.remove();
    } catch (error) {
      console.error('Error loading opponents:', error);
      ui.toast('Failed to load opponents', 'error');
    }
  }

  /**
   * Render opponents in the UI
   */
  renderOpponents() {
    const container = document.getElementById('opponents-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.opponents.forEach(opponent => {
      const opponentCard = document.createElement('div');
      opponentCard.className = 'opponent-card';
      opponentCard.dataset.opponentId = opponent.id;
      
      // Apply special styling based on opponent rank
      const rankClass = this.getRankClass(opponent.rank);
      
      opponentCard.innerHTML = `
        <div class="opponent-image ${rankClass}">
          <img src="${stateManager.decodeBase64ToImgSrc(opponent.imageBase64)}" 
               alt="${opponent.name}" 
               onerror="this.src='assets/images/placeholder-frame.png'">
          <div class="opponent-rank">${opponent.rank}</div>
        </div>
        <div class="opponent-info">
          <h3 class="opponent-name">${opponent.name}</h3>
          <div class="opponent-title">${opponent.titleTag || 'Ghoul'}</div>
          <div class="opponent-kagune">Kagune: ${opponent.kagune || 'Unknown'}</div>
          <div class="opponent-stats">
            <div class="stat-item">
              <span class="stat-label">Power:</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${Math.min(100, opponent.power / 2)}%"></div>
              </div>
              <span class="stat-value">${opponent.power}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Speed:</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${Math.min(100, opponent.speed / 2)}%"></div>
              </div>
              <span class="stat-value">${opponent.speed}</span>
            </div>
          </div>
          <button class="btn battle-btn" data-opponent-id="${opponent.id}">
            <i class="fas fa-swords"></i> Battle
          </button>
        </div>
      `;
      
      container.appendChild(opponentCard);
    });
    
    // Re-attach event listeners to the battle buttons
    this.setupBattleButtons();
  }
  
  /**
   * Get CSS class based on opponent rank
   * @param {string} rank - Opponent rank (S, S+, SS, etc.)
   * @returns {string} CSS class name
   */
  getRankClass(rank) {
    const rankMap = {
      'SSS': 'rank-sss',
      'SS+': 'rank-ss-plus',
      'SS': 'rank-ss',
      'S+': 'rank-s-plus',
      'S': 'rank-s',
      'A': 'rank-a',
      'B': 'rank-b',
      'C': 'rank-c'
    };
    
    return rankMap[rank] || '';
  }

  /**
   * Set up event listeners for battle buttons
   */
  setupBattleButtons() {
    const battleButtons = document.querySelectorAll('.battle-btn');
    
    battleButtons.forEach(button => {
      // Remove existing event listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add new event listener
      newButton.addEventListener('click', (event) => {
        const opponentId = event.currentTarget.dataset.opponentId;
        if (opponentId) {
          this.startBattle(opponentId);
        }
      });
    });
  }

  /**
   * Update UI based on current state
   */
  updateUI() {
    // Update user info if available
    if (this.userProfile) {
      const rcDisplay = document.querySelector('.rc-cells');
      if (rcDisplay) {
        rcDisplay.textContent = `${this.userProfile.rc} RC`;
      }
      
      const levelDisplay = document.querySelector('.user-level');
      if (levelDisplay) {
        levelDisplay.textContent = `Level ${this.userProfile.level}`;
      }
      
      const rankDisplay = document.querySelector('.user-rank');
      if (rankDisplay) {
        rankDisplay.textContent = `Rank ${this.userProfile.rank || this.calculateRank(this.userProfile.level)}`;
      }
    }
  }
  
  /**
   * Calculate rank based on level
   * @param {number} level - User level
   * @returns {string} Rank designation
   */
  calculateRank(level) {
    if (level >= 20) return 'SSS';
    if (level >= 18) return 'SS+';
    if (level >= 15) return 'SS';
    if (level >= 12) return 'S+';
    if (level >= 10) return 'S';
    if (level >= 7) return 'A';
    if (level >= 4) return 'B';
    return 'C';
  }

  /**
   * Start a battle with an opponent
   * @param {string} opponentId - ID of the opponent
   */
  async startBattle(opponentId) {
    if (this.battleInProgress) {
      ui.toast('Battle already in progress', 'warning');
      return;
    }
    
    this.battleInProgress = true;
    
    try {
      // Find the opponent
      const opponent = this.opponents.find(o => o.id === opponentId);
      if (!opponent) {
        throw new Error(`Opponent with ID ${opponentId} not found`);
      }
      
      // Get current user data
      if (!this.userProfile || !this.userStats) {
        throw new Error('User profile or stats not loaded');
      }
      
      // Disable all battle buttons during the battle
      const battleButtons = document.querySelectorAll('.battle-btn');
      battleButtons.forEach(btn => btn.disabled = true);
      
      // Show battle animation
      const battleSpinner = ui.fullscreenSpinner(`Battling ${opponent.name}...`);
      
      // Simulate delay for battle animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate player stats
      const playerPower = 50 + (this.userProfile.rc / 10);
      const playerSpeed = 40 + Math.min(30, this.userStats.activeDays || 0);
      
      // Calculate win probability
      const diff = (playerPower - opponent.power) * 0.08 + (playerSpeed - opponent.speed) * 0.05;
      const winProb = 1 / (1 + Math.exp(-diff)); // sigmoid function
      
      // Determine win/loss
      const roll = Math.random();
      const win = roll < winProb;
      
      // Calculate RC change based on result
      let rcDelta = 0;
      
      if (win) {
        // Calculate rank weight
        let rankWeight = 0;
        switch (opponent.rank) {
          case 'S': rankWeight = 10; break;
          case 'S+': rankWeight = 15; break;
          case 'SS': rankWeight = 20; break;
          case 'SS+': rankWeight = 25; break;
          case 'SSS': rankWeight = 30; break;
          case 'A': rankWeight = 5; break;
          default: rankWeight = 0;
        }
        
        // Calculate RC gain for win (between 20-60 + rank bonus)
        rcDelta = Math.floor(20 + Math.random() * 40) + rankWeight;
      } else {
        // Small RC gain even on loss (0-5)
        rcDelta = Math.floor(Math.random() * 6);
      }
      
      // Update battle spinner message
      battleSpinner.updateMessage(`Battle ${win ? 'won' : 'lost'}! ${win ? '+' : ''}${rcDelta} RC`);
      
      // Record battle in database
      const battleData = {
        opponentId: opponent.id,
        opponentName: opponent.name,
        result: win ? 'win' : 'loss',
        rcDelta,
        winProbability: winProb,
        playerPower,
        opponentPower: opponent.power,
        playerSpeed,
        opponentSpeed: opponent.speed,
        ts: getServerTimestamp()
      };
      
      // Add battle record
      const { success: battleSuccess, id: battleId } = await pushData(`battles/${this.userProfile.uid}`, battleData);
      
      if (!battleSuccess) {
        throw new Error('Failed to record battle');
      }
      
      // Update user RC with transaction
      const { success: rcSuccess } = await stateManager.updateRC(rcDelta);
      
      if (!rcSuccess) {
        throw new Error('Failed to update RC');
      }
      
      // Update user stats
      const statsUpdates = {
        battles: (this.userStats.battles || 0) + 1
      };
      
      if (win) {
        statsUpdates.battlesWon = (this.userStats.battlesWon || 0) + 1;
      }
      
      await updateData(`users/${this.userProfile.uid}/stats`, statsUpdates);
      
      // Add activity record
      await stateManager.addActivityRecord({
        type: 'battle',
        message: `${win ? 'Won' : 'Lost'} battle against ${opponent.name} (${win ? '+' : ''}${rcDelta} RC)`,
        ts: getServerTimestamp()
      });
      
      // Dismiss spinner after a delay
      setTimeout(() => {
        battleSpinner.remove();
        
        // Show result modal
        this.showBattleResultModal(opponent, win, rcDelta, playerPower, playerSpeed);
        
        // Re-enable battle buttons
        battleButtons.forEach(btn => btn.disabled = false);
        
        // Reset battle in progress flag
        this.battleInProgress = false;
      }, 1500);
      
    } catch (error) {
      console.error('Error during battle:', error);
      ui.toast(`Battle error: ${error.message}`, 'error');
      
      // Re-enable battle buttons
      const battleButtons = document.querySelectorAll('.battle-btn');
      battleButtons.forEach(btn => btn.disabled = false);
      
      // Reset battle in progress flag
      this.battleInProgress = false;
    }
  }

  /**
   * Show battle result modal
   * @param {Object} opponent - Opponent data
   * @param {boolean} win - Whether the battle was won
   * @param {number} rcDelta - RC gained/lost
   * @param {number} playerPower - Player's power stat
   * @param {number} playerSpeed - Player's speed stat
   */
  showBattleResultModal(opponent, win, rcDelta, playerPower, playerSpeed) {
    // Calculate new RC total
    const newRC = this.userProfile.rc;
    
    ui.modal({
      id: 'battle-result-modal',
      title: win ? 'Victory!' : 'Defeat',
      content: `
        <div class="battle-result ${win ? 'victory' : 'defeat'}">
          <div class="battle-opponents">
            <div class="battle-player">
              <div class="battle-avatar">
                <img src="${stateManager.decodeBase64ToImgSrc(this.userProfile.avatarBase64) || 'assets/images/placeholder-frame.png'}" alt="Your Avatar">
              </div>
              <div class="battle-stats">
                <div class="stat">Power: ${Math.floor(playerPower)}</div>
                <div class="stat">Speed: ${Math.floor(playerSpeed)}</div>
                <div class="stat">RC: ${newRC}</div>
              </div>
            </div>
            
            <div class="battle-vs">VS</div>
            
            <div class="battle-opponent">
              <div class="battle-avatar">
                <img src="${stateManager.decodeBase64ToImgSrc(opponent.imageBase64)}" alt="${opponent.name}">
              </div>
              <div class="battle-stats">
                <div class="stat">Power: ${opponent.power}</div>
                <div class="stat">Speed: ${opponent.speed}</div>
                <div class="stat">Rank: ${opponent.rank}</div>
              </div>
            </div>
          </div>
          
          <div class="battle-result-message">
            <h3>${win ? 'You won the battle!' : 'You were defeated!'}</h3>
            <p>${win 
              ? `You defeated ${opponent.name} and gained <strong>${rcDelta} RC</strong>!` 
              : `${opponent.name} was too strong. You gained <strong>${rcDelta} RC</strong> from the experience.`}
            </p>
          </div>
        </div>
      `,
      buttons: {
        'battle-again': {
          text: 'Battle Again',
          type: 'secondary',
          onClick: () => {
            this.startBattle(opponent.id);
          }
        },
        'close-result': {
          text: 'Close',
          type: 'primary'
        }
      }
    });
  }
}

// Initialize the battle manager when the script loads
const battleManager = new BattleManager();
export default battleManager;
