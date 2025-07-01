import { database, demoMedicines } from '../firebase.js';

class FirebaseService {
  constructor() {
    this.isConnected = false;
    this.listeners = [];
    this.currentListener = null;
  }

  async initializeDemo() {
    // If database is null (demo mode), use local data
    if (!database) {
      console.log('Demo mode: Using local medicine data');
      this.isConnected = false;
      return Object.values(demoMedicines.medicines);
    }

    try {
      // Only try Firebase operations if database is available
      const { ref, get } = await import('firebase/database');
      const medicinesRef = ref(database, 'medicines');
      const snapshot = await get(medicinesRef);
      
      if (snapshot.exists()) {
        console.log('Firebase medicines data found');
        this.isConnected = true;
      } else {
        console.log('No medicines found in Firebase, will use demo data');
        this.isConnected = false;
      }
      return null;
    } catch (error) {
      console.warn('Firebase connection failed, using local demo data:', error);
      this.isConnected = false;
      return Object.values(demoMedicines.medicines);
    }
  }

  async fetchMedicines() {
    // If database is null (demo mode), use local data
    if (!database) {
      this.isConnected = false;
      return Object.values(demoMedicines.medicines);
    }

    try {
      const { ref, get } = await import('firebase/database');
      const medicinesRef = ref(database, 'medicines');
      const snapshot = await get(medicinesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.isConnected = true;
        
        // Convert Firebase data structure to our expected format
        const medicines = this.convertFirebaseData(data);
        
        console.log('Fetched medicines from Firebase:', medicines);
        return medicines;
      } else {
        console.log('No medicines found in Firebase, using demo data');
        this.isConnected = false;
        return Object.values(demoMedicines.medicines);
      }
    } catch (error) {
      console.warn('Failed to fetch from Firebase, using demo data:', error);
      this.isConnected = false;
      return Object.values(demoMedicines.medicines);
    }
  }

