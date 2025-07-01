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

  console.log(`🧪 Triggering test alert for ${testMedicine.name} at ${currentTime}`);
  console.log(`Available callbacks: ${alertService.alertCallbacks.length}`);

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
  alertService.alertCallbacks.forEach((callback, index) => {
    try {
      console.log(`Calling callback ${index + 1}/${alertService.alertCallbacks.length}`);
      callback(alertData);
    } catch (error) {
      console.warn('Error in test alert callback:', error);
    }
  });

  console.log('✅ Test alert triggered for:', testMedicine.name);
}

// Function to schedule a test alert for the next minute
export function scheduleTestAlert() {
  const medicines = medicineService.getMedicines();
  
  if (medicines.length === 0) {
    console.warn('No medicines available for test alert');
    return;
  }

  const testMedicine = medicines[0];
  const now = new Date();
  const nextMinute = new Date(now.getTime() + 60000); // 1 minute from now
  const scheduleTime = `${nextMinute.getHours().toString().padStart(2, '0')}:${nextMinute.getMinutes().toString().padStart(2, '0')}`;

  console.log(`📅 Scheduling test alert for ${testMedicine.name} at ${scheduleTime}`);
  
  // Set a temporary schedule for this medicine
  alertService.setMedicationSchedule(
    testMedicine.rfidId,
    testMedicine.name,
    [scheduleTime],
    testMedicine.dosage
  );
  
  console.log(`✅ Test alert scheduled for ${scheduleTime} (1 minute from now)`);
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

// Function to check alert system status
export function checkAlertSystemStatus() {
  console.log('🔍 Alert System Status Check:');
  console.log('================================');
  
  // Check if alert service is initialized
  console.log(`Alert service callbacks: ${alertService.alertCallbacks.length}`);
  console.log(`Alert checking interval: ${alertService.checkInterval ? 'Running' : 'Not running'}`);
  console.log(`Active alerts: ${alertService.activeAlerts.size}`);
  
  // Check schedules
  const schedules = alertService.getMedicationSchedules();
  console.log(`Total schedules: ${schedules.length}`);
  
  schedules.forEach(schedule => {
    const times = schedule.times.map(time => alertService.formatTime(time)).join(', ');
    console.log(`- ${schedule.medicineName}: ${times} (${schedule.enabled ? 'Enabled' : 'Disabled'})`);
  });
  
  // Check current time vs scheduled times
  const currentTime = alertService.getCurrentTimeInMinutes();
  console.log(`Current time: ${alertService.formatTime(currentTime)} (${currentTime} minutes)`);
  
  console.log('================================');
}

// Function to force immediate alert check
export function forceAlertCheck() {
  console.log('🔄 Forcing immediate alert check...');
  alertService.checkForAlerts();
}

// Add test functions to window for easy access in console
if (typeof window !== 'undefined') {
  window.triggerTestAlert = triggerTestAlert;
  window.scheduleTestAlert = scheduleTestAlert;
  window.clearAllData = clearAllData;
  window.showCurrentSchedules = showCurrentSchedules;
  window.showMedicationLog = showMedicationLog;
  window.checkAlertSystemStatus = checkAlertSystemStatus;
  window.forceAlertCheck = forceAlertCheck;
  
  // Log available functions
  console.log('🧪 Test functions available:');
  console.log('- triggerTestAlert() - Shows immediate test alert');
  console.log('- scheduleTestAlert() - Schedule test alert for next minute');
  console.log('- clearAllData() - Clears all data for fresh start');
  console.log('- showCurrentSchedules() - Lists all medication schedules');
  console.log('- showMedicationLog() - Shows medication intake history');
  console.log('- checkAlertSystemStatus() - Check alert system status');
  console.log('- forceAlertCheck() - Force immediate alert check');
} 