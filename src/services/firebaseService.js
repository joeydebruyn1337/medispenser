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

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new FirebaseService(); 