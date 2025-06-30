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
function updateRealTimeStatus(isActive, isSyncing = false) {
  const statusElement = document.getElementById('realtime-status');
  if (statusElement) {
    if (isSyncing) {
      statusElement.innerHTML = '<small>🔄 Syncing data...</small>';
      statusElement.style.animation = 'pulse 1s ease-in-out';
      
      // Reset to normal status after animation
      setTimeout(() => {
        statusElement.innerHTML = isActive 
          ? '<small>🟢 Real-time updates active</small>' 
          : '<small>🟡 Real-time updates paused</small>';
        statusElement.style.animation = '';
      }, 1500);
    } else {
      statusElement.innerHTML = isActive 
        ? '<small>🟢 Real-time updates active</small>' 
        : '<small>🟡 Real-time updates paused</small>';
      statusElement.style.animation = '';
    }
  }
}

// Function to update next medication info
function updateNextMedicationInfo() {
  const upcomingMeds = alertService.getUpcomingMedications();
  const nextMed = upcomingMeds.length > 0 ? upcomingMeds[0] : null;
  
  // Find the existing next medication section
  const statusSection = document.querySelector('.status-section');
  if (!statusSection) return;
  
  // Remove existing next medication card
  const existingNextMedCard = statusSection.querySelector('.next-medication-card');
  if (existingNextMedCard) {
    existingNextMedCard.remove();
  }
  
  // Add new next medication card if there's an upcoming medication
  if (nextMed) {
    const nextMedCard = document.createElement('div');
    nextMedCard.className = 'next-medication-card';
    nextMedCard.innerHTML = `
      <div class="next-med-header">
        <h4>⏰ Next Medication</h4>
      </div>
      <div class="next-med-info">
        <span class="med-name">${nextMed.medicineName}</span>
        <span class="med-time">at ${nextMed.time}</span>
        <span class="med-dosage">${nextMed.dosage}</span>
      </div>
    `;
    statusSection.appendChild(nextMedCard);
  }
}

// Function to update connection status
function updateConnectionStatus() {
  const isConnected = medicineService.isFirebaseConnected();
  const statusIcon = isConnected ? '🟢' : '🟡';
  const statusText = isConnected ? CONNECTION_STATUS.ONLINE : CONNECTION_STATUS.OFFLINE;
  
  // Update status icon and text
  const statusIconElement = document.querySelector('.status-icon');
  const statusInfoElement = document.querySelector('.status-info p');
  
  if (statusIconElement) {
    statusIconElement.textContent = statusIcon;
  }
  
  if (statusInfoElement) {
    statusInfoElement.textContent = statusText;
  }
  
  // Update connection warning
  const existingWarning = document.querySelector('.connection-warning');
  const mainContent = document.querySelector('.main-content');
  
  if (!isConnected && !existingWarning && mainContent) {
    // Add connection warning if not connected and warning doesn't exist
    const warningDiv = document.createElement('div');
    warningDiv.className = 'connection-warning';
    warningDiv.textContent = MESSAGES.CONNECTION_WARNING;
    mainContent.appendChild(warningDiv);
  } else if (isConnected && existingWarning) {
    // Remove connection warning if connected
    existingWarning.remove();
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
    console.log('Real-time update received, updating UI components...');
    
    // Update medicine cards
    updateMedicineCards();
    
    // Update next medication info
    updateNextMedicationInfo();
    
    // Update connection status
    updateConnectionStatus();
    
    // Update real-time status indicator
    updateRealTimeStatus(true);
    
    console.log('UI components updated with new medicine data');
  };

  // Start real-time updates
  medicineService.startRealTimeUpdates(updateCallback);
  
  // Set up periodic refresh to ensure UI stays current
  const periodicRefresh = setInterval(() => {
    console.log('🔄 Periodic UI refresh...');
    updateNextMedicationInfo();
    updateConnectionStatus();
  }, 60000); // Refresh every minute
  
  // Update status to show real-time is active
  setTimeout(() => {
    updateRealTimeStatus(medicineService.isFirebaseConnected());
  }, 1000);

  // Store periodic refresh reference for cleanup
  window.homePagePeriodicRefresh = periodicRefresh;

  logoutBtn.addEventListener('click', () => {
    // Clean up real-time updates and clock when logging out
    medicineService.stopRealTimeUpdates();
    stopClock();
    
    // Clean up periodic refresh
    if (window.homePagePeriodicRefresh) {
      clearInterval(window.homePagePeriodicRefresh);
      window.homePagePeriodicRefresh = null;
      console.log('🧹 Cleaned up periodic refresh');
    }
    
    // Clean up alert service
    if (alertCallback) {
      alertService.offAlert(alertCallback);
      alertCallback = null;
    }
    alertService.cleanup();
    
    console.log('🧹 All HomePage cleanup completed');
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