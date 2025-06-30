import medicineService from '../services/medicineService.js';
import alertService from '../services/alertService.js';
import { renderMedicineCards, initializeMedicineCardStyles, updateMedicineCards } from './MedicineCard.js';
import { showMedicationAlert, initializeAlertModal } from './AlertModal.js';
import { CONNECTION_STATUS, MESSAGES, CLOCK_UTILS } from '../utils/constants.js';

let clockInterval = null;
let alertCallback = null;

export function renderHomePage() {
  const isConnected = medicineService.isFirebaseConnected();
  const statusIcon = isConnected ? '🟢' : '🟡';
  const statusText = isConnected ? CONNECTION_STATUS.ONLINE : CONNECTION_STATUS.OFFLINE;

  // Get upcoming medications
  const upcomingMeds = alertService.getUpcomingMedications();
  const nextMed = upcomingMeds.length > 0 ? upcomingMeds[0] : null;

  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="medispenser-container">
      <div class="home-page">
        <header class="app-header">
          <div class="header-content">
            <div class="logo-container">
              <img src="/logo.png" alt="MediSpenser Logo" class="app-logo" />
            </div>
            <div class="header-clock">
              <div class="current-time" id="current-time">${CLOCK_UTILS.formatTime()}</div>
              <div class="current-date" id="current-date">${CLOCK_UTILS.formatDate()}</div>
            </div>
            <button class="logout-btn" id="logout-btn">
              <span class="logout-icon">🔓</span>
            </button>
          </div>
        </header>

        <main class="main-content">
          <section class="status-section">
            <div class="status-card">
              <div class="status-icon">${statusIcon}</div>
              <div class="status-info">
                <h3>System Status</h3>
                <p>${statusText}</p>
                <div class="realtime-status" id="realtime-status">
                  <small>🔄 Setting up real-time updates...</small>
                </div>
              </div>
            </div>
            
            ${nextMed ? `
              <div class="next-medication-card">
                <div class="next-med-header">
                  <h4>⏰ Next Medication</h4>
                </div>
                <div class="next-med-info">
                  <span class="med-name">${nextMed.medicineName}</span>
                  <span class="med-time">at ${nextMed.time}</span>
                  <span class="med-dosage">${nextMed.dosage}</span>
                </div>
              </div>
            ` : ''}
          </section>

          <section class="medicines-section">
            <h2 class="section-title">Available Medicines</h2>
            <div class="medicines-grid" id="medicines-grid">
              ${renderMedicineCards()}
            </div>
          </section>

          <section class="actions-section">
            <button class="action-btn primary" id="check-ids-btn">
              <span class="btn-icon">🔍</span>
              Check IDs
            </button>
          </section>

          ${!isConnected ? `
            <div class="connection-warning">
              ${MESSAGES.CONNECTION_WARNING}
            </div>
          ` : ''}
        </main>
      </div>
    </div>
  `;

  // Initialize all the alert-related components
  initializeAlertModal();
  initializeMedicineCardStyles();
  
  // Start the clock
  startClock();
}

// Function to start the clock
function startClock() {
  // Clear any existing interval
  if (clockInterval) {
    clearInterval(clockInterval);
  }

  // Update clock immediately
  updateClock();

  // Update clock every second
  clockInterval = setInterval(updateClock, 1000);
}

// Function to update clock display
function updateClock() {
  const timeElement = document.getElementById('current-time');
  const dateElement = document.getElementById('current-date');
  
  if (timeElement) {
    timeElement.textContent = CLOCK_UTILS.formatTime();
  }
  
  if (dateElement) {
    dateElement.textContent = CLOCK_UTILS.formatDate();
  }
}

// Function to stop the clock
function stopClock() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}

// Function to update real-time status
function updateRealTimeStatus(isActive) {
  const statusElement = document.getElementById('realtime-status');
  if (statusElement) {
    statusElement.innerHTML = isActive 
      ? '<small>🟢 Real-time updates active</small>' 
      : '<small>🟡 Real-time updates paused</small>';
  }
}

export function setupHomePageEvents(onLogout) {
  const logoutBtn = document.getElementById('logout-btn');
  const checkIdsBtn = document.getElementById('check-ids-btn');

  // Initialize alert service
  alertService.initialize();
  
  // Set up alert callback to show medication alerts
  alertCallback = (alertData) => {
    showMedicationAlert(alertData);
  };
  
  alertService.onAlert(alertCallback);

  // Set up real-time updates for medicines
  console.log('Setting up real-time medicine updates...');
  
  const updateCallback = (medicines) => {
    updateMedicineCards();
    updateRealTimeStatus(true);
  };

  // Start real-time updates
  medicineService.startRealTimeUpdates(updateCallback);
  
  // Update status to show real-time is active
  setTimeout(() => {
    updateRealTimeStatus(medicineService.isFirebaseConnected());
  }, 1000);

  logoutBtn.addEventListener('click', () => {
    // Clean up real-time updates and clock when logging out
    medicineService.stopRealTimeUpdates();
    stopClock();
    
    // Clean up alert service
    if (alertCallback) {
      alertService.offAlert(alertCallback);
      alertCallback = null;
    }
    alertService.cleanup();
    
    onLogout();
  });

  checkIdsBtn.addEventListener('click', () => {
    // Placeholder for Check IDs functionality
    const originalText = checkIdsBtn.innerHTML;
    checkIdsBtn.innerHTML = `<span class="btn-icon">⏳</span> ${MESSAGES.CHECKING_IDS}`;
    
    setTimeout(() => {
      checkIdsBtn.innerHTML = `<span class="btn-icon">✅</span> ${MESSAGES.IDS_CHECKED}`;
      
      setTimeout(() => {
        checkIdsBtn.innerHTML = originalText;
      }, 2000);
    }, 1500);
  });
  
  // Return cleanup function for when page is destroyed
  return () => {
    medicineService.stopRealTimeUpdates();
    stopClock();
    
    // Clean up alert service
    if (alertCallback) {
      alertService.offAlert(alertCallback);
      alertCallback = null;
    }
    alertService.cleanup();
  };
} 