  // Set up real-time listener for medicine data changes
  async setupRealTimeListener(callback) {
    // If database is null (demo mode), simulate periodic updates with demo data
    if (!database) {
      console.log('Demo mode: Setting up simulated real-time updates');
      
      // Simulate real-time updates every 30 seconds in demo mode
      const simulateUpdates = () => {
        const demoData = Object.values(demoMedicines.medicines);
        console.log('Demo mode: Simulating real-time update');
        callback(demoData);
      };
      
      // Initial call
      setTimeout(simulateUpdates, 1000);
      
      // Set up periodic updates
      const intervalId = setInterval(simulateUpdates, 30000);
      
      return () => {
        clearInterval(intervalId);
        console.log('Demo mode: Stopped simulated updates');
      };
    }

    try {
      const { ref, onValue, off } = await import('firebase/database');
      const medicinesRef = ref(database, 'medicines');
      
      // Remove previous listener if exists
      this.removeRealTimeListener();
      
      console.log('🔄 Setting up Firebase real-time listener for medicines...');
      
      const unsubscribe = onValue(medicinesRef, (snapshot) => {
        console.log('📡 Firebase real-time update received');
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const medicines = this.convertFirebaseData(data);
          console.log('✅ Real-time data processed:', medicines.length, 'medicines');
          
          // Mark as connected since we got data
          this.isConnected = true;
          
          // Call the callback with updated data
          callback(medicines);
        } else {
          console.log('⚠️ No medicines data in real-time update');
          this.isConnected = false;
          callback([]);
        }
      }, (error) => {
        console.warn('❌ Real-time listener error:', error);
        this.isConnected = false;
        
        // Fallback to demo data on error
        const fallbackData = Object.values(demoMedicines.medicines);
        console.log('🔄 Falling back to demo data');
        callback(fallbackData);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect real-time listener...');
          this.setupRealTimeListener(callback);
        }, 5000);
      });

      this.currentListener = unsubscribe;
      console.log('✅ Firebase real-time listener successfully established');

      // Return cleanup function
      return () => this.removeRealTimeListener();
      
    } catch (error) {
      console.warn('❌ Failed to setup real-time listener:', error);
      this.isConnected = false;
      
      // Fallback to demo data and return empty cleanup function
      const fallbackData = Object.values(demoMedicines.medicines);
      callback(fallbackData);
      
      return () => {}; // Return empty cleanup function
    }
  }

  // Remove real-time listener
  removeRealTimeListener() {
    if (this.currentListener) {
      try {
        // Firebase's onValue returns an unsubscribe function when called
        if (typeof this.currentListener === 'function') {
          this.currentListener();
        }
        console.log('Real-time listener removed');
      } catch (error) {
        console.warn('Error removing listener:', error);
      }
      this.currentListener = null;
    }
  }

  // Helper method to convert Firebase data to our format
  convertFirebaseData(data) {
    return Object.entries(data)
      .filter(([name, _]) => name !== 'Vitamin_C') // Exclude Vitamin_C as requested
      .map(([name, medicineData]) => ({
        name: name,
        quantity: medicineData.quantity !== undefined ? medicineData.quantity : 0,
        rfidId: this.getCaseCodeForMedicine(name), // Use case code as RFID ID
        dosage: this.getDosageForMedicine(name), // Get standard dosage
        lastDispensed: medicineData.last_dispensed || null,
        totalDispensed: medicineData.total_dispensed || 0
      }));
  }

  // Helper method to get case code for medicine (you can update this based on your medispenser data)
  getCaseCodeForMedicine(medicineName) {
    const caseCodes = {
      'Amoxicillin': '22',
      'Aspirin': '11', 
      'Ibuprofen': '12',
      'Paracetamol': '21'
    };
    return caseCodes[medicineName] || 'N/A';
  }

  // Helper method to get standard dosage for medicine
  getDosageForMedicine(medicineName) {
    const dosages = {
      'Amoxicillin': '500mg',
      'Aspirin': '75mg',
      'Ibuprofen': '200mg', 
      'Paracetamol': '500mg'
    };
    return dosages[medicineName] || 'N/A';
  }

  // Fetch medicine intake logs from Firebase
  async getMedicineIntakeLogs() {
    // If database is null (demo mode), return demo logs
    if (!database) {
      console.log('Demo mode: Using demo intake logs');
      return this.getDemoIntakeLogs();
    }

    try {
      const { ref, get } = await import('firebase/database');
      const logsRef = ref(database, 'medicine_intake_log');
      const snapshot = await get(logsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Fetched medicine intake logs from Firebase:', Object.keys(data).length, 'entries');
        return data;
      } else {
        console.log('No intake logs found in Firebase, using demo data');
        return this.getDemoIntakeLogs();
      }
    } catch (error) {
      console.warn('Failed to fetch intake logs from Firebase, using demo data:', error);
      return this.getDemoIntakeLogs();
    }
  }

  // Fetch medicine statistics from Firebase
  async getMedicineStats() {
    // If database is null (demo mode), return demo stats
    if (!database) {
      console.log('Demo mode: Using demo medicine stats');
      return this.getDemoMedicineStats();
    }

    try {
      const { ref, get } = await import('firebase/database');
      const statsRef = ref(database, 'medicine_stats');
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Fetched medicine stats from Firebase:', Object.keys(data).length, 'medicines');
        return data;
      } else {
        console.log('No medicine stats found in Firebase, using demo data');
        return this.getDemoMedicineStats();
      }
    } catch (error) {
      console.warn('Failed to fetch medicine stats from Firebase, using demo data:', error);
      return this.getDemoMedicineStats();
    }
  }

  // Demo data for intake logs (when Firebase is not available)
  getDemoIntakeLogs() {
    const now = Date.now();
    const yesterday = now - (24 * 60 * 60 * 1000);
    const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);

    return {
      "demo_001": {
        "case_code": "21",
        "date": "2024-01-01",
        "datetime_readable": "2024-01-01 08:00:00",
        "medicine": "Paracetamol",
        "status": "SUCCESS",
        "time": "08:00:00",
        "timestamp": now - 3600000 // 1 hour ago
      },
      "demo_002": {
        "case_code": "11",
        "date": "2024-01-01",
        "datetime_readable": "2024-01-01 14:00:00",
        "medicine": "Aspirin",
        "status": "DISPENSING",
        "time": "14:00:00",
        "timestamp": now - 1800000 // 30 minutes ago
      },
      "demo_003": {
        "case_code": "12",
        "date": "2023-12-31",
        "datetime_readable": "2023-12-31 20:00:00",
        "medicine": "Ibuprofen",
        "status": "SUCCESS",
        "time": "20:00:00",
        "timestamp": yesterday
      },
      "demo_004": {
        "case_code": "22",
        "date": "2023-12-30",
        "datetime_readable": "2023-12-30 12:00:00",
        "medicine": "Amoxicillin",
        "status": "SUCCESS",
        "time": "12:00:00",
        "timestamp": twoDaysAgo
      }
    };
  }

  // Demo data for medicine stats (when Firebase is not available)
  getDemoMedicineStats() {
    const now = Date.now();
    return {
      "Paracetamol": {
        "last_taken": now - 3600000,
        "last_taken_readable": "2024-01-01 08:00",
        "medicine_name": "Paracetamol",
        "total_taken": 5
      },
      "Aspirin": {
        "last_taken": now - 1800000,
        "last_taken_readable": "2024-01-01 14:00",
        "medicine_name": "Aspirin",
        "total_taken": 8
      },
      "Ibuprofen": {
        "last_taken": now - 86400000,
        "last_taken_readable": "2023-12-31 20:00",
        "medicine_name": "Ibuprofen",
        "total_taken": 3
      },
      "Amoxicillin": {
        "last_taken": now - 172800000,
        "last_taken_readable": "2023-12-30 12:00",
        "medicine_name": "Amoxicillin",
        "total_taken": 2
      }
    };
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new FirebaseService(); 