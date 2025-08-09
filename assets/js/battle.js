/**
 * BlackReaper Battle Mode
 * Tokyo Ghoul-inspired battle system for Ghoul Mode
 */

const BlackReaperBattle = (() => {
    // Private variables
    let userKagune = 'rinkaku'; // Default kagune type
    let userLevel = 1;
    let userRC = 0;
    let maxRC = 100;
    let opponents = [];
    let currentOpponent = null;
    let battleActive = false;
    
    // Kagune types and their properties
    const kaguneTypes = {
        rinkaku: {
            name: 'Rinkaku',
            icon: '🦂',
            description: 'Versatile tentacle-like kagune with high regenerative properties',
            damage: 15,
            regeneration: 8,
            critChance: 0.2
        },
        ukaku: {
            name: 'Ukaku',
            icon: '🦅',
            description: 'Lightweight, fast-firing projectile kagune',
            damage: 12,
            regeneration: 4,
            critChance: 0.3
        },
        koukaku: {
            name: 'Koukaku',
            icon: '🛡️',
            description: 'Heavy, defensive kagune with high durability',
            damage: 10,
            regeneration: 6,
            critChance: 0.1
        },
        bikaku: {
            name: 'Bikaku',
            icon: '🦎',
            description: 'Balanced tail-like kagune with no notable weaknesses',
            damage: 13,
            regeneration: 5,
            critChance: 0.15
        }
    };
    
    // Define possible opponents (ghouls/investigators)
    const possibleOpponents = [
        {
            id: 'dove1',
            name: 'Junior Investigator',
            type: 'human',
            icon: '👨‍✈️',
            hp: 80,
            damage: 8,
            quinque: 'Ukaku-type',
            difficulty: 1
        },
        {
            id: 'dove2',
            name: 'Veteran Investigator',
            type: 'human',
            icon: '👮',
            hp: 100,
            damage: 12,
            quinque: 'Koukaku-type',
            difficulty: 2
        },
        {
            id: 'ghoul1',
            name: 'Scavenger Ghoul',
            type: 'ghoul',
            icon: '👁️',
            hp: 70,
            damage: 10,
            kagune: 'Bikaku',
            difficulty: 1
        },
        {
            id: 'ghoul2',
            name: 'S-Rated Ghoul',
            type: 'ghoul',
            icon: '🎭',
            hp: 120,
            damage: 15,
            kagune: 'Rinkaku',
            difficulty: 3
        }
    ];
    
    // Initialization
    function init() {
        // Load user's kagune type and RC level from localStorage or Firebase
        loadUserData();
        
        // Initialize UI elements
        const battleSection = document.getElementById('battle-section');
        if (!battleSection) return;
        
        // Check if user is in Ghoul Mode
        if (!document.body.classList.contains('ghoul')) {
            battleSection.classList.add('hidden');
            return;
        }
        
        // Create battle UI if not already created
        if (!document.getElementById('battle-arena')) {
            createBattleUI(battleSection);
        }
        
        // Add event listeners
        document.getElementById('start-battle').addEventListener('click', startNewBattle);
        document.getElementById('attack-button').addEventListener('click', performAttack);
        document.getElementById('heal-button').addEventListener('click', performHeal);
        document.getElementById('flee-button').addEventListener('click', fleeBattle);
        
        // Refresh the RC meter
        updateRCMeter();
    }
    
    // Load user data
    function loadUserData() {
        // Attempt to load from localStorage first (for demo)
        userKagune = localStorage.getItem('user_kagune') || 'rinkaku';
        userLevel = parseInt(localStorage.getItem('user_level') || '1');
        userRC = parseInt(localStorage.getItem('user_rc') || '50');
        maxRC = 100 + ((userLevel - 1) * 25); // Max RC increases with level
        
        // In a full implementation, you'd also check Firebase
        // Firebase implementation would go here
    }
    
    // Create battle UI
    function createBattleUI(container) {
        const battleUI = document.createElement('div');
        battleUI.id = 'battle-arena';
        battleUI.className = 'battle-arena hidden';
        
        battleUI.innerHTML = `
            <div class="battle-header">
                <h3>Battle Arena</h3>
                <div class="battle-status" id="battle-status">Find an opponent to begin</div>
            </div>
            
            <div class="battle-main">
                <div class="battle-opponent">
                    <div class="opponent-icon" id="opponent-icon"></div>
                    <div class="opponent-info">
                        <h4 id="opponent-name">No opponent</h4>
                        <div class="health-bar">
                            <div class="health-fill" id="opponent-health" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="battle-vs">VS</div>
                
                <div class="battle-player">
                    <div class="player-info">
                        <h4>You (<span id="player-kagune-type">${kaguneTypes[userKagune].name}</span>)</h4>
                        <div class="health-bar">
                            <div class="health-fill" id="player-health" style="width: 100%"></div>
                        </div>
                    </div>
                    <div class="player-icon">${kaguneTypes[userKagune].icon}</div>
                </div>
            </div>
            
            <div class="battle-controls">
                <button id="attack-button" disabled>Attack</button>
                <button id="heal-button" disabled>Heal</button>
                <button id="flee-button" disabled>Flee</button>
            </div>
            
            <div class="battle-log">
                <div class="log-entries" id="battle-log"></div>
            </div>
        `;
        
        // Add battle selector
        const battleSelector = document.createElement('div');
        battleSelector.className = 'battle-selector';
        battleSelector.innerHTML = `
            <h3>Hunt for opponents</h3>
            <p>Current RC Cells: <span id="current-rc">${userRC}</span>/<span id="max-rc">${maxRC}</span></p>
            <button id="start-battle" class="glitch-btn">Find Opponent</button>
        `;
        
        container.appendChild(battleSelector);
        container.appendChild(battleUI);
    }
    
    // Update RC meter
    function updateRCMeter() {
        const rcLevel = document.getElementById('rc-level');
        const rcMeterFill = document.querySelector('.rc-meter-fill');
        
        if (rcLevel && rcMeterFill) {
            rcLevel.textContent = userRC;
            const percentage = Math.min(100, Math.max(0, (userRC / maxRC) * 100));
            rcMeterFill.style.width = `${percentage}%`;
        }
        
        // Update battle UI
        const currentRC = document.getElementById('current-rc');
        const maxRCElement = document.getElementById('max-rc');
        
        if (currentRC) currentRC.textContent = userRC;
        if (maxRCElement) maxRCElement.textContent = maxRC;
    }
    
    // Start a new battle
    function startNewBattle() {
        // Check if already in battle
        if (battleActive) {
            logBattleMessage('You must complete your current battle first.');
            return;
        }
        
        // Check if player has enough RC
        if (userRC < 20) {
            logBattleMessage('Not enough RC cells to hunt. Minimum 20 required.');
            return;
        }
        
        // Find a random opponent based on player level
        const availableOpponents = possibleOpponents.filter(
            o => o.difficulty <= Math.min(3, Math.ceil(userLevel / 2))
        );
        
        if (availableOpponents.length === 0) {
            logBattleMessage('No opponents found. Try again later.');
            return;
        }
        
        // Select random opponent
        currentOpponent = JSON.parse(JSON.stringify(
            availableOpponents[Math.floor(Math.random() * availableOpponents.length)]
        ));
        
        // Set up battle
        battleActive = true;
        
        // Show battle arena
        const battleArena = document.getElementById('battle-arena');
        battleArena.classList.remove('hidden');
        
        // Update opponent UI
        document.getElementById('opponent-icon').textContent = currentOpponent.icon;
        document.getElementById('opponent-name').textContent = currentOpponent.name;
        document.getElementById('opponent-health').style.width = '100%';
        
        // Update player UI
        document.getElementById('player-health').style.width = '100%';
        
        // Enable battle buttons
        document.getElementById('attack-button').disabled = false;
        document.getElementById('heal-button').disabled = false;
        document.getElementById('flee-button').disabled = false;
        
        // Disable start button
        document.getElementById('start-battle').disabled = true;
        
        // Log battle start
        logBattleMessage(`You've encountered ${currentOpponent.name}!`);
        
        // Use some RC cells to start battle
        userRC -= 10;
        updateRCMeter();
        saveUserData();
        
        // Add ghoul battle effect
        document.body.classList.add('battle-active');
    }
    
    // Perform attack action
    function performAttack() {
        if (!battleActive || !currentOpponent) return;
        
        // Calculate player damage with chance for critical hit
        const kaguneData = kaguneTypes[userKagune];
        const isCritical = Math.random() < kaguneData.critChance;
        const damageMultiplier = isCritical ? 1.5 : 1;
        const playerDamage = Math.floor(kaguneData.damage * damageMultiplier * (1 + (userLevel * 0.1)));
        
        // Apply damage to opponent
        currentOpponent.hp -= playerDamage;
        
        // Update opponent health bar
        const healthPercentage = Math.max(0, (currentOpponent.hp / possibleOpponents.find(o => o.id === currentOpponent.id).hp) * 100);
        document.getElementById('opponent-health').style.width = `${healthPercentage}%`;
        
        // Log attack
        if (isCritical) {
            logBattleMessage(`Critical hit! Your ${kaguneData.name} deals ${playerDamage} damage!`);
        } else {
            logBattleMessage(`You attack with your ${kaguneData.name} for ${playerDamage} damage.`);
        }
        
        // Check if opponent is defeated
        if (currentOpponent.hp <= 0) {
            endBattle(true);
            return;
        }
        
        // Opponent's turn
        setTimeout(() => {
            // Calculate opponent damage
            const oppDamage = Math.floor(currentOpponent.damage * (1 + (Math.random() * 0.4 - 0.2)));
            
            // Player takes damage
            const playerHealth = document.getElementById('player-health');
            const currentWidth = parseInt(playerHealth.style.width) || 100;
            const newWidth = Math.max(0, currentWidth - (oppDamage / 2));
            playerHealth.style.width = `${newWidth}%`;
            
            // Log opponent attack
            if (currentOpponent.type === 'human') {
                logBattleMessage(`${currentOpponent.name} attacks with their ${currentOpponent.quinque} Quinque for ${oppDamage} damage.`);
            } else {
                logBattleMessage(`${currentOpponent.name} attacks with their ${currentOpponent.kagune} for ${oppDamage} damage.`);
            }
            
            // Check if player is defeated
            if (newWidth <= 0) {
                endBattle(false);
            }
        }, 1000);
    }
    
    // Perform heal action
    function performHeal() {
        if (!battleActive) return;
        
        // Check if player has enough RC to heal
        if (userRC < 15) {
            logBattleMessage('Not enough RC cells to heal.');
            return;
        }
        
        // Calculate healing amount based on kagune regeneration
        const healAmount = kaguneTypes[userKagune].regeneration * (1 + (userLevel * 0.1));
        
        // Update health bar
        const playerHealth = document.getElementById('player-health');
        const currentWidth = parseInt(playerHealth.style.width) || 0;
        const newWidth = Math.min(100, currentWidth + healAmount);
        playerHealth.style.width = `${newWidth}%`;
        
        // Use RC cells for healing
        userRC -= 15;
        updateRCMeter();
        saveUserData();
        
        // Log healing
        logBattleMessage(`You consume RC cells to heal. HP increased by ${healAmount.toFixed(1)}%.`);
        
        // Opponent's turn
        setTimeout(() => {
            // Calculate opponent damage
            const oppDamage = Math.floor(currentOpponent.damage * (1 + (Math.random() * 0.3 - 0.1)));
            
            // Player takes damage
            const playerHealth = document.getElementById('player-health');
            const currentWidth = parseInt(playerHealth.style.width) || 100;
            const newWidth = Math.max(0, currentWidth - (oppDamage / 2));
            playerHealth.style.width = `${newWidth}%`;
            
            // Log opponent attack
            if (currentOpponent.type === 'human') {
                logBattleMessage(`${currentOpponent.name} attacks with their ${currentOpponent.quinque} for ${oppDamage} damage.`);
            } else {
                logBattleMessage(`${currentOpponent.name} attacks with their ${currentOpponent.kagune} for ${oppDamage} damage.`);
            }
            
            // Check if player is defeated
            if (newWidth <= 0) {
                endBattle(false);
            }
        }, 1000);
    }
    
    // Flee from battle
    function fleeBattle() {
        if (!battleActive) return;
        
        // 50% chance to escape
        if (Math.random() > 0.5) {
            logBattleMessage('You successfully escaped from battle.');
            resetBattle();
            
            // Lose some RC cells for fleeing
            userRC = Math.max(0, userRC - 5);
            updateRCMeter();
            saveUserData();
        } else {
            logBattleMessage('Failed to escape! Your opponent attacks.');
            
            // Opponent gets a free attack
            setTimeout(() => {
                // Calculate opponent damage
                const oppDamage = Math.floor(currentOpponent.damage * 1.2); // Extra damage for failed escape
                
                // Player takes damage
                const playerHealth = document.getElementById('player-health');
                const currentWidth = parseInt(playerHealth.style.width) || 100;
                const newWidth = Math.max(0, currentWidth - (oppDamage / 2));
                playerHealth.style.width = `${newWidth}%`;
                
                // Log opponent attack
                logBattleMessage(`${currentOpponent.name} catches you and deals ${oppDamage} damage!`);
                
                // Check if player is defeated
                if (newWidth <= 0) {
                    endBattle(false);
                }
            }, 1000);
        }
    }
    
    // End battle
    function endBattle(victory) {
        if (victory) {
            // Calculate rewards
            const rcGain = 20 + (currentOpponent.difficulty * 10) + Math.floor(Math.random() * 10);
            const levelProgress = currentOpponent.difficulty;
            
            // Add RC cells
            userRC = Math.min(maxRC, userRC + rcGain);
            
            // Log victory
            logBattleMessage(`Victory! You defeated ${currentOpponent.name}.`);
            logBattleMessage(`You gained ${rcGain} RC cells.`);
            
            // Check for level up
            checkLevelUp(levelProgress);
            
            // Play victory sound
            playSound('victory');
            
        } else {
            // Lose RC cells
            const rcLoss = 10 + Math.floor(Math.random() * 10);
            userRC = Math.max(0, userRC - rcLoss);
            
            // Log defeat
            logBattleMessage(`Defeat! ${currentOpponent.name} has beaten you.`);
            logBattleMessage(`You lost ${rcLoss} RC cells.`);
            
            // Play defeat sound
            playSound('defeat');
        }
        
        // Update RC meter
        updateRCMeter();
        
        // Save user data
        saveUserData();
        
        // Add reset button
        const battleLog = document.getElementById('battle-log');
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Continue';
        resetButton.className = 'continue-btn';
        resetButton.addEventListener('click', resetBattle);
        
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'battle-continue';
        buttonWrapper.appendChild(resetButton);
        
        battleLog.appendChild(buttonWrapper);
        
        // Disable battle buttons
        document.getElementById('attack-button').disabled = true;
        document.getElementById('heal-button').disabled = true;
        document.getElementById('flee-button').disabled = true;
        
        // Track in analytics
        if (window.BlackReaperAnalytics) {
            window.BlackReaperAnalytics.trackEvent('battle_completed', {
                opponent: currentOpponent.name,
                result: victory ? 'victory' : 'defeat',
                rc_change: victory ? rcGain : -rcLoss
            });
        }
    }
    
    // Reset battle state
    function resetBattle() {
        battleActive = false;
        currentOpponent = null;
        
        // Hide battle arena
        const battleArena = document.getElementById('battle-arena');
        battleArena.classList.add('hidden');
        
        // Clear battle log
        const battleLog = document.getElementById('battle-log');
        battleLog.innerHTML = '';
        
        // Enable start button
        document.getElementById('start-battle').disabled = false;
        
        // Remove battle effect
        document.body.classList.remove('battle-active');
    }
    
    // Check for level up
    function checkLevelUp(progress) {
        // Simple level up system
        if (userRC >= maxRC * 0.9) {
            userLevel++;
            maxRC = 100 + ((userLevel - 1) * 25);
            
            logBattleMessage(`Level Up! You are now level ${userLevel}!`);
            logBattleMessage(`Your maximum RC cells increased to ${maxRC}.`);
            
            // Play level up sound
            playSound('levelup');
            
            // Save user data
            saveUserData();
            
            // Unlock kagune types based on level
            if (userLevel >= 3 && !localStorage.getItem('kagune_ukaku')) {
                localStorage.setItem('kagune_ukaku', 'unlocked');
                logBattleMessage('Kagune Evolution: Ukaku type unlocked!');
            }
            if (userLevel >= 5 && !localStorage.getItem('kagune_koukaku')) {
                localStorage.setItem('kagune_koukaku', 'unlocked');
                logBattleMessage('Kagune Evolution: Koukaku type unlocked!');
            }
            if (userLevel >= 8 && !localStorage.getItem('kagune_bikaku')) {
                localStorage.setItem('kagune_bikaku', 'unlocked');
                logBattleMessage('Kagune Evolution: Bikaku type unlocked!');
            }
        }
    }
    
    // Log battle messages
    function logBattleMessage(message) {
        const battleLog = document.getElementById('battle-log');
        const messageElement = document.createElement('div');
        messageElement.className = 'log-entry';
        messageElement.textContent = message;
        
        battleLog.appendChild(messageElement);
        battleLog.scrollTop = battleLog.scrollHeight;
        
        // Update battle status
        const battleStatus = document.getElementById('battle-status');
        if (battleStatus) {
            battleStatus.textContent = message;
        }
    }
    
    // Play sound effects
    function playSound(type) {
        // Check if audio is muted
        const audioControls = document.getElementById('toggle-audio');
        if (audioControls && audioControls.querySelector('.audio-off').classList.contains('hidden')) {
            const audio = new Audio();
            
            switch(type) {
                case 'victory':
                    audio.src = 'assets/audio/victory.mp3';
                    break;
                case 'defeat':
                    audio.src = 'assets/audio/defeat.mp3';
                    break;
                case 'levelup':
                    audio.src = 'assets/audio/levelup.mp3';
                    break;
                default:
                    return;
            }
            
            audio.volume = 0.4;
            audio.play();
        }
    }
    
    // Save user data
    function saveUserData() {
        localStorage.setItem('user_kagune', userKagune);
        localStorage.setItem('user_level', userLevel.toString());
        localStorage.setItem('user_rc', userRC.toString());
        
        // In a full implementation, you'd also save to Firebase
        // Firebase implementation would go here
    }
    
    // Public methods
    return {
        init: init,
        getCurrentRC: () => userRC,
        getMaxRC: () => maxRC
    };
})();

// Initialize when DOM is loaded and user is logged in
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const checkLoginStatus = setInterval(() => {
        if (window.isLoggedIn) {
            BlackReaperBattle.init();
            clearInterval(checkLoginStatus);
        }
    }, 500);
});
