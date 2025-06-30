import { renderPinPage, setupPinAuthentication } from './components/PinAuth.js';
import { renderHomePage, setupHomePageEvents } from './components/HomePage.js';
import medicineService from './services/medicineService.js';
import alertService from './services/alertService.js';
import { PAGES } from './utils/constants.js';

class App {
  constructor() {
    this.currentPage = PAGES.PIN_AUTH;
    this.homePageCleanup = null;
    this.pinAuthCleanup = null;
  }

  async initialize() {
    // Initialize medicine service
    await medicineService.initialize();
    
    // Initialize alert service
    await alertService.initialize();
    
    // Start with PIN authentication
    this.showPinAuth();
  }

  showPinAuth() {
    // Clean up home page if we're coming from there
    if (this.homePageCleanup) {
      this.homePageCleanup();
      this.homePageCleanup = null;
    }
    
    this.currentPage = PAGES.PIN_AUTH;
    renderPinPage();
    
    // Set up PIN authentication and store cleanup function
    this.pinAuthCleanup = setupPinAuthentication(() => this.onAuthSuccess());
  }

  async onAuthSuccess() {
    // Clean up PIN auth page
    if (this.pinAuthCleanup) {
      this.pinAuthCleanup();
      this.pinAuthCleanup = null;
    }
    
    this.currentPage = PAGES.HOME;
    
    // Fetch fresh medicine data
    await medicineService.fetchMedicines();
    
    // Show home page
    this.showHome();
  }

  showHome() {
    renderHomePage();
    
    // Set up home page events and store cleanup function
    this.homePageCleanup = setupHomePageEvents(() => this.onLogout());
  }

  onLogout() {
    // Clean up home page before going to auth
    if (this.homePageCleanup) {
      this.homePageCleanup();
      this.homePageCleanup = null;
    }
    
    this.showPinAuth();
  }
}

export default App; 