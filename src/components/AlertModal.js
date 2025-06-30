import alertService from '../services/alertService.js';
import { updateMedicineCards } from './MedicineCard.js';

let currentAlert = null;
let alertModalContainer = null;

export function createAlertModal() {
  // Create modal container if it doesn't exist
  if (!alertModalContainer) {
    alertModalContainer = document.createElement('div');
    alertModalContainer.id = 'alert-modal-container';
    document.body.appendChild(alertModalContainer);
  }
}

export function showMedicationAlert(alertData) {
  if (currentAlert) {
    // Close existing alert first
    closeAlert();
  }

  currentAlert = alertData;
  
  // Create modal container if needed
  createAlertModal();

  const modal = document.createElement('div');
  modal.className = 'alert-modal-overlay';
  modal.innerHTML = `
    <div class="alert-modal">
      <div class="alert-header">
        <div class="alert-icon">💊</div>
        <h2>Time for your medication!</h2>
      </div>
      
      <div class="alert-content">
        <div class="medication-info">
          <h3>${alertData.medicineName}</h3>
          <p class="dosage">Dosage: <strong>${alertData.dosage}</strong></p>
          <p class="time">Scheduled for: <strong>${alertData.scheduledTime}</strong></p>
        </div>
        
        <div class="current-time">
          <p>Current time: <span id="alert-current-time">${getCurrentTime()}</span></p>
        </div>
      </div>
      
      <div class="alert-actions">
        <button class="btn btn-primary" id="take-medication-btn">
          <span class="btn-icon">✅</span>
          I took it
        </button>
        <button class="btn btn-secondary" id="snooze-btn">
          <span class="btn-icon">⏰</span>
          Remind me in 5 minutes
        </button>
        <button class="btn btn-dismiss" id="dismiss-btn">
          <span class="btn-icon">❌</span>
          Dismiss
        </button>
      </div>
    </div>
  `;

  alertModalContainer.appendChild(modal);

  // Update time every second
  const timeInterval = setInterval(() => {
    const timeElement = document.getElementById('alert-current-time');
    if (timeElement) {
      timeElement.textContent = getCurrentTime();
    }
  }, 1000);

  // Set up event listeners
  const takeMedicationBtn = modal.querySelector('#take-medication-btn');
  const snoozeBtn = modal.querySelector('#snooze-btn');
  const dismissBtn = modal.querySelector('#dismiss-btn');

  takeMedicationBtn.addEventListener('click', () => {
    handleMedicationTaken(alertData);
    clearInterval(timeInterval);
    closeAlert();
  });

  snoozeBtn.addEventListener('click', () => {
    handleSnooze(alertData);
    clearInterval(timeInterval);
    closeAlert();
  });

  dismissBtn.addEventListener('click', () => {
    clearInterval(timeInterval);
    closeAlert();
  });

  // Auto-dismiss after 5 minutes if no action taken
  setTimeout(() => {
    if (currentAlert && currentAlert.id === alertData.id) {
      clearInterval(timeInterval);
      closeAlert();
    }
  }, 300000); // 5 minutes

  // Play alert sound (if available)
  playAlertSound();
}

function handleMedicationTaken(alertData) {
  // Log the medication as taken
  alertService.logMedicationTaken(
    alertData.medicineId,
    alertData.medicineName,
    alertData.dosage,
    alertData.scheduledTime
  );

  // Show success notification
  showToast(`✅ ${alertData.medicineName} (${alertData.dosage}) logged as taken!`, 'success');
  
  // Update the medicine cards to reflect any changes
  setTimeout(() => {
    updateMedicineCards();
  }, 100);
}

function handleSnooze(alertData) {
  // Schedule a new alert in 5 minutes
  setTimeout(() => {
    if (alertService.medicationSchedules.has(alertData.medicineId)) {
      showMedicationAlert({
        ...alertData,
        id: `${alertData.id}-snooze-${Date.now()}`,
        scheduledTime: getCurrentTime()
      });
    }
  }, 300000); // 5 minutes

  showToast(`⏰ Reminder snoozed for 5 minutes`, 'info');
}

function closeAlert() {
  if (alertModalContainer) {
    alertModalContainer.innerHTML = '';
  }
  currentAlert = null;
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

function playAlertSound() {
  // Try to play a notification sound
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play alert sound:', error);
  }
}

function showToast(message, type = 'info') {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 'bold',
    zIndex: '10000',
    animation: 'slideInRight 0.3s ease-out',
    backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'
  });
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Initialize alert modal system
export function initializeAlertModal() {
  createAlertModal();
  
  // Add CSS animations if they don't exist
  if (!document.getElementById('alert-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-modal-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .alert-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .alert-modal {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
      }
      
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .alert-header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .alert-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }
      
      .alert-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
      }
      
      .medication-info {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .medication-info h3 {
        margin: 0 0 12px 0;
        color: #2196F3;
        font-size: 20px;
      }
      
      .medication-info p {
        margin: 8px 0;
        color: #666;
      }
      
      .current-time {
        text-align: center;
        margin-bottom: 24px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;
      }
      
      .current-time p {
        margin: 0;
        color: #333;
        font-size: 14px;
      }
      
      .alert-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .alert-actions .btn {
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background: #4CAF50;
        color: white;
      }
      
      .btn-primary:hover {
        background: #45a049;
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: #FF9800;
        color: white;
      }
      
      .btn-secondary:hover {
        background: #f57c00;
        transform: translateY(-1px);
      }
      
      .btn-dismiss {
        background: #f44336;
        color: white;
      }
      
      .btn-dismiss:hover {
        background: #da190b;
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);
  }
}

export { closeAlert }; 