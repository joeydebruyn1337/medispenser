import medicineService from '../services/medicineService.js';
import alertService from '../services/alertService.js';

export function renderMedicineCard(medicine) {
  const isConnected = medicineService.isFirebaseConnected();
  const quantity = medicineService.getMedicineValue(medicine.quantity);

  return `
    <div class="medicine-card">
      <div class="medicine-header">
        <div class="medicine-icon">💊</div>
        <div class="medicine-info">
          <h3 class="medicine-name">${medicine.name}</h3>
          <p class="medicine-dosage">${medicine.dosage}</p>
        </div>
      </div>
      <div class="medicine-details">
        <div class="quantity-info">
          <span class="quantity-label">Quantity:</span>
          <span class="quantity-value">${quantity}</span>
        </div>
      </div>
    </div>
  `;
}

export function renderMedicineCards() {
  const medicines = medicineService.getMedicines();
  
  return medicines.map(medicine => {
    const scheduleStatus = getScheduleStatus(medicine.rfidId);
    
    return `
      <div class="medicine-card">
        <div class="medicine-header">
          <h3 class="medicine-name">${medicine.name}</h3>
          <div class="schedule-indicator ${scheduleStatus.className}">
            ${scheduleStatus.icon}
          </div>
        </div>
        
        <div class="medicine-key-info">
          <div class="key-info-item quantity-highlight">
            <span class="key-label">Quantity</span>
            <span class="key-value">${medicineService.getMedicineValue(medicine.quantity)}</span>
          </div>
          <div class="key-info-item dosage-highlight">
            <span class="key-label">Dosage</span>
            <span class="key-value">${medicine.dosage}</span>
          </div>
        </div>
        
        <div class="medicine-details">
          <div class="detail-item">
            <span class="label">Last Dispensed:</span>
            <span class="value">${medicine.lastDispensed ? new Date(medicine.lastDispensed).toLocaleString() : 'Never'}</span>
          </div>
        </div>
        
        <div class="schedule-info">
          ${scheduleStatus.text}
        </div>
      </div>
    `;
  }).join('');
}

function getScheduleStatus(medicineId) {
  const schedule = alertService.medicationSchedules.get(medicineId);
  
  if (!schedule) {
    return {
      className: 'no-schedule',
      icon: '⚪',
      text: 'No reminder schedule set'
    };
  }
  
  if (!schedule.enabled) {
    return {
      className: 'schedule-disabled',
      icon: '🔴',
      text: 'Schedule disabled'
    };
  }
  
  const timesList = schedule.times.map(time => alertService.formatTime(time)).join(', ');
  return {
    className: 'schedule-active',
    icon: '🟢',
    text: `Reminders at: ${timesList}`
  };
}

export function updateMedicineCards() {
  const medicinesGrid = document.getElementById('medicines-grid');
  if (medicinesGrid) {
    medicinesGrid.innerHTML = renderMedicineCards();
  }
}

// Add styles for the schedule indicators and prominent key info
export function initializeMedicineCardStyles() {
  if (!document.getElementById('medicine-card-alert-styles')) {
    const style = document.createElement('style');
    style.id = 'medicine-card-alert-styles';
    style.textContent = `
      .medicine-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .medicine-key-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .key-info-item {
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        border: 2px solid #e0e0e0;
        transition: all 0.2s ease;
      }
      
      .quantity-highlight {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-color: #2196F3;
      }
      
      .dosage-highlight {
        background: linear-gradient(135deg, #f1f8e9 0%, #c8e6c9 100%);
        border-color: #4CAF50;
      }
      
      .key-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #666;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .key-value {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      
      .quantity-highlight .key-value {
        color: #1976d2;
      }
      
      .dosage-highlight .key-value {
        color: #388e3c;
      }
      
      .schedule-indicator {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        animation: pulse 2s infinite;
      }
      
      .schedule-indicator.no-schedule {
        background: #f5f5f5;
        animation: none;
      }
      
      .schedule-indicator.schedule-disabled {
        background: #ffebee;
        animation: none;
      }
      
      .schedule-indicator.schedule-active {
        background: #e8f5e8;
        animation: pulse-green 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes pulse-green {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.3); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
      }
      
      .schedule-info {
        margin: 12px 0;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 12px;
        color: #666;
        text-align: center;
        border-left: 3px solid #ddd;
      }
      
      .schedule-active + .schedule-info {
        border-left-color: #4CAF50;
        background: #f1f8e9;
        color: #2e7d32;
      }
      
      .schedule-disabled + .schedule-info {
        border-left-color: #f44336;
        background: #ffebee;
        color: #c62828;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        padding: 12px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .detail-item:last-child {
        border-bottom: none;
      }
      
      .label {
        font-weight: 600;
        color: #555;
        font-size: 14px;
      }
      
      .value {
        font-weight: 700;
        color: #1976d2;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }
} 