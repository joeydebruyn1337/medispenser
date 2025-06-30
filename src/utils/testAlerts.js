import alertService from '../services/alertService.js';
import medicineService from '../services/medicineService.js';

// Function to trigger a test alert immediately (for testing purposes)
export function triggerTestAlert() {
  const medicines = medicineService.getMedicines();
  
  if (medicines.length === 0) {
    console.warn('No medicines available for test alert');
    return;
  }

  const testMedicine = medicines[0];
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Create a mock alert data
  const alertData = {
    id: `test-alert-${Date.now()}`,
    medicineId: testMedicine.rfidId,
    medicineName: testMedicine.name,
    dosage: testMedicine.dosage,
    scheduledTime: currentTime,
    timestamp: new Date().toISOString()
  };

  // Manually trigger alert callbacks
  alertService.alertCallbacks.forEach(callback => {
    try {
      callback(alertData);
    } catch (error) {
      console.warn('Error in test alert callback:', error);
    }
  });

  console.log('Test alert triggered for:', testMedicine.name);
}

// Function to clear all stored data for fresh testing
export function clearAllData() {
  localStorage.removeItem('medicationAlerts');
  console.log('All medication data cleared from localStorage');
  console.log('Reload the page to see fresh example schedules');
}

// Function to show current schedules
export function showCurrentSchedules() {
  const schedules = alertService.getMedicationSchedules();
  console.log('Current medication schedules:');
  schedules.forEach(schedule => {
    const times = schedule.times.map(time => alertService.formatTime(time)).join(', ');
    console.log(`- ${schedule.medicineName}: ${times} (${schedule.enabled ? 'Enabled' : 'Disabled'})`);
  });
}

// Function to show medication log
export function showMedicationLog() {
  const logs = alertService.getMedicationLog();
  console.log('Recent medication logs:');
  logs.forEach(log => {
    const takenAt = new Date(log.takenAt).toLocaleString();
    console.log(`- ${log.medicineName} (${log.dosage}) taken at ${takenAt}`);
  });
}

// Add test functions to window for easy access in console
if (typeof window !== 'undefined') {
  window.triggerTestAlert = triggerTestAlert;
  window.clearAllData = clearAllData;
  window.showCurrentSchedules = showCurrentSchedules;
  window.showMedicationLog = showMedicationLog;
  
  // Log available functions
  console.log('🧪 Test functions available:');
  console.log('- triggerTestAlert() - Shows immediate test alert');
  console.log('- clearAllData() - Clears all data for fresh start');
  console.log('- showCurrentSchedules() - Lists all medication schedules');
  console.log('- showMedicationLog() - Shows medication intake history');
} 