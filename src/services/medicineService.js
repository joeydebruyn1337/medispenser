import firebaseService from './firebaseService.js';
import { demoMedicines } from '../firebase.js';

class MedicineService {
  constructor() {
    this.medicines = [];
    this.updateCallbacks = [];
    this.realTimeCleanup = null;
  }

  async initialize() {
    // Set medicines to demo data first
    this.medicines = Object.values(demoMedicines.medicines);
    
    // Try to connect to Firebase
    const result = await firebaseService.initializeDemo();
    if (result) {
      this.medicines = result;
    }
    
    // Ensure all medicines have proper default values (but preserve actual names)
    this.medicines = this.medicines.map(medicine => this.normalizeMedicine(medicine));
  }

  async fetchMedicines() {
    this.medicines = await firebaseService.fetchMedicines();
    // Ensure all medicines have proper default values (but preserve actual names)
    this.medicines = this.medicines.map(medicine => this.normalizeMedicine(medicine));
    return this.medicines;
  }

  // Start real-time updates
  async startRealTimeUpdates(callback) {
    // Add callback to our list
    if (callback) {
      this.updateCallbacks.push(callback);
    }

    // If we already have a listener, don't create another one
    if (this.realTimeCleanup) {
      console.log('Real-time updates already active, adding callback to existing listener');
      return;
    }

    console.log('🚀 Starting real-time medicine updates...');
    
    this.realTimeCleanup = await firebaseService.setupRealTimeListener((medicines) => {
      console.log(`📊 Processing real-time update: ${medicines.length} medicines received`);
      
      // Normalize the medicines data
      const oldMedicines = [...this.medicines];
      this.medicines = medicines.map(medicine => this.normalizeMedicine(medicine));
      
      // Log any changes for debugging
      if (JSON.stringify(oldMedicines) !== JSON.stringify(this.medicines)) {
        console.log('🔄 Medicine data changed, updating UI');
        console.log('Old data length:', oldMedicines.length);
        console.log('New data length:', this.medicines.length);
      } else {
        console.log('📝 Medicine data unchanged');
      }
      
      // Notify all callbacks
      this.updateCallbacks.forEach((cb, index) => {
        try {
          cb(this.medicines);
          console.log(`✅ Callback ${index + 1} executed successfully`);
        } catch (error) {
          console.warn(`❌ Error in update callback ${index + 1}:`, error);
        }
      });
      
      console.log(`🎯 Real-time update complete: ${this.updateCallbacks.length} callbacks notified`);
    });
    
    console.log('✅ Real-time medicine updates initialized');
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.realTimeCleanup) {
      this.realTimeCleanup();
      this.realTimeCleanup = null;
      console.log('Stopped real-time medicine updates');
    }
    this.updateCallbacks = [];
  }

  // Add a callback for when medicines update
  onMedicinesUpdate(callback) {
    if (!this.updateCallbacks.includes(callback)) {
      this.updateCallbacks.push(callback);
    }
  }

  // Remove a callback
  offMedicinesUpdate(callback) {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  normalizeMedicine(medicine) {
    return {
      name: medicine.name, // Don't override the actual medicine name
      quantity: medicine.quantity !== undefined ? medicine.quantity : 0,
      rfidId: medicine.rfidId || 'N/A',
      dosage: medicine.dosage || 'N/A',
      lastDispensed: medicine.lastDispensed || null,
      totalDispensed: medicine.totalDispensed || 0
    };
  }

  getMedicines() {
    return this.medicines;
  }

  isFirebaseConnected() {
    return firebaseService.getConnectionStatus();
  }

  getMedicineValue(value) {
    // Return the actual value if connected, or "-" if not connected
    // But never return undefined
    if (value === undefined || value === null) {
      return this.isFirebaseConnected() ? '0' : '-';
    }
    return this.isFirebaseConnected() ? value.toString() : '-';
  }
}

export default new MedicineService(); 