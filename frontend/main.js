// import './style.css'
import { NavigationManager } from './js/navigation.js'
import { UserManager } from './js/userManager.js'
import { DashboardModule } from './js/modules/dashboard.js'
import { LearningModule } from './js/modules/learning.js'
import { DrillsModule } from './js/modules/drills.js'
import { EmergencyModule } from './js/modules/emergency.js'
import { AdminModule } from './js/modules/admin.js'
import { GameificationManager } from './js/gamification.js'

class SafeLearnApp {
  constructor() {
    this.currentUser = null;
    this.navigationManager = new NavigationManager();
    this.userManager = new UserManager();
    this.gamification = new GameificationManager();
    this.modules = {};
    this.init();
  }

  init() {
    this.setupApp();
    this.setupEventListeners();
    this.loadInitialView();
  }

  setupApp() {
    const app = document.querySelector('#app');
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <div class="logo">
              <h1>Hackhive</h1>
            </div>
            <nav class="main-nav" id="mainNav">
              <button class="nav-btn" data-module="dashboard">
                <span class="nav-icon">🏠</span> Dashboard
              </button>
              <button class="nav-btn" data-module="learning">
                <span class="nav-icon">📚</span> Learn
              </button>
              <button class="nav-btn" data-module="drills">
                <span class="nav-icon">🎯</span> Virtual Drills
              </button>
              <button class="nav-btn" data-module="emergency">
                <span class="nav-icon">🚨</span> Emergency
              </button>
              <button class="nav-btn admin-only" data-module="admin" style="display: none;">
                <span class="nav-icon">⚙️</span> Admin
              </button>
              <button class="login-btn" id="loginBtn" style="display: none;">Log In</button>
              <button class="login-btn" id="logoutBtn" style="display: none;">Log Out</button>
            </nav>
            <div class="user-info">
              <div class="user-profile" id="userProfile">
                <div class="user-avatar">👤</div>
                <div class="user-details">
                  <span class="user-name" id="userName">Student</span>
                  <span class="user-role" id="userRole">Loading...</span>
                </div>
                <div class="user-points" id="userPoints">0 pts</div>
              </div>
              <button class="settings-btn" id="settingsBtn" title="Settings">⚙️</button>
            </div>
          </div>
        </header>
        <main class="app-main">
          <div class="content-container" id="contentContainer">
            <!-- Dynamic content will be loaded here -->
          </div>
        </main>

        <!-- Login Modal -->
        <div class="modal-overlay hidden" id="loginModal">
          <div class="modal">
            <div class="modal-header">
              <h3>Login</h3>
              <button class="close-modal" id="closeLoginModal">×</button>
            </div>
            <div class="modal-content">
              <form id="loginForm">
                <input type="email" id="loginEmail" placeholder="Email" required />
                <input type="password" id="loginPassword" placeholder="Password" required />
                <button type="submit">Login</button>
              </form>
              <div id="loginResult"></div>
            </div>
          </div>
        </div>

        <!-- Settings Modal -->
        <div class="modal-overlay hidden" id="settingsModal">
          <div class="modal">
            <div class="modal-header">
              <h3>Settings</h3>
              <button class="close-modal" id="closeSettings">×</button>
            </div>
            <div class="modal-content">
              <div class="setting-group">
                <label for="userTypeSelect">User Type:</label>
                <select id="userTypeSelect">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="setting-group">
                <label for="regionSelect">Region:</label>
                <select id="regionSelect">
                  <option value="north">North India</option>
                  <option value="south">South India</option>
                  <option value="east">East India</option>
                  <option value="west">West India</option>
                  <option value="central">Central India</option>
                  <option value="northeast">Northeast India</option>
                </select>
              </div>
              <div class="setting-group">
                <label for="classSelect">Class/Grade:</label>
                <select id="classSelect">
                  <option value="primary">Primary (1-5)</option>
                  <option value="middle">Middle (6-8)</option>
                  <option value="secondary">Secondary (9-10)</option>
                  <option value="senior">Senior Secondary (11-12)</option>
                  <option value="college">College/University</option>
                </select>
              </div>
              <button class="save-settings" id="saveSettings">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initializeModules();
  }

  initializeModules() {
    this.modules.dashboard = new DashboardModule();
    this.modules.learning = new LearningModule();
    this.modules.drills = new DrillsModule();
    this.modules.emergency = new EmergencyModule();
    this.modules.admin = new AdminModule();
  }

  setupEventListeners() {
    this.checkAuthentication();

    // Navigation
    document.addEventListener('click', (e) => {
      const moduleButton = e.target.closest('[data-module]');
      if (moduleButton) {
        e.preventDefault();
        e.stopPropagation();
        this.switchModule(moduleButton.dataset.module);
      }
    });
    // function showMainApp() {
    //     document.getElementById('landingPage').classList.add('hidden');
    //     document.getElementById('app').classList.remove('hidden');
    //   }
    // showMainApp();  
    // Login modal
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');
    const loginResult = document.getElementById('loginResult');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.location.href = 'loginpage.html';
      });
    }

    if (closeLoginModal) {
      closeLoginModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        loginResult.innerText = '';
        loginForm.reset();
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
          const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await response.json();
          loginResult.innerText = data.message;

          if (data.success) {
            localStorage.setItem('hackhive_token', 'dummy-token');
            localStorage.setItem('hackhive_user', JSON.stringify(data.user));

            loginModal.classList.add('hidden');
            this.loadUserData();
          }
        } catch (err) {
          loginResult.innerText = 'Server error. Try again.';
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.remove('hidden');
    });
    document.getElementById('closeSettings').addEventListener('click', () => {
      document.getElementById('settingsModal').classList.add('hidden');
    });
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveUserSettings();
    });
  }

  checkAuthentication() {
    const token = localStorage.getItem('hackhive_token');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');

    if (token) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
      userProfile.style.display = 'flex';
      this.loadUserData();
    } else {
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
      userProfile.style.display = 'none';
    }
  }

  loadUserData() {
    const user = JSON.parse(localStorage.getItem('hackhive_user') || '{}');
    if (user.id) {
      document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
      document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      document.getElementById('userPoints').textContent = `${user.points || 0} pts`;
      this.configureNavigationForRole(user.role);
    }
  }

  configureNavigationForRole(role) {
    const dashboardBtn = document.querySelector('[data-module="dashboard"]');
    const learningBtn = document.querySelector('[data-module="learning"]');
    const drillsBtn = document.querySelector('[data-module="drills"]');
    const emergencyBtn = document.querySelector('[data-module="emergency"]');
    const adminBtn = document.querySelector('[data-module="admin"]');
    const settingsBtn = document.getElementById('settingsBtn');

    [dashboardBtn, learningBtn, drillsBtn, emergencyBtn].forEach(btn => { if (btn) btn.style.display = 'block'; });
    if (adminBtn) adminBtn.style.display = 'none';
    if (settingsBtn) settingsBtn.style.display = 'block';

    switch (role) {
      case 'teacher':
        [dashboardBtn, learningBtn, drillsBtn].forEach(btn => { if (btn) btn.style.display = 'none'; });
        if (emergencyBtn) emergencyBtn.style.display = 'block';
        if (adminBtn) adminBtn.style.display = 'block';
        if (settingsBtn) settingsBtn.style.display = 'none';
        break;
      case 'admin':
        [dashboardBtn, learningBtn, drillsBtn, emergencyBtn, adminBtn].forEach(btn => { if (btn) btn.style.display = 'block'; });
        if (settingsBtn) settingsBtn.style.display = 'block';
        break;
      default:
        break;
    }
  }

  logout() {
    localStorage.removeItem('hackhive_token');
    localStorage.removeItem('hackhive_user');
    localStorage.removeItem('safelearn_user');
    window.location.href = 'index.html';
  }

  switchModule(moduleName) {
    if (!localStorage.getItem('hackhive_token')) return;

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const moduleBtn = document.querySelector(`[data-module="${moduleName}"]`);
    if (moduleBtn) moduleBtn.classList.add('active');

    const contentContainer = document.getElementById('contentContainer');
    if (this.modules[moduleName]) {
      contentContainer.innerHTML = this.modules[moduleName].render();
      this.modules[moduleName].initialize();
    } else {
      contentContainer.innerHTML = '<div class="error-message">Module not found</div>';
    }

    this.navigationManager.navigateTo(moduleName);
  }

  saveUserSettings() {
    const userType = document.getElementById('userTypeSelect').value;
    const region = document.getElementById('regionSelect').value;
    const classLevel = document.getElementById('classSelect').value;

    localStorage.setItem('safelearn_user', JSON.stringify({
      type: userType,
      region,
      class: classLevel,
      points: parseInt(document.getElementById('userPoints').textContent) || 0
    }));

    this.handleUserTypeChange(userType);
    document.getElementById('settingsModal').classList.add('hidden');

    const activeModule = document.querySelector('.nav-btn.active').dataset.module;
    this.switchModule(activeModule);
  }

  handleUserTypeChange(userType) {
    this.configureNavigationForRole(userType);
    document.getElementById('userRole').textContent = userType.charAt(0).toUpperCase() + userType.slice(1);
  }

  loadInitialView() {
    const token = localStorage.getItem('hackhive_token');
    if (!token) {
      window.location.href = 'index.html';
      return;
    }
    this.loadUserData();
    this.switchModule('dashboard');
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new SafeLearnApp();
});
