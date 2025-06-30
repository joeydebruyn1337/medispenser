# 💊 Medication Alert System

## Overview
The medication alert system automatically reminds patients to take their medications at scheduled times. Schedules are set programmatically in the code, and the system handles alerting and logging automatically.

## 🚀 Features

### Automatic Alerts
- ⏰ Alerts appear at scheduled times with medication name and dosage
- 🔊 Sound notification plays when alert appears
- ✅ "I took it" button logs the medication as taken
- ⏰ "Remind me in 5 minutes" snoozes the alert
- ❌ "Dismiss" closes the alert

### Enhanced Visual Design
- 💙 **Quantity** prominently displayed in blue highlighted box
- 💚 **Dosage** prominently displayed in green highlighted box
- 🟢 Green indicator: Active schedule
- 🔴 Red indicator: Disabled schedule  
- ⚪ Gray indicator: No schedule set
- Schedule times displayed on medicine cards

## 📝 Setting Medication Schedules

Schedules are configured in `src/services/alertService.js` in the `setupExampleSchedules()` method:

```javascript
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
  // Additional schedules for blood pressure, diabetes, heart, vitamin, and sleep medications
];
```

### Time Format
- Use 24-hour format: `'08:00'`, `'14:30'`, `'21:00'`
- Multiple times per day: `['08:00', '16:00', '00:00']`

### Available Schedule Templates
The system includes 10 different schedule templates:
1. **Every 6 hours**: Pain relief (Paracetamol)
2. **Once daily morning**: Cardiovascular protection (Aspirin)  
3. **Three times daily**: Anti-inflammatory (Ibuprofen)
4. **Every 8 hours**: Antibiotic course (Amoxicillin)
5. **Twice daily**: Morning and evening dosing
6. **Blood pressure**: Twice daily dosing
7. **Diabetes**: Three times with meals
8. **Heart medication**: Once daily
9. **Vitamin supplement**: Once daily morning
10. **Sleep aid**: Bedtime dosing

## 🧪 Testing Functions

Open browser console and use these functions:

```javascript
triggerTestAlert()        // Shows immediate test alert
showCurrentSchedules()    // Lists all medication schedules  
showMedicationLog()       // Shows medication intake history
clearAllData()           // Clears all data for fresh start
```

## 📋 How It Works

1. **Initialization**: System loads schedules from localStorage or sets up examples
2. **Monitoring**: Checks every 30 seconds for scheduled medication times
3. **Alerting**: Shows modal when current time matches scheduled time (±1 minute)
4. **Logging**: Records when medications are taken with timestamps
5. **Persistence**: Saves all data to localStorage

## 🔧 Customization

### Adding New Schedules
Edit the `exampleSchedules` array in `alertService.js`:

```javascript
{
  times: ['07:00', '19:00'],  // 7 AM and 7 PM
  description: 'Antibiotic course - twice daily'
}
```

### Modifying Existing Schedules
Update the times array for any medicine:

```javascript
// Change Paracetamol to 4 times daily
times: ['06:00', '12:00', '18:00', '24:00']
```

### Test Alerts
The system includes test alerts 2, 5, and 8 minutes after starting for demonstration purposes.

## 📱 User Experience

1. Patient sees medicine cards with **prominent quantity and dosage** in colored boxes
2. Green/red/gray schedule indicators show reminder status
3. At scheduled time, alert modal appears with medication details
4. Patient clicks "I took it" to log medication
5. System updates display and logs the intake
6. Alert automatically dismissed after 5 minutes if no action

## 🎨 UI Improvements

- **Quantity**: Blue highlighted box with large, bold numbers
- **Dosage**: Green highlighted box with large, bold text
- **RFID information**: Removed for cleaner interface
- **Last dispensed**: Moved to secondary information area
- **Color-coded**: Quantity (blue) and Dosage (green) for quick recognition

## 🗃️ Data Storage

- Schedules and logs stored in browser localStorage
- Persistent across browser sessions
- Use `clearAllData()` to reset for testing 