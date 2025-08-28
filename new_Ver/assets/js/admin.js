// Admin functionality for BlackReaper app
import { 
  r, 
  db, 
  updateData, 
  getData, 
  getServerTimestamp 
} from "../firebase/firebase.js";
import stateManager from "../firebase/state.js";
import ui from "../firebase/ui.js";
import SeedManager from "./seed.js";

/**
 * AdminManager - Handles administrative functions
 * This is for development and admin use only
 */
class AdminManager {
  constructor() {
    this.seedManager = null;
    this.init();
  }

  /**
   * Initialize admin functionality
   */
  async init() {
    // Initialize seed manager
    this.seedManager = new SeedManager({
      getData,
      updateData,
      getServerTimestamp
    });
    
    // Listen for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAdmin());
    } else {
      this.setupAdmin();
    }
  }

  /**
   * Set up admin UI
   */
  setupAdmin() {
    // Check if current page is admin
    const isAdminPage = document.body.classList.contains('admin-page');
    if (!isAdminPage) return;
    
    // Verify admin status
    this.checkAdminStatus().then(isAdmin => {
      if (!isAdmin) {
        this.showNotAuthorized();
        return;
      }
      
      // Set up admin UI components
      this.setupSeedingControls();
      this.setupUserManagement();
      this.setupSystemStats();
    });
  }

  /**
   * Check if current user is an admin
   */
  async checkAdminStatus() {
    if (!stateManager.user) return false;
    
    try {
      // Get user data
      const userData = await getData(`users/${stateManager.user.uid}`);
      return userData.exists && userData.data?.isAdmin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Show not authorized message
   */
  showNotAuthorized() {
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = `
        <div class="not-authorized">
          <h2>Not Authorized</h2>
          <p>You do not have permission to access this page.</p>
          <a href="dashboard.html" class="btn primary">Go to Dashboard</a>
        </div>
      `;
    }
  }

  /**
   * Set up data seeding controls
   */
  setupSeedingControls() {
    const seedingSection = document.getElementById('seeding-section');
    if (!seedingSection) return;
    
    seedingSection.innerHTML = `
      <h2>Data Seeding</h2>
      <div class="admin-card">
        <h3>Seed Database</h3>
        <p>Seed the database with initial data. This will create opponents, achievements, and other data needed for the app to function.</p>
        <div class="button-group">
          <button id="seed-opponents-btn" class="btn secondary">
            <i class="fas fa-users"></i> Seed Opponents
          </button>
          <button id="seed-achievements-btn" class="btn secondary">
            <i class="fas fa-trophy"></i> Seed Achievements
          </button>
          <button id="seed-all-btn" class="btn primary">
            <i class="fas fa-database"></i> Seed All Data
          </button>
        </div>
      </div>
    `;
    
    // Set up event listeners
    document.getElementById('seed-opponents-btn').addEventListener('click', () => {
      this.handleSeedOpponents();
    });
    
    document.getElementById('seed-achievements-btn').addEventListener('click', () => {
      this.handleSeedAchievements();
    });
    
    document.getElementById('seed-all-btn').addEventListener('click', () => {
      this.handleSeedAllData();
    });
  }

  /**
   * Set up user management controls
   */
  setupUserManagement() {
    const userSection = document.getElementById('user-management-section');
    if (!userSection) return;
    
    userSection.innerHTML = `
      <h2>User Management</h2>
      <div class="admin-card">
        <h3>Search Users</h3>
        <div class="form-group">
          <input type="text" id="user-search" class="form-control" 
            placeholder="Search by email, display name, or user ID">
          <button id="user-search-btn" class="btn primary">
            <i class="fas fa-search"></i> Search
          </button>
        </div>
        
        <div id="user-search-results" class="search-results">
          <p>Enter search terms above to find users.</p>
        </div>
      </div>
    `;
    
    // Set up event listeners
    document.getElementById('user-search-btn').addEventListener('click', () => {
      const searchTerm = document.getElementById('user-search').value.trim();
      if (searchTerm) {
        this.searchUsers(searchTerm);
      }
    });
    
    // Add enter key support for search
    document.getElementById('user-search').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = document.getElementById('user-search').value.trim();
        if (searchTerm) {
          this.searchUsers(searchTerm);
        }
      }
    });
  }

  /**
   * Set up system stats display
   */
  setupSystemStats() {
    const statsSection = document.getElementById('system-stats-section');
    if (!statsSection) return;
    
    statsSection.innerHTML = `
      <h2>System Statistics</h2>
      <div class="admin-card">
        <div id="system-stats-loading" class="loading-container">
          <div class="spinner"></div>
          <p>Loading system stats...</p>
        </div>
        
        <div id="system-stats-content" class="stats-grid" style="display: none;">
          <div class="stat-card">
            <h3>Total Users</h3>
            <div class="stat-value" id="stat-total-users">-</div>
          </div>
          
          <div class="stat-card">
            <h3>Active Today</h3>
            <div class="stat-value" id="stat-active-today">-</div>
          </div>
          
          <div class="stat-card">
            <h3>Total Tasks</h3>
            <div class="stat-value" id="stat-total-tasks">-</div>
          </div>
          
          <div class="stat-card">
            <h3>Total Battles</h3>
            <div class="stat-value" id="stat-total-battles">-</div>
          </div>
          
          <div class="stat-card">
            <h3>Total Entries</h3>
            <div class="stat-value" id="stat-total-entries">-</div>
          </div>
          
          <div class="stat-card">
            <h3>Total RC</h3>
            <div class="stat-value" id="stat-total-rc">-</div>
          </div>
        </div>
      </div>
    `;
    
    // Load system stats
    this.loadSystemStats();
  }

  /**
   * Handle seed opponents
   */
  async handleSeedOpponents() {
    try {
      ui.confirm({
        title: 'Seed Opponents',
        message: 'This will seed all opponent data. Existing data with the same IDs will be overwritten. Continue?',
        confirmText: 'Yes, Seed Opponents',
        cancelText: 'Cancel',
        onConfirm: async () => {
          const loadingSpinner = ui.fullscreenSpinner('Seeding opponent data...');
          
          try {
            await this.seedManager.seedOpponents();
            loadingSpinner.remove();
            ui.toast('Opponent data seeded successfully', 'success');
          } catch (error) {
            loadingSpinner.remove();
            console.error('Error seeding opponents:', error);
            ui.toast('Failed to seed opponent data', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Error in seed opponents handler:', error);
      ui.toast('An error occurred', 'error');
    }
  }

  /**
   * Handle seed achievements
   */
  async handleSeedAchievements() {
    try {
      ui.confirm({
        title: 'Seed Achievements',
        message: 'This will seed all achievement data. Existing data with the same IDs will be overwritten. Continue?',
        confirmText: 'Yes, Seed Achievements',
        cancelText: 'Cancel',
        onConfirm: async () => {
          const loadingSpinner = ui.fullscreenSpinner('Seeding achievement data...');
          
          try {
            await this.seedManager.seedAchievements();
            loadingSpinner.remove();
            ui.toast('Achievement data seeded successfully', 'success');
          } catch (error) {
            loadingSpinner.remove();
            console.error('Error seeding achievements:', error);
            ui.toast('Failed to seed achievement data', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Error in seed achievements handler:', error);
      ui.toast('An error occurred', 'error');
    }
  }

  /**
   * Handle seed all data
   */
  async handleSeedAllData() {
    try {
      ui.confirm({
        title: 'Seed All Data',
        message: 'This will seed all data (opponents, achievements, etc.). Existing data with the same IDs will be overwritten. Continue?',
        confirmText: 'Yes, Seed All Data',
        cancelText: 'Cancel',
        onConfirm: async () => {
          const loadingSpinner = ui.fullscreenSpinner('Seeding all data...');
          
          try {
            const result = await this.seedManager.seedAllData();
            loadingSpinner.remove();
            
            if (result.success) {
              ui.toast('All data seeded successfully', 'success');
            } else {
              ui.toast(`Failed to seed all data: ${result.error}`, 'error');
            }
          } catch (error) {
            loadingSpinner.remove();
            console.error('Error seeding all data:', error);
            ui.toast('Failed to seed all data', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Error in seed all data handler:', error);
      ui.toast('An error occurred', 'error');
    }
  }

  /**
   * Search users
   * @param {string} searchTerm - Search term
   */
  async searchUsers(searchTerm) {
    try {
      const resultsContainer = document.getElementById('user-search-results');
      
      // Show loading state
      resultsContainer.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Searching users...</p>
        </div>
      `;
      
      // TODO: Implement user search
      // This would typically require a Cloud Function or server-side search
      // For now, we'll simulate a search with a timeout
      
      setTimeout(() => {
        resultsContainer.innerHTML = `
          <div class="info-message">
            <i class="fas fa-info-circle"></i>
            <p>User search requires a server-side implementation with Cloud Functions or a custom backend.</p>
          </div>
        `;
      }, 1500);
    } catch (error) {
      console.error('Error searching users:', error);
      ui.toast('Failed to search users', 'error');
      
      const resultsContainer = document.getElementById('user-search-results');
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>An error occurred while searching users.</p>
        </div>
      `;
    }
  }

  /**
   * Load system statistics
   */
  async loadSystemStats() {
    try {
      const loadingContainer = document.getElementById('system-stats-loading');
      const statsContent = document.getElementById('system-stats-content');
      
      // TODO: Implement system stats collection
      // This would typically require a Cloud Function or aggregated data
      // For now, we'll simulate with a timeout
      
      setTimeout(() => {
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (statsContent) statsContent.style.display = 'grid';
        
        // Populate with mock data
        document.getElementById('stat-total-users').textContent = '245';
        document.getElementById('stat-active-today').textContent = '57';
        document.getElementById('stat-total-tasks').textContent = '1,892';
        document.getElementById('stat-total-battles').textContent = '734';
        document.getElementById('stat-total-entries').textContent = '521';
        document.getElementById('stat-total-rc').textContent = '254,730';
      }, 1500);
    } catch (error) {
      console.error('Error loading system stats:', error);
      
      const loadingContainer = document.getElementById('system-stats-loading');
      if (loadingContainer) {
        loadingContainer.innerHTML = `
          <div class="error-message">
            <p>Failed to load system statistics.</p>
          </div>
        `;
      }
    }
  }
  
  /**
   * Grant admin privileges to a user
   * @param {string} userId - User ID to grant admin access
   */
  async grantAdminAccess(userId) {
    try {
      // Only existing admins can grant admin access
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        ui.toast('Not authorized to perform this action', 'error');
        return false;
      }
      
      // Update user record
      const result = await updateData(`users/${userId}`, {
        isAdmin: true,
        adminGrantedBy: stateManager.user.uid,
        adminGrantedAt: getServerTimestamp()
      });
      
      if (result.success) {
        ui.toast('Admin access granted successfully', 'success');
        return true;
      } else {
        ui.toast('Failed to grant admin access', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error granting admin access:', error);
      ui.toast('Error granting admin access', 'error');
      return false;
    }
  }
  
  /**
   * Revoke admin privileges from a user
   * @param {string} userId - User ID to revoke admin access
   */
  async revokeAdminAccess(userId) {
    try {
      // Only existing admins can revoke admin access
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        ui.toast('Not authorized to perform this action', 'error');
        return false;
      }
      
      // Update user record
      const result = await updateData(`users/${userId}`, {
        isAdmin: false,
        adminRevokedBy: stateManager.user.uid,
        adminRevokedAt: getServerTimestamp()
      });
      
      if (result.success) {
        ui.toast('Admin access revoked successfully', 'success');
        return true;
      } else {
        ui.toast('Failed to revoke admin access', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error revoking admin access:', error);
      ui.toast('Error revoking admin access', 'error');
      return false;
    }
  }
}

// Initialize admin manager when the script loads
const adminManager = new AdminManager();
export default adminManager;
