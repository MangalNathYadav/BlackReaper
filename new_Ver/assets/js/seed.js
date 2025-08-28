// Seed data for BlackReaper app

/**
 * Seed data manager for BlackReaper app
 * - Handles initial data seeding for opponents, achievements, etc.
 */
class SeedManager {
  /**
   * Initialize seeding
   * @param {Object} firebase - Firebase instance with database methods
   */
  constructor(firebase) {
    this.firebase = firebase;
  }
  
  /**
   * Seed all data (opponents, achievements, etc.)
   */
  async seedAllData() {
    try {
      console.log('Starting data seeding process...');
      
      await this.seedOpponents();
      await this.seedAchievements();
      
      console.log('All data seeding completed successfully');
      return {
        success: true,
        message: 'All data seeding completed successfully'
      };
    } catch (error) {
      console.error('Error seeding data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Seed opponent data
   */
  async seedOpponents() {
    const opponentData = {
      // Base Opponents (Unlocked from start)
      'opponent-001': {
        id: 'opponent-001',
        name: 'Novice Ghoul',
        type: 'ghoul',
        rank: 'C',
        level: 1,
        imageBase64: null, // Will use default placeholder
        stats: {
          power: 10,
          speed: 10,
          durability: 10,
          intelligence: 5
        },
        rewards: {
          rcMin: 10,
          rcMax: 20,
          baseXP: 5
        },
        unlockRequirement: {
          level: 1,
          rc: 0
        }
      },
      'opponent-002': {
        id: 'opponent-002',
        name: 'Investigator Trainee',
        type: 'human',
        rank: 'C',
        level: 2,
        imageBase64: null,
        stats: {
          power: 15,
          speed: 12,
          durability: 15,
          intelligence: 10
        },
        rewards: {
          rcMin: 15,
          rcMax: 25,
          baseXP: 8
        },
        unlockRequirement: {
          level: 1,
          rc: 0
        }
      },
      
      // Early Progression Opponents
      'opponent-003': {
        id: 'opponent-003',
        name: 'Kagune-wielding Ghoul',
        type: 'ghoul',
        rank: 'B',
        level: 4,
        imageBase64: null,
        stats: {
          power: 25,
          speed: 20,
          durability: 20,
          intelligence: 15
        },
        rewards: {
          rcMin: 25,
          rcMax: 40,
          baseXP: 15
        },
        unlockRequirement: {
          level: 3,
          rc: 100
        }
      },
      'opponent-004': {
        id: 'opponent-004',
        name: 'Junior Investigator',
        type: 'human',
        rank: 'B',
        level: 5,
        imageBase64: null,
        stats: {
          power: 30,
          speed: 25,
          durability: 25,
          intelligence: 30
        },
        rewards: {
          rcMin: 30,
          rcMax: 50,
          baseXP: 20
        },
        unlockRequirement: {
          level: 4,
          rc: 200
        }
      },
      
      // Mid Progression Opponents
      'opponent-005': {
        id: 'opponent-005',
        name: 'Rinkaku Ghoul',
        type: 'ghoul',
        rank: 'A',
        level: 7,
        imageBase64: null,
        stats: {
          power: 45,
          speed: 40,
          durability: 35,
          intelligence: 30
        },
        rewards: {
          rcMin: 50,
          rcMax: 80,
          baseXP: 35
        },
        unlockRequirement: {
          level: 6,
          rc: 500
        }
      },
      'opponent-006': {
        id: 'opponent-006',
        name: 'Quinque-wielding Investigator',
        type: 'human',
        rank: 'A',
        level: 8,
        imageBase64: null,
        stats: {
          power: 50,
          speed: 45,
          durability: 40,
          intelligence: 50
        },
        rewards: {
          rcMin: 60,
          rcMax: 100,
          baseXP: 40
        },
        unlockRequirement: {
          level: 7,
          rc: 700
        }
      },
      
      // Advanced Opponents
      'opponent-007': {
        id: 'opponent-007',
        name: 'Kakuja Ghoul',
        type: 'ghoul',
        rank: 'S',
        level: 10,
        imageBase64: null,
        stats: {
          power: 70,
          speed: 65,
          durability: 70,
          intelligence: 55
        },
        rewards: {
          rcMin: 100,
          rcMax: 150,
          baseXP: 65
        },
        unlockRequirement: {
          level: 9,
          rc: 1000
        }
      },
      'opponent-008': {
        id: 'opponent-008',
        name: 'Special Class Investigator',
        type: 'human',
        rank: 'S',
        level: 11,
        imageBase64: null,
        stats: {
          power: 80,
          speed: 75,
          durability: 70,
          intelligence: 85
        },
        rewards: {
          rcMin: 120,
          rcMax: 180,
          baseXP: 70
        },
        unlockRequirement: {
          level: 10,
          rc: 1200
        }
      },
      
      // Elite Opponents
      'opponent-009': {
        id: 'opponent-009',
        name: 'One-Eyed Ghoul',
        type: 'hybrid',
        rank: 'SS',
        level: 15,
        imageBase64: null,
        stats: {
          power: 100,
          speed: 100,
          durability: 95,
          intelligence: 90
        },
        rewards: {
          rcMin: 200,
          rcMax: 300,
          baseXP: 120
        },
        unlockRequirement: {
          level: 13,
          rc: 2000
        }
      },
      'opponent-010': {
        id: 'opponent-010',
        name: 'Arima Kishou',
        type: 'human',
        rank: 'SSS',
        level: 20,
        imageBase64: null,
        stats: {
          power: 150,
          speed: 150,
          durability: 120,
          intelligence: 150
        },
        rewards: {
          rcMin: 300,
          rcMax: 500,
          baseXP: 200
        },
        unlockRequirement: {
          level: 18,
          rc: 5000
        }
      }
    };
    
    console.log('Seeding opponents...');
    
    // Check if opponents already exist
    const existingData = await this.firebase.getData('opponents');
    if (existingData.exists && Object.keys(existingData.data).length > 0) {
      console.log('Opponents already seeded, skipping...');
      return;
    }
    
    // Seed all opponents
    for (const [id, opponent] of Object.entries(opponentData)) {
      await this.firebase.updateData(`opponents/${id}`, opponent);
    }
    
    console.log(`Seeded ${Object.keys(opponentData).length} opponents`);
  }
  
  /**
   * Seed achievement data
   */
  async seedAchievements() {
    const achievementData = {
      // Task-related achievements
      'achievement-001': {
        id: 'achievement-001',
        name: 'Task Beginner',
        description: 'Complete 10 tasks',
        icon: 'fas fa-tasks',
        category: 'tasks',
        thresholds: [10],
        rewards: {
          rc: 50,
          xp: 20
        }
      },
      'achievement-002': {
        id: 'achievement-002',
        name: 'Task Master',
        description: 'Complete 100 tasks',
        icon: 'fas fa-tasks',
        category: 'tasks',
        thresholds: [100],
        rewards: {
          rc: 200,
          xp: 50
        }
      },
      'achievement-003': {
        id: 'achievement-003',
        name: 'Task Legend',
        description: 'Complete 500 tasks',
        icon: 'fas fa-tasks',
        category: 'tasks',
        thresholds: [500],
        rewards: {
          rc: 500,
          xp: 100
        }
      },
      
      // Pomodoro-related achievements
      'achievement-004': {
        id: 'achievement-004',
        name: 'Focus Initiate',
        description: 'Complete 10 pomodoro sessions',
        icon: 'fas fa-clock',
        category: 'pomodoro',
        thresholds: [10],
        rewards: {
          rc: 50,
          xp: 20
        }
      },
      'achievement-005': {
        id: 'achievement-005',
        name: 'Focus Adept',
        description: 'Complete 50 pomodoro sessions',
        icon: 'fas fa-clock',
        category: 'pomodoro',
        thresholds: [50],
        rewards: {
          rc: 200,
          xp: 50
        }
      },
      'achievement-006': {
        id: 'achievement-006',
        name: 'Focus Master',
        description: 'Complete 200 pomodoro sessions',
        icon: 'fas fa-clock',
        category: 'pomodoro',
        thresholds: [200],
        rewards: {
          rc: 500,
          xp: 100
        }
      },
      
      // Battle-related achievements
      'achievement-007': {
        id: 'achievement-007',
        name: 'Battle Novice',
        description: 'Win 5 battles',
        icon: 'fas fa-swords',
        category: 'battles',
        thresholds: [5],
        rewards: {
          rc: 50,
          xp: 20
        }
      },
      'achievement-008': {
        id: 'achievement-008',
        name: 'Battle Veteran',
        description: 'Win 25 battles',
        icon: 'fas fa-swords',
        category: 'battles',
        thresholds: [25],
        rewards: {
          rc: 200,
          xp: 50
        }
      },
      'achievement-009': {
        id: 'achievement-009',
        name: 'Battle Champion',
        description: 'Win 100 battles',
        icon: 'fas fa-swords',
        category: 'battles',
        thresholds: [100],
        rewards: {
          rc: 500,
          xp: 100
        }
      },
      
      // Journal-related achievements
      'achievement-010': {
        id: 'achievement-010',
        name: 'Journal Beginner',
        description: 'Create 5 journal entries',
        icon: 'fas fa-book',
        category: 'journal',
        thresholds: [5],
        rewards: {
          rc: 50,
          xp: 20
        }
      },
      'achievement-011': {
        id: 'achievement-011',
        name: 'Journal Enthusiast',
        description: 'Create 20 journal entries',
        icon: 'fas fa-book',
        category: 'journal',
        thresholds: [20],
        rewards: {
          rc: 200,
          xp: 50
        }
      },
      'achievement-012': {
        id: 'achievement-012',
        name: 'Journal Scholar',
        description: 'Create 50 journal entries',
        icon: 'fas fa-book',
        category: 'journal',
        thresholds: [50],
        rewards: {
          rc: 500,
          xp: 100
        }
      },
      
      // RC Cell-related achievements
      'achievement-013': {
        id: 'achievement-013',
        name: 'RC Cell Collector',
        description: 'Accumulate 1,000 RC cells',
        icon: 'fas fa-dna',
        category: 'rc',
        thresholds: [1000],
        rewards: {
          xp: 50
        }
      },
      'achievement-014': {
        id: 'achievement-014',
        name: 'RC Cell Hoarder',
        description: 'Accumulate 10,000 RC cells',
        icon: 'fas fa-dna',
        category: 'rc',
        thresholds: [10000],
        rewards: {
          xp: 100
        }
      },
      
      // Level-related achievements
      'achievement-015': {
        id: 'achievement-015',
        name: 'Level Climber',
        description: 'Reach level 5',
        icon: 'fas fa-level-up-alt',
        category: 'level',
        thresholds: [5],
        rewards: {
          rc: 100
        }
      },
      'achievement-016': {
        id: 'achievement-016',
        name: 'Level Master',
        description: 'Reach level 10',
        icon: 'fas fa-level-up-alt',
        category: 'level',
        thresholds: [10],
        rewards: {
          rc: 300
        }
      },
      
      // Consistency-related achievements
      'achievement-017': {
        id: 'achievement-017',
        name: 'Daily Dedication',
        description: 'Use the app for 7 consecutive days',
        icon: 'fas fa-calendar-check',
        category: 'streak',
        thresholds: [7],
        rewards: {
          rc: 100,
          xp: 30
        }
      },
      'achievement-018': {
        id: 'achievement-018',
        name: 'Weekly Warrior',
        description: 'Use the app for 30 consecutive days',
        icon: 'fas fa-calendar-check',
        category: 'streak',
        thresholds: [30],
        rewards: {
          rc: 300,
          xp: 100
        }
      }
    };
    
    console.log('Seeding achievements...');
    
    // Check if achievements already exist
    const existingData = await this.firebase.getData('achievements');
    if (existingData.exists && Object.keys(existingData.data).length > 0) {
      console.log('Achievements already seeded, skipping...');
      return;
    }
    
    // Seed all achievements
    for (const [id, achievement] of Object.entries(achievementData)) {
      await this.firebase.updateData(`achievements/${id}`, achievement);
    }
    
    console.log(`Seeded ${Object.keys(achievementData).length} achievements`);
  }
}

export default SeedManager;
