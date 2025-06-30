// Application constants
export const CORRECT_PIN = '1234';

// Page states
export const PAGES = {
  PIN_AUTH: 'pin-auth',
  HOME: 'home'
};

// UI Messages
export const MESSAGES = {
  INCORRECT_PIN: 'Incorrect PIN. Please try again.',
  CHECKING_IDS: 'Checking...',
  IDS_CHECKED: 'IDs Checked',
  CONNECTION_WARNING: '⚠️ Firebase not connected - showing placeholder data'
};

// Firebase connection status
export const CONNECTION_STATUS = {
  ONLINE: 'Online & Ready',
  OFFLINE: 'Offline Mode'
};

// Clock utility functions
export const CLOCK_UTILS = {
  formatTime: (date = new Date()) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  },
  
  formatDate: (date = new Date()) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }
}; 