import alertService from '../services/alertService.js';
import medicineService from '../services/medicineService.js';

let schedulerModal = null;
let currentMedicine = null;

export function showMedicationScheduler(medicine) {
  currentMedicine = medicine;
  
  // Close existing modal if open
  closeMedicationScheduler();
  
  // Create modal overlay
  schedulerModal = document.createElement('div');
  schedulerModal.className = 'scheduler-modal-overlay';
  
  const existingSchedule = alertService.medicationSchedules.get(medicine.rfidId);
  const scheduleTimesList = existingSchedule ? 
    existingSchedule.times.map(time => alertService.formatTime(time)).join(', ') : 
    'No schedule set';

  schedulerModal.innerHTML = `
    <div class="scheduler-modal">
      <div class="scheduler-header">
        <h2>⏰ Set Medication Schedule</h2>
        <button class="close-btn" id="close-scheduler">×</button>
      </div>
      
      <div class="scheduler-content">
        <div class="medicine-info">
          <h3>${medicine.name}</h3>
          <p class="dosage">Dosage: <strong>${medicine.dosage}</strong></p>
          <p class="current-schedule">Current schedule: <strong>${scheduleTimesList}</strong></p>
        </div>
        
        <form class="schedule-form" id="schedule-form">
          <div class="form-group">
            <label for="reminder-times">Reminder Times:</label>
            <div class="time-inputs" id="time-inputs">
              <div class="time-input-group">
                <input type="time" class="time-input" required>
                <button type="button" class="remove-time-btn" style="display: none;">×</button>
              </div>
            </div>
            <button type="button" class="add-time-btn" id="add-time-btn">+ Add Another Time</button>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="enable-schedule" ${existingSchedule?.enabled ? 'checked' : ''}>
              Enable notifications for this medication
            </label>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Schedule</button>
            <button type="button" class="btn btn-secondary" id="cancel-scheduler">Cancel</button>
            ${existingSchedule ? '<button type="button" class="btn btn-danger" id="delete-schedule">Delete Schedule</button>' : ''}
          </div>
        </form>
        
        ${existingSchedule ? `
          <div class="schedule-preview">
            <h4>Current Schedule Preview:</h4>
            <div class="schedule-times">
              ${existingSchedule.times.map(time => `
                <div class="schedule-time">
                  📅 ${alertService.formatTime(time)} - ${medicine.name} (${medicine.dosage})
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(schedulerModal);
  
  // Pre-populate existing schedule times
  if (existingSchedule) {
    const timeInputs = schedulerModal.querySelectorAll('.time-input');
    existingSchedule.times.forEach((time, index) => {
      if (timeInputs[index]) {
        timeInputs[index].value = alertService.formatTime(time);
      } else {
        addTimeInput(alertService.formatTime(time));
      }
    });
  }
  
  // Set up event listeners
  setupSchedulerEvents();
}

function setupSchedulerEvents() {
  const closeBtn = schedulerModal.querySelector('#close-scheduler');
  const cancelBtn = schedulerModal.querySelector('#cancel-scheduler');
  const addTimeBtn = schedulerModal.querySelector('#add-time-btn');
  const scheduleForm = schedulerModal.querySelector('#schedule-form');
  const deleteBtn = schedulerModal.querySelector('#delete-schedule');

  closeBtn.addEventListener('click', closeMedicationScheduler);
  cancelBtn.addEventListener('click', closeMedicationScheduler);
  
  addTimeBtn.addEventListener('click', () => addTimeInput());
  
  scheduleForm.addEventListener('submit', handleScheduleSave);
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleScheduleDelete);
  }
  
  // Close modal when clicking outside
  schedulerModal.addEventListener('click', (e) => {
    if (e.target === schedulerModal) {
      closeMedicationScheduler();
    }
  });
}

function addTimeInput(value = '') {
  const timeInputsContainer = schedulerModal.querySelector('#time-inputs');
  const timeInputGroup = document.createElement('div');
  timeInputGroup.className = 'time-input-group';
  
  timeInputGroup.innerHTML = `
    <input type="time" class="time-input" value="${value}" required>
    <button type="button" class="remove-time-btn">×</button>
  `;
  
  timeInputsContainer.appendChild(timeInputGroup);
  
  // Set up remove button
  const removeBtn = timeInputGroup.querySelector('.remove-time-btn');
  removeBtn.addEventListener('click', () => {
    timeInputGroup.remove();
    updateRemoveButtons();
  });
  
  updateRemoveButtons();
}

function updateRemoveButtons() {
  const removeButtons = schedulerModal.querySelectorAll('.remove-time-btn');
  removeButtons.forEach((btn, index) => {
    btn.style.display = removeButtons.length > 1 ? 'block' : 'none';
  });
}

function handleScheduleSave(e) {
  e.preventDefault();
  
  const timeInputs = schedulerModal.querySelectorAll('.time-input');
  const enableSchedule = schedulerModal.querySelector('#enable-schedule').checked;
  
  const times = Array.from(timeInputs)
    .map(input => input.value)
    .filter(time => time)
    .sort(); // Sort times chronologically
  
  if (times.length === 0) {
    alert('Please add at least one reminder time.');
    return;
  }
  
  // Save the schedule
  alertService.setMedicationSchedule(
    currentMedicine.rfidId,
    currentMedicine.name,
    times,
    currentMedicine.dosage
  );
  
  // Enable/disable the schedule
  alertService.toggleSchedule(currentMedicine.rfidId, enableSchedule);
  
  // Show success message
  showToast(`✅ Schedule saved for ${currentMedicine.name}!`, 'success');
  
  closeMedicationScheduler();
}

function handleScheduleDelete() {
  if (confirm(`Are you sure you want to delete the schedule for ${currentMedicine.name}?`)) {
    alertService.removeSchedule(currentMedicine.rfidId);
    showToast(`🗑️ Schedule deleted for ${currentMedicine.name}`, 'info');
    closeMedicationScheduler();
  }
}

function closeMedicationScheduler() {
  if (schedulerModal) {
    document.body.removeChild(schedulerModal);
    schedulerModal = null;
    currentMedicine = null;
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

// Function to show medication log
export function showMedicationLog() {
  const logs = alertService.getMedicationLog();
  
  // Create modal overlay
  const logModal = document.createElement('div');
  logModal.className = 'scheduler-modal-overlay';
  
  logModal.innerHTML = `
    <div class="scheduler-modal medication-log-modal">
      <div class="scheduler-header">
        <h2>📋 Medication Log</h2>
        <button class="close-btn" id="close-log">×</button>
      </div>
      
      <div class="scheduler-content">
        ${logs.length === 0 ? `
          <div class="empty-log">
            <p>No medications logged yet.</p>
          </div>
        ` : `
          <div class="log-entries">
            ${logs.map(log => `
              <div class="log-entry">
                <div class="log-header">
                  <strong>${log.medicineName}</strong>
                  <span class="log-time">${new Date(log.takenAt).toLocaleString()}</span>
                </div>
                <div class="log-details">
                  <span class="dosage">Dosage: ${log.dosage}</span>
                  ${log.scheduledTime ? `<span class="scheduled">Scheduled: ${log.scheduledTime}</span>` : '<span class="manual">Manual entry</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  
  document.body.appendChild(logModal);
  
  // Set up close event
  const closeBtn = logModal.querySelector('#close-log');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(logModal);
  });
  
  logModal.addEventListener('click', (e) => {
    if (e.target === logModal) {
      document.body.removeChild(logModal);
    }
  });
}

// Initialize scheduler styles
export function initializeMedicationScheduler() {
  if (!document.getElementById('scheduler-styles')) {
    const style = document.createElement('style');
    style.id = 'scheduler-styles';
    style.textContent = `
      .scheduler-modal-overlay {
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
      
      .scheduler-modal {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
      }
      
      .scheduler-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
      }
      
      .scheduler-header h2 {
        margin: 0;
        color: #333;
        font-size: 20px;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }
      
      .close-btn:hover {
        background: #f5f5f5;
        color: #333;
      }
      
      .scheduler-content {
        padding: 24px;
      }
      
      .medicine-info {
        text-align: center;
        margin-bottom: 24px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .medicine-info h3 {
        margin: 0 0 8px 0;
        color: #2196F3;
        font-size: 18px;
      }
      
      .medicine-info p {
        margin: 4px 0;
        color: #666;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #333;
      }
      
      .time-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .time-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
      }
      
      .remove-time-btn {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .add-time-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 8px;
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }
      
      .form-actions .btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background: #2196F3;
        color: white;
      }
      
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .btn-danger {
        background: #f44336;
        color: white;
      }
      
      .schedule-preview {
        margin-top: 24px;
        padding: 16px;
        background: #e3f2fd;
        border-radius: 8px;
      }
      
      .schedule-preview h4 {
        margin: 0 0 12px 0;
        color: #1976d2;
      }
      
      .schedule-time {
        padding: 8px 12px;
        background: white;
        border-radius: 6px;
        margin-bottom: 8px;
        color: #333;
      }
      
      .log-entry {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      }
      
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .log-time {
        color: #666;
        font-size: 14px;
      }
      
      .log-details {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #666;
      }
      
      .scheduled {
        color: #4CAF50;
      }
      
      .manual {
        color: #FF9800;
      }
      
      .empty-log {
        text-align: center;
        padding: 40px;
        color: #666;
      }
    `;
    document.head.appendChild(style);
  }
} 