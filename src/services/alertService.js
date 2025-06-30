import firebaseService from './firebaseService.js';
import medicineService from './medicineService.js';

class AlertService {
  constructor() {
    this.medicationSchedules = new Map(); // medicineId -> schedule data
    this.activeAlerts = new Map(); // alertId -> alert data
    this.medicationLog = []; // Array of taken medication records
    this.alertCallbacks = [];
    this.checkInterval = null;
    this.alertCounter = 0;
  }

  async initialize() {
    // Load schedules and logs from localStorage initially
    this.loadFromStorage();
    
    // Set up example schedules if none exist
    this.setupExampleSchedules();
    
    // Start checking for alerts every minute
    this.startAlertChecking();
    
    console.log('Alert service initialized');
  }

  // Set up example medication schedules
  setupExampleSchedules() {
    // Only set up if no schedules exist yet
    if (this.medicationSchedules.size > 0) {
      console.log('Existing schedules found, skipping example setup');
      return;
    }

    const medicines = medicineService.getMedicines();
    if (medicines.length === 0) {
      console.warn('No medicines available to set up example schedules');
      return;
    }

    console.log('Setting up example medication schedules...');

    // Get current time and set up some test alerts for soon
    const now = new Date();
    const testTime1 = new Date(now.getTime() + 2 * 60000); // 2 minutes from now
    const testTime2 = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
    const testTime3 = new Date(now.getTime() + 8 * 60000); // 8 minutes from now

    const formatTime = (date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Comprehensive example schedules based on typical medication regimens
    const exampleSchedules = [
      {
        // Paracetamol - pain relief, every 6 hours + test alert
        times: ['08:00', '14:00', '20:00', formatTime(testTime1)],
        description: 'Pain relief medication - every 6 hours'
      },
      {
        // Aspirin - cardiovascular protection, once daily morning + test alert
        times: ['09:00', formatTime(testTime2)],
        description: 'Daily cardiovascular protection - morning dose'
      },
      {
        // Ibuprofen - anti-inflammatory, three times daily
        times: ['07:00', '15:00', '23:00', formatTime(testTime3)],
        description: 'Anti-inflammatory medication - three times daily'
      },
      {
        // Amoxicillin - antibiotic, every 8 hours
        times: ['08:00', '16:00', '00:00'],
        description: 'Antibiotic medication - every 8 hours'
      },
      {
        // Additional schedule for more medicines if available
        times: ['06:30', '18:30'],
        description: 'Twice daily medication - morning and evening'
      },
      {
        // Additional schedule for blood pressure medication
        times: ['07:30', '19:30'],
        description: 'Blood pressure medication - twice daily'
      },
      {
        // Additional schedule for diabetes medication
        times: ['07:00', '12:00', '18:00'],
        description: 'Diabetes medication - with meals'
      },
      {
        // Additional schedule for heart medication
        times: ['08:30'],
        description: 'Heart medication - once daily'
      },
      {
        // Additional schedule for vitamin supplement
        times: ['09:30'],
        description: 'Daily vitamin supplement'
      },
      {
        // Additional schedule for sleep medication
        times: ['22:00'],
        description: 'Sleep aid - bedtime'
      }
    ];

    medicines.forEach((medicine, index) => {
      if (index < exampleSchedules.length) {
        const schedule = exampleSchedules[index];
        this.setMedicationSchedule(
          medicine.rfidId,
          medicine.name,
          schedule.times,
          medicine.dosage
        );
        console.log(`✅ Set schedule for ${medicine.name}: ${schedule.times.join(', ')} (${schedule.description})`);
      }
    });

    // If we have fewer medicines than schedules, show which schedules weren't used
    if (medicines.length < exampleSchedules.length) {
      console.log(`📝 Note: ${exampleSchedules.length - medicines.length} additional schedule templates available for more medicines`);
    }

    console.log('Example schedules setup complete!');
    console.log(`🕐 Test alerts scheduled for: ${formatTime(testTime1)}, ${formatTime(testTime2)}, ${formatTime(testTime3)}`);
  }

  // Save data to localStorage
  saveToStorage() {
    const data = {
      schedules: Array.from(this.medicationSchedules.entries()),
      logs: this.medicationLog
    };
    localStorage.setItem('medicationAlerts', JSON.stringify(data));
  }

  // Load data from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('medicationAlerts');
      if (stored) {
        const data = JSON.parse(stored);
        this.medicationSchedules = new Map(data.schedules || []);
        this.medicationLog = data.logs || [];
      }
    } catch (error) {
      console.warn('Failed to load alert data from storage:', error);
    }
  }

  // Set medication schedule
  setMedicationSchedule(medicineId, medicineName, times, dosage) {
    const schedule = {
      medicineId,
      medicineName,
      dosage,
      times: times.map(time => this.parseTimeString(time)),
      enabled: true,
      createdAt: new Date().toISOString()
    };
    
    this.medicationSchedules.set(medicineId, schedule);
    this.saveToStorage();
    
    console.log(`Schedule set for ${medicineName}:`, schedule);
  }

  // Parse time string (HH:MM) to minutes since midnight
  parseTimeString(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Format minutes since midnight to HH:MM
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Get current time in minutes since midnight
  getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // Start checking for alerts
  startAlertChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every 30 seconds for more responsive alerts
    this.checkInterval = setInterval(() => {
      this.checkForAlerts();
    }, 30000);

    // Also check immediately
    this.checkForAlerts();
  }

  // Check if any medications need alerts
  checkForAlerts() {
    const currentTime = this.getCurrentTimeInMinutes();
    const currentDate = new Date().toDateString();

    for (const [medicineId, schedule] of this.medicationSchedules) {
      if (!schedule.enabled) continue;

      for (const scheduledTime of schedule.times) {
        // Check if we're within 1 minute of the scheduled time
        const timeDiff = Math.abs(currentTime - scheduledTime);
        
        if (timeDiff <= 1) {
          // Check if we already showed this alert today
          const alertKey = `${medicineId}-${scheduledTime}-${currentDate}`;
          
          if (!this.activeAlerts.has(alertKey)) {
            this.showMedicationAlert(schedule, scheduledTime, alertKey);
          }
        }
      }
    }
  }

  // Show medication alert
  showMedicationAlert(schedule, scheduledTime, alertKey) {
    const alertData = {
      id: alertKey,
      medicineId: schedule.medicineId,
      medicineName: schedule.medicineName,
      dosage: schedule.dosage,
      scheduledTime: this.formatTime(scheduledTime),
      timestamp: new Date().toISOString()
    };

    this.activeAlerts.set(alertKey, alertData);

    // Notify all callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alertData);
      } catch (error) {
        console.warn('Error in alert callback:', error);
      }
    });

    console.log('Medication alert triggered:', alertData);
  }

  // Log medication taken
  logMedicationTaken(medicineId, medicineName, dosage, scheduledTime = null) {
    const logEntry = {
      id: Date.now().toString(),
      medicineId,
      medicineName,
      dosage,
      scheduledTime,
      takenAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    this.medicationLog.unshift(logEntry);
    
    // Keep only last 100 entries
    if (this.medicationLog.length > 100) {
      this.medicationLog = this.medicationLog.slice(0, 100);
    }

    this.saveToStorage();
    
    // Remove active alert if this was from a scheduled reminder
    if (scheduledTime) {
      const currentDate = new Date().toDateString();
      const alertKey = `${medicineId}-${this.parseTimeString(scheduledTime)}-${currentDate}`;
      this.activeAlerts.delete(alertKey);
    }

    console.log('Medication logged:', logEntry);
    return logEntry;
  }

  // Get medication schedules
  getMedicationSchedules() {
    return Array.from(this.medicationSchedules.values());
  }

  // Get medication log
  getMedicationLog(limit = 20) {
    return this.medicationLog.slice(0, limit);
  }

  // Enable/disable schedule
  toggleSchedule(medicineId, enabled) {
    const schedule = this.medicationSchedules.get(medicineId);
    if (schedule) {
      schedule.enabled = enabled;
      this.saveToStorage();
    }
  }

  // Remove schedule
  removeSchedule(medicineId) {
    this.medicationSchedules.delete(medicineId);
    this.saveToStorage();
  }

  // Add alert callback
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  // Remove alert callback
  offAlert(callback) {
    this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
  }

  // Cleanup
  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.alertCallbacks = [];
  }

  // Get next scheduled medications (for today)
  getUpcomingMedications() {
    const currentTime = this.getCurrentTimeInMinutes();
    const upcoming = [];

    for (const schedule of this.medicationSchedules.values()) {
      if (!schedule.enabled) continue;

      for (const time of schedule.times) {
        if (time > currentTime) {
          upcoming.push({
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            time: this.formatTime(time),
            timeInMinutes: time
          });
        }
      }
    }

    // Sort by time
    upcoming.sort((a, b) => a.timeInMinutes - b.timeInMinutes);
    return upcoming;
  }
}

export default new AlertService(); 