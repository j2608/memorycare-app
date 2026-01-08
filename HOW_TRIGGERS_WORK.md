# 🎯 HOW THE TRIGGERS WORK - EXPLAINED

## Overview
The app uses **trigger-monitor.js** to automatically detect when the patient goes to the bathroom or enters a different room. Here's exactly how it works:

---

## 🚽 BATHROOM TRIGGER - How It Knows You're in the Bathroom

### METHOD 1: Manual Button (Current Implementation)
- Patient clicks "🚽 I'm going to the bathroom" button
- App starts a timer: `monitorState.bathroomStartTime = Date.now()`
- Every **15 seconds**, the app checks how long you've been in the bathroom
- Alerts are triggered at:
  - **15 minutes**: "You've been in the bathroom for 15 minutes. Are you okay?"
  - **30 minutes**: "ALERT: You've been in the bathroom for 30 minutes!"

### How the Time Tracking Works:
```javascript
// In trigger-monitor.js, line 218-250
function checkBathroomDuration() {
    if (!monitorState.bathroomStartTime) {
        return; // Timer not started
    }
    
    const duration = Date.now() - monitorState.bathroomStartTime;
    const minutes = Math.floor(duration / 60000); // Convert to minutes
    
    // Alert at 15 minutes
    if (minutes >= 15 && !monitorState.bathroom15MinAlert) {
        speakWithBackground("You've been in the bathroom for 15 minutes. Are you okay?");
        monitorState.bathroom15MinAlert = true;
    }
    
    // Alert at 30 minutes
    if (minutes >= 30 && !monitorState.bathroom30MinAlert) {
        speakWithBackground("ALERT: You've been in the bathroom for 30 minutes!");
        monitorState.bathroom30MinAlert = true;
    }
}
```

### METHOD 2: Automatic Detection (Future Enhancement)
**Not yet implemented, but here's how it would work:**
- Use **Bluetooth beacons** placed in the bathroom
- When patient's phone detects the beacon signal → "Patient entered bathroom"
- OR use **WiFi signal strength** to detect proximity to bathroom router
- OR use **motion sensors** in the bathroom connected to the app

---

## 🚪 ROOM CHANGE TRIGGER - How It Knows You Changed Rooms

### Current Implementation (Basic Detection)
The app monitors for room changes every **60 seconds**:

```javascript
// In trigger-monitor.js, line 164-198
function startRoomMonitoring() {
    // Check every 60 seconds
    setInterval(() => {
        checkRoomChange();
    }, 60000);
}

function checkRoomChange() {
    // Currently uses simulated detection
    // In real implementation, would use:
    // 1. Bluetooth beacons (different beacon per room)
    // 2. WiFi fingerprinting (different WiFi signal patterns per room)
    // 3. NFC tags placed at room entrances
    
    const timeSinceLastChange = Date.now() - monitorState.lastRoomChangeTime;
    
    if (timeSinceLastChange > 5 * 60 * 1000) { // 5 minutes
        // Trigger room change alert
        speakWithBackground("You entered a different room. What are you doing here?");
        notifyCaregiver({
            type: 'room_change',
            trigger: 'entered_new_room'
        });
    }
}
```

### METHOD 1: Bluetooth Beacons (Recommended for Production)
**How it works:**
1. Place small **Bluetooth beacons** in each room:
   - Living Room: Beacon ID "ROOM_LIVING"
   - Bedroom: Beacon ID "ROOM_BEDROOM"
   - Kitchen: Beacon ID "ROOM_KITCHEN"
   - Bathroom: Beacon ID "ROOM_BATHROOM"

2. App scans for nearby beacons:
```javascript
// When beacon signal detected:
if (detectedBeaconID !== lastBeaconID) {
    // Patient changed rooms!
    const roomName = getRoomName(detectedBeaconID);
    speakWithBackground(`You entered the ${roomName}. What are you doing here?`);
}
```

3. **Advantages:**
   - Very accurate (within 1-3 meters)
   - Works indoors
   - Low cost ($5-15 per beacon)
   - Low battery drain

### METHOD 2: WiFi Fingerprinting
**How it works:**
- Each room has different WiFi signal strengths
- App measures signal strength from all available WiFi networks
- Creates a "fingerprint" for each room:
  - Living Room: Router A (-40 dBm), Router B (-60 dBm)
  - Bedroom: Router A (-70 dBm), Router B (-45 dBm)
- When fingerprint changes → room changed

### METHOD 3: NFC Tags
**How it works:**
- Place **NFC tags** at each room entrance
- Patient taps phone to tag when entering room
- OR use **automatic NFC detection** (phone automatically reads tag when nearby)

---

## 📍 LOCATION TRIGGER - How It Knows You Left Home

### GPS-Based Distance Tracking
The app tracks your GPS location every **30 seconds**:

```javascript
// In trigger-monitor.js, line 50-156
function startLocationMonitoring() {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // If this is first time, set as home location
            if (!monitorState.homeLocation) {
                monitorState.homeLocation = { lat, lng };
            }
            
            // Calculate distance from home
            const distance = calculateDistance(
                lat, lng,
                monitorState.homeLocation.lat,
                monitorState.homeLocation.lng
            );
            
            // If more than 100 meters from home
            if (distance > 0.1) { // 0.1 km = 100 meters
                speakWithBackground("You're far from home. Are you lost?");
                showLostAlert(); // Shows map with current location
                notifyCaregiver({
                    type: 'location_alert',
                    distance: distance,
                    location: { lat, lng }
                });
            }
        });
    }, 30000); // Every 30 seconds
}

// Calculate distance using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
}
```

### How Location Detection Works:
1. **First GPS Fix = Home Location**
   - When app starts, first GPS reading is saved as "home"
   - `monitorState.homeLocation = { lat: 12.9716, lng: 77.5946 }`

2. **Continuous Monitoring**
   - Every 30 seconds, app gets current GPS location
   - Calculates distance from home using Haversine formula
   - If distance > 100 meters → "You're far from home!"

3. **Lost Alert Triggered**
   - Shows map with current location
   - Speaks: "You seem lost. Stay where you are. Help is coming."
   - Sends GPS coordinates to caregiver
   - Displays address (if available via reverse geocoding)

---

## 🎤 VOICE ASSISTANCE INTEGRATION

All triggers work with **voice-assistant.js** for two-way conversation:

### Example: Bathroom Trigger + Voice
```javascript
// When 15-minute alert fires:
speakWithBackground("You've been in the bathroom for 15 minutes. Are you okay?");

// Voice assistant listens for response:
// If patient says: "I'm okay" → No action
// If patient says: "Help me" → Call caregiver
// If no response for 2 minutes → Auto-call caregiver
```

### Example: Room Change + Voice
```javascript
// When entering new room:
speakWithBackground("You entered a different room. What are you doing here?");

// Voice assistant listens for:
// "I'm looking for the bathroom" → Give directions
// "I'm lost" → Call caregiver
// "I need help" → Emergency SOS
```

---

## 🔧 CURRENT STATUS

### ✅ What's Working:
- ✅ Bathroom timer (manual start with button)
- ✅ Location tracking (GPS every 30 seconds)
- ✅ Lost detection (>100m from home)
- ✅ Voice alerts for all triggers
- ✅ Caregiver notifications
- ✅ Background monitoring (app works even when minimized)

### ⚠️ What's Not Yet Implemented:
- ⚠️ Automatic bathroom detection (needs Bluetooth beacons)
- ⚠️ Accurate room change detection (needs beacons/WiFi fingerprinting)
- ⚠️ Fall detection (needs accelerometer + machine learning)
- ⚠️ Heart rate monitoring (needs smartwatch integration)

---

## 🛠️ HOW TO TEST

### Test Bathroom Trigger:
1. Open patient.html
2. Click "🚽 I'm going to the bathroom"
3. Wait 15 seconds (for testing, not 15 minutes)
4. App should speak: "You've been in the bathroom for 15 minutes"
5. Click "I'm back" to stop timer

### Test Location Trigger:
1. Open patient.html
2. Allow location permission
3. First GPS reading = home location
4. Simulate movement (change GPS in browser DevTools)
5. If >100m → Alert "You're far from home"

### Test Room Change:
1. Open patient.html  
2. Currently simulated (10% random chance per check)
3. For production: Install Bluetooth beacons in each room

---

## 📱 REQUIRED PERMISSIONS

All triggers require these Android permissions (already added to AndroidManifest.xml):

```xml
<!-- For Location Tracking -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- For Background Monitoring -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- For Voice Assistance -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- For Bluetooth Beacons (future) -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
```

---

## 🎯 SUMMARY

**How the app knows you're in the bathroom:**
- ✅ Manual button press (current)
- 🔜 Bluetooth beacon detection (future)

**How the app knows you changed rooms:**
- ⚠️ Simulated (current - random triggers)
- 🔜 Bluetooth beacons (recommended)
- 🔜 WiFi fingerprinting (alternative)

**How the app knows you left home:**
- ✅ GPS distance tracking (current)
- ✅ Continuous monitoring every 30 seconds
- ✅ Alerts when >100m from home

All triggers are **voice-enabled** and work in the **background** even when the app is minimized!
