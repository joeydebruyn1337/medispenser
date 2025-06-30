import { CORRECT_PIN } from '../utils/constants.js';

class AuthService {
  validatePin(pin) {
    return pin === CORRECT_PIN;
  }

  isValidPinLength(pin) {
    return pin.length === 4;
  }
}

export default new AuthService(); 