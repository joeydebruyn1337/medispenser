# 💊 MediSpenser - Smart IoT Medicine Dispenser

A modern, mobile-first web application for managing smart medicine dispensers using RFID technology.

## ✨ Features

### 🔐 PIN Authentication
- Secure 4-digit PIN access (Default: **1234**)
- Mobile-optimized keypad interface
- Visual feedback with animated PIN dots
- Error handling with shake animations

### 🏠 Medicine Management Dashboard
- Real-time medicine inventory display
- Integration with Firebase Realtime Database
- Medicine details including:
  - Name and dosage information
  - Current quantity with low stock warnings
  - RFID tag identification
- System status monitoring

### 📱 Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- PWA-ready with proper meta tags
- Dark/Light mode support
- Smooth animations and transitions

## 🚀 Technology Stack

- **Frontend**: Vite.js + Vanilla JavaScript (ES6 Modules)
- **Database**: Firebase Realtime Database
- **Styling**: Modern CSS with CSS Variables
- **Icons**: Emoji-based for universal compatibility
- **Architecture**: Modular component-based structure

## 🏗️ Project Structure

```
medispenser/
├── src/
│   ├── components/           # UI Components
│   │   ├── PinAuth.js       # PIN authentication component
│   │   ├── HomePage.js      # Home dashboard component
│   │   └── MedicineCard.js  # Medicine card component
│   ├── services/            # Business Logic
│   │   ├── authService.js   # Authentication logic
│   │   ├── firebaseService.js # Firebase operations
│   │   └── medicineService.js # Medicine data management
│   ├── utils/               # Utilities
│   │   └── constants.js     # App constants and configuration
│   ├── app.js              # Main application controller
│   ├── main.js             # Application entry point
│   ├── style.css           # Complete styling system
│   └── firebase.js         # Firebase configuration
├── index.html              # HTML entry point
└── package.json            # Dependencies and scripts
```

## 🔧 Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Update `src/firebase.js` with your Firebase configuration
   - Ensure Firebase Realtime Database is enabled

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📱 Usage

### Authentication
1. Open the application
2. Enter PIN: **1234** using the on-screen keypad
3. Tap "Enter" to access the main dashboard

### Main Dashboard
- View available medicines with real-time quantities
- Monitor system status
- Use "Check IDs" button for RFID functionality (placeholder)
- Logout using the unlock icon in the header

## 🗄️ Database Structure

Firebase Realtime Database structure:
```json
{
  "medicines": {
    "medicine1": {
      "name": "Paracetamol",
      "quantity": 25,
      "rfidId": "RFID001",
      "dosage": "500mg",
      "lastDispensed": null
    },
    "medicine2": {
      "name": "Aspirin",
      "quantity": 18,
      "rfidId": "RFID002",
      "dosage": "75mg",
      "lastDispensed": null
    }
  }
}
```

## 🏛️ Architecture

### **Component Layer**
- **PinAuth**: Handles PIN authentication UI and logic
- **HomePage**: Main dashboard with status and medicine display
- **MedicineCard**: Individual medicine card rendering

### **Service Layer**
- **AuthService**: PIN validation and authentication
- **FirebaseService**: Database connection and operations
- **MedicineService**: Medicine data management and state

### **Utils Layer**
- **Constants**: Centralized configuration and messages

### **App Controller**
- **App**: Main application routing and state management
- **main.js**: Clean entry point for application initialization

## 🎨 Design Features

- **Medical Theme**: Professional blue color scheme
- **Clean Architecture**: Separation of concerns with proper modularity
- **Micro-interactions**: Smooth hover and tap animations
- **Status Indicators**: Color-coded quantity warnings
- **Accessibility**: Touch-optimized for mobile devices

## 🔄 Future Enhancements

- Real RFID integration functionality
- Medicine dispensing history
- User management system
- Push notifications for low stock
- Barcode scanning capability
- Advanced analytics dashboard

## 🛡️ Security Notes

- Change default PIN in production
- Implement proper Firebase security rules
- Add user authentication for multiple users
- Consider HTTPS deployment for production

## 🔧 Development

### **Adding New Components**
1. Create component file in `src/components/`
2. Export render and setup functions
3. Import and use in appropriate parent component

### **Adding New Services**
1. Create service file in `src/services/`
2. Implement as class with singleton export
3. Import and use in components or other services

### **Modifying Constants**
- Update `src/utils/constants.js` for app-wide configuration changes

## 📞 Support

For issues or questions, please check the console for Firebase connection status and error messages. 