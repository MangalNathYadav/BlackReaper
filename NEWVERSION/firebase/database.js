// Firebase database module
class Database {
  constructor() {
    this.db = firebase.database();
  }

  // User methods
  
  // Get user profile
  async getUserProfile(userId) {
    try {
      console.log('Fetching user profile from RTDB for user ID:', userId);
      const userRef = this.db.ref(`users/${userId}`);
      console.log('User ref path:', userRef.toString());
      
      const snapshot = await userRef.once('value');
      console.log('User profile snapshot exists:', snapshot.exists());
      
      const userData = snapshot.val();
      console.log('User profile data:', userData ? 'Found data' : 'No data found');
      
      if (userData) {
        console.log('User profile fields:', Object.keys(userData).join(', '));
      } else {
        console.warn('No user data found in RTDB, checking auth user');
        // If no data is found but we have a valid userId, create a basic profile
        const authUser = firebase.auth().currentUser;
        if (authUser && authUser.uid === userId) {
          console.log('Auth user exists, creating default profile');
          const defaultProfile = {
            displayName: authUser.displayName || 'Human',
            email: authUser.email || '',
            isAnonymous: authUser.isAnonymous || false,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            lastLogin: firebase.database.ServerValue.TIMESTAMP,
            rcCells: 100,
            mode: 'human',
            stats: {
              tasksCompleted: 0,
              pomodorosCompleted: 0,
              battlesWon: 0,
              battlesLost: 0,
              journalEntries: 0
            },
            profile: {
              bio: '',
              avatar: '',
              level: 1,
              experience: 0,
              achievements: []
            }
          };
          
          await this.updateUserProfile(userId, defaultProfile);
          console.log('Created default profile for user');
          
          // Return the newly created profile
          return defaultProfile;
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting user profile:', error);
      console.error('Error details:', error.code, error.message);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, data) {
    try {
      await this.db.ref(`users/${userId}`).update(data);
      console.log('User profile updated');
      
      // Dispatch event to notify components about profile update
      document.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { userId, updatedData: data } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  // Update specific profile fields
  async updateProfileDetails(userId, profileData) {
    try {
      console.log('Updating profile details for user:', userId);
      console.log('Profile data to update:', profileData);
      
      // First check if the profile node exists
      const profileSnapshot = await this.db.ref(`users/${userId}/profile`).once('value');
      
      // If profile doesn't exist, create it with all fields
      if (!profileSnapshot.exists()) {
        console.log('Profile node does not exist, creating it');
        // Create a profile object with default values
        const profileDefaults = {
          bio: '',
          avatar: '',
          level: 1,
          experience: 0,
          achievements: []
        };
        
        // Merge with provided data
        const completeProfileData = { ...profileDefaults, ...profileData };
        
        // Update the entire profile
        await this.db.ref(`users/${userId}`).update({ profile: completeProfileData });
        console.log('Created new profile node with data');
      } else {
        console.log('Profile node exists, updating specific fields');
        const updates = {};
        
        // For each field in profileData, create an update path
        Object.keys(profileData).forEach(field => {
          updates[`profile/${field}`] = profileData[field];
        });
        
        await this.db.ref(`users/${userId}`).update(updates);
        console.log('Updated profile fields:', Object.keys(updates).join(', '));
      }
      
      // Dispatch event to notify components
      document.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { userId, updatedData: { profile: profileData } } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating profile details:', error);
      console.error('Error details:', error.code, error.message);
      throw error;
    }
  }
  
  // Listen for user profile changes
  listenForUserProfile(userId, callback) {
    const userRef = this.db.ref(`users/${userId}`);
    
    userRef.on('value', snapshot => {
      const userData = snapshot.val() || {};
      callback(userData);
    });
    
    // Return function to unsubscribe
    return () => userRef.off('value');
  }

  // Update user mode (human/ghoul)
  async updateUserMode(userId, mode) {
    try {
      await this.db.ref(`users/${userId}/mode`).set(mode);
      console.log(`Mode updated to: ${mode}`);
      return true;
    } catch (error) {
      console.error('Error updating user mode:', error);
      throw error;
    }
  }

  // Update RC cells (add or subtract)
  async updateRCCells(userId, amount) {
    const userRef = this.db.ref(`users/${userId}`);
    
    try {
      // Use a transaction to safely update RC cells
      await userRef.child('rcCells').transaction(currentCells => {
        return (currentCells || 0) + amount;
      });
      
      console.log(`RC cells updated by: ${amount}`);
      return true;
    } catch (error) {
      console.error('Error updating RC cells:', error);
      throw error;
    }
  }

  // Task methods
  
  // Create a task
  async createTask(userId, taskData) {
    try {
      const newTaskRef = this.db.ref(`tasks/${userId}`).push();
      taskData.id = newTaskRef.key;
      taskData.createdAt = firebase.database.ServerValue.TIMESTAMP;
      
      await newTaskRef.set(taskData);
      console.log('Task created:', taskData.id);
      return taskData;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get all tasks for a user
  async getUserTasks(userId) {
    try {
      const snapshot = await this.db.ref(`tasks/${userId}`).once('value');
      const tasks = snapshot.val() || {};
      
      // Convert object to array
      return Object.values(tasks);
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(userId, taskId, taskData) {
    try {
      await this.db.ref(`tasks/${userId}/${taskId}`).update(taskData);
      console.log('Task updated:', taskId);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(userId, taskId) {
    try {
      await this.db.ref(`tasks/${userId}/${taskId}`).remove();
      console.log('Task deleted:', taskId);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Mark task as completed and award RC cells
  async completeTask(userId, taskId, rcCellsReward = 10) {
    try {
      // Update task
      await this.db.ref(`tasks/${userId}/${taskId}`).update({
        completed: true,
        completedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      // Award RC cells
      await this.updateRCCells(userId, rcCellsReward);
      
      // Update user stats
      await this.db.ref(`users/${userId}/stats/tasksCompleted`).transaction(current => {
        return (current || 0) + 1;
      });
      
      console.log('Task completed:', taskId);
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  // Journal methods
  
  // Create a journal entry
  async createJournalEntry(userId, entryData) {
    try {
      const newEntryRef = this.db.ref(`journals/${userId}`).push();
      entryData.id = newEntryRef.key;
      entryData.createdAt = firebase.database.ServerValue.TIMESTAMP;
      
      await newEntryRef.set(entryData);
      
      // Update user stats
      await this.db.ref(`users/${userId}/stats/journalEntries`).transaction(current => {
        return (current || 0) + 1;
      });
      
      console.log('Journal entry created:', entryData.id);
      return entryData;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  // Get all journal entries for a user
  async getJournalEntries(userId) {
    try {
      const snapshot = await this.db.ref(`journals/${userId}`).once('value');
      const entries = snapshot.val() || {};
      
      // Convert object to array and sort by createdAt (newest first)
      return Object.values(entries).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  }

  // Ghoul Chat methods
  
  // Send a chat message
  async sendChatMessage(userId, message) {
    try {
      const user = await this.getUserProfile(userId);
      const displayName = user.displayName || 'Unknown Ghoul';
      
      const newMessageRef = this.db.ref('chat/ghoulRooms/global/messages').push();
      
      await newMessageRef.set({
        id: newMessageRef.key,
        userId,
        displayName,
        message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('Chat message sent');
      return true;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Listen for new chat messages
  listenForChatMessages(callback) {
    const chatRef = this.db.ref('chat/ghoulRooms/global/messages');
    
    // Listen for new messages and limit to last 50
    chatRef.orderByChild('timestamp').limitToLast(50).on('value', snapshot => {
      const messages = snapshot.val() || {};
      
      // Convert to array and sort by timestamp
      const messageArray = Object.values(messages).sort((a, b) => a.timestamp - b.timestamp);
      
      callback(messageArray);
    });
    
    // Return function to unsubscribe
    return () => chatRef.off('value');
  }

  // Battle methods
  
  // Create a battle
  async createBattle(player1Id, player2Id, player1Stats, player2Stats) {
    try {
      const battleRef = this.db.ref('battles').push();
      const battleId = battleRef.key;
      
      const battleData = {
        id: battleId,
        player1Id,
        player2Id,
        player1Stats,
        player2Stats,
        turns: [],
        status: 'active',
        currentTurn: player1Id,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };
      
      await battleRef.set(battleData);
      console.log('Battle created:', battleId);
      return battleData;
    } catch (error) {
      console.error('Error creating battle:', error);
      throw error;
    }
  }

  // Perform battle turn
  async performBattleTurn(battleId, playerId, action) {
    try {
      const battleRef = this.db.ref(`battles/${battleId}`);
      const snapshot = await battleRef.once('value');
      const battle = snapshot.val();
      
      if (!battle) {
        throw new Error('Battle not found');
      }
      
      if (battle.status !== 'active') {
        throw new Error('Battle is already finished');
      }
      
      if (battle.currentTurn !== playerId) {
        throw new Error('Not your turn');
      }
      
      // Process the turn (this would be expanded with actual battle logic)
      const turnData = {
        playerId,
        action,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };
      
      // Add turn to the battle
      const newTurnRef = battleRef.child('turns').push();
      await newTurnRef.set(turnData);
      
      // Update current turn
      const nextPlayerId = playerId === battle.player1Id ? battle.player2Id : battle.player1Id;
      await battleRef.update({ currentTurn: nextPlayerId });
      
      console.log('Turn performed:', turnData);
      return true;
    } catch (error) {
      console.error('Error performing battle turn:', error);
      throw error;
    }
  }

  // Finish battle and award RC cells
  async finishBattle(battleId, winnerId, rcCellsReward = 50) {
    try {
      const battleRef = this.db.ref(`battles/${battleId}`);
      const snapshot = await battleRef.once('value');
      const battle = snapshot.val();
      
      if (!battle) {
        throw new Error('Battle not found');
      }
      
      if (battle.status !== 'active') {
        throw new Error('Battle is already finished');
      }
      
      // Update battle status
      await battleRef.update({
        status: 'completed',
        winnerId,
        completedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      // Award RC cells to winner
      await this.updateRCCells(winnerId, rcCellsReward);
      
      // Update winner's stats
      await this.db.ref(`users/${winnerId}/stats/battlesWon`).transaction(current => {
        return (current || 0) + 1;
      });
      
      // Update loser's stats
      const loserId = winnerId === battle.player1Id ? battle.player2Id : battle.player1Id;
      await this.db.ref(`users/${loserId}/stats/battlesLost`).transaction(current => {
        return (current || 0) + 1;
      });
      
      console.log('Battle finished, winner:', winnerId);
      return true;
    } catch (error) {
      console.error('Error finishing battle:', error);
      throw error;
    }
  }

  // Pomodoro methods
  
  // Record completed pomodoro and award RC cells
  async completePomodoro(userId, duration, rcCellsReward) {
    try {
      const pomodoroRef = this.db.ref(`pomodoros/${userId}`).push();
      
      await pomodoroRef.set({
        id: pomodoroRef.key,
        userId,
        duration,
        completedAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      // Award RC cells
      await this.updateRCCells(userId, rcCellsReward);
      
      // Update user stats
      await this.db.ref(`users/${userId}/stats/pomodorosCompleted`).transaction(current => {
        return (current || 0) + 1;
      });
      
      console.log('Pomodoro completed, RC cells awarded:', rcCellsReward);
      return true;
    } catch (error) {
      console.error('Error completing pomodoro:', error);
      throw error;
    }
  }
}

// Export the Database instance
const database = new Database();
window.database = database;
