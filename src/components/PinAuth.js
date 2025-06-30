import authService from '../services/authService.js';
import { MESSAGES, CLOCK_UTILS } from '../utils/constants.js';

let authClockInterval = null;

export function renderPinPage() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="medispenser-container">
      <div class="pin-auth-page">
        <div class="auth-header">
          <div class="logo-section">
            <img src="/logo.png" alt="MediSpenser Logo" class="auth-logo" />
            <p class="app-subtitle">Smart Medicine Dispenser</p>
            <div class="auth-clock">
              <div class="auth-time" id="auth-time">${CLOCK_UTILS.formatTime()}</div>
              <div class="auth-date" id="auth-date">${CLOCK_UTILS.formatDate()}</div>
            </div>
          </div>
        </div>
        
        <div class="auth-form">
          <h2>Enter PIN to Access</h2>
          <div class="pin-input-container">
            <div class="pin-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
          <div class="pin-keypad">
            <button class="keypad-btn" data-digit="1">1</button>
            <button class="keypad-btn" data-digit="2">2</button>
            <button class="keypad-btn" data-digit="3">3</button>
            <button class="keypad-btn" data-digit="4">4</button>
            <button class="keypad-btn" data-digit="5">5</button>
            <button class="keypad-btn" data-digit="6">6</button>
            <button class="keypad-btn" data-digit="7">7</button>
            <button class="keypad-btn" data-digit="8">8</button>
            <button class="keypad-btn" data-digit="9">9</button>
            <button class="keypad-btn clear-btn" data-action="clear">Clear</button>
            <button class="keypad-btn" data-digit="0">0</button>
            <button class="keypad-btn enter-btn" data-action="enter">Enter</button>
          </div>
          <div id="pin-error" class="pin-error hidden">${MESSAGES.INCORRECT_PIN}</div>
        </div>
      </div>
    </div>
  `;

  // Start the auth clock
  startAuthClock();
}

// Function to start the auth clock
function startAuthClock() {
  // Clear any existing interval
  if (authClockInterval) {
    clearInterval(authClockInterval);
  }

  // Update clock immediately
  updateAuthClock();

  // Update clock every second
  authClockInterval = setInterval(updateAuthClock, 1000);
}

// Function to update auth clock display
function updateAuthClock() {
  const timeElement = document.getElementById('auth-time');
  const dateElement = document.getElementById('auth-date');
  
  if (timeElement) {
    timeElement.textContent = CLOCK_UTILS.formatTime();
  }
  
  if (dateElement) {
    dateElement.textContent = CLOCK_UTILS.formatDate();
  }
}

// Function to stop the auth clock
function stopAuthClock() {
  if (authClockInterval) {
    clearInterval(authClockInterval);
    authClockInterval = null;
  }
}

export function setupPinAuthentication(onSuccess) {
  const pinDots = document.querySelectorAll('.dot');
  const pinError = document.getElementById('pin-error');
  const keypadBtns = document.querySelectorAll('.keypad-btn');

  let currentPin = '';

  // Update PIN display
  function updatePinDisplay() {
    pinDots.forEach((dot, index) => {
      dot.classList.toggle('filled', index < currentPin.length);
    });
  }

  // Keypad event listeners
  keypadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const digit = e.target.dataset.digit;
      const action = e.target.dataset.action;

      if (digit && currentPin.length < 4) {
        currentPin += digit;
        updatePinDisplay();
      } else if (action === 'clear') {
        currentPin = '';
        updatePinDisplay();
        pinError.classList.add('hidden');
      } else if (action === 'enter' && authService.isValidPinLength(currentPin)) {
        checkPin(currentPin);
      }
    });
  });

  // Check PIN
  function checkPin(pin) {
    if (authService.validatePin(pin)) {
      // Clean up auth clock before success
      stopAuthClock();
      onSuccess();
    } else {
      pinError.classList.remove('hidden');
      currentPin = '';
      updatePinDisplay();
      
      // Shake animation
      const authForm = document.querySelector('.auth-form');
      authForm.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        authForm.style.animation = '';
      }, 500);
    }
  }

  // Return cleanup function
  return () => {
    stopAuthClock();
  };
} 