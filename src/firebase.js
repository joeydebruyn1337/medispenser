// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Demo data structure for medicines (kept for fallback)
// Updated to match user's actual Firebase structure
export const demoMedicines = {
  medicines: {
    medicine1: {
      name: "Amoxicillin",
      quantity: 22,
      rfidId: "22",
      dosage: "500mg",
      lastDispensed: null,
      totalDispensed: 0
    },
    medicine2: {
      name: "Aspirin",
      quantity: 0,
      rfidId: "11", 
      dosage: "75mg",
      lastDispensed: null,
      totalDispensed: 0
    },
    medicine3: {
      name: "Ibuprofen",
      quantity: 1,
      rfidId: "12",
      dosage: "200mg", 
      lastDispensed: null,
      totalDispensed: 0
    },
    medicine4: {
      name: "Paracetamol",
      quantity: 1,
      rfidId: "21",
      dosage: "500mg",
      lastDispensed: null,
      totalDispensed: 0
    }
  }
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf4GUDQjQ_P1uEWLnGVWwJW9juN0U6JYA",
  authDomain: "medispenser-d0ab8.firebaseapp.com",
  databaseURL: "https://medispenser-d0ab8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medispenser-d0ab8",
  storageBucket: "medispenser-d0ab8.firebasestorage.app",
  messagingSenderId: "938292208006",
  appId: "1:938292208006:web:d087632440b43113e78c07"
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  database = null;
}

export { database }; 