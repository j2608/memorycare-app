/**
 * INDOOR LOCATION TRACKING SYSTEM
 * Detects which room the patient is in using WiFi fingerprinting
 * Triggers automatic actions based on room entry
 */

console.log('🏠 Indoor Location System Loading...');

// Indoor location state
const indoorLocation = {
    currentRoom: null,
    lastRoom: null,
    roomZones: {},
    isMonitoring: false,
    checkInterval: null,
    wifiNetworks: [],
    lastCheck: null
};

// Room configuration (set by caregiver)
const roomConfig = {
    bathroom: {
        name: 'Bathroom',
        icon: '🚽',
        action: 'startBathroomTimer',
        message: 'Okay, take your time.',
        autoStart: true
    },
    kitchen: {
        name: 'Kitchen',
        icon: '🍳',
        action: 'askPurpose',
        message: 'Why are you in the kitchen?',
        autoStart: false,
        listenForResponse: true
    },
    bedroom: {
        name: 'Bedroom',
        icon: '🛏️',
        action: 'checkTime',
        message: 'Going to rest?',
        autoStart: false
    },
    livingroom: {
        name: 'Living Room',
        icon: '🛋️',
        action: 'greet',
        message: 'Welcome to the living room.',
        autoStart: false
    }
};

// Initialize indoor location tracking
function initIndoorLocation() {
    console.log('🏠 Initializing indoor location tracking...');
    
    // Load saved room configurations
    loadRoomZones();
    
    // Start monitoring
    startIndoorMonitoring();
    
    console.log('✅ Indoor location tracking initialized');
}

// Load room WiFi fingerprints from localStorage
function loadRoomZones() {
    const savedZones = localStorage.getItem('memorycare_roomZones');
    if (savedZones) {
        try {
            indoorLocation.roomZones = JSON.parse(savedZones);
            console.log('📡 Loaded room zones:', Object.keys(indoorLocation.roomZones));
        } catch (error) {
            console.error('Error loading room zones:', error);
        }
    } else {
        console.log('⚠️ No room zones configured yet');
    }
}

// Save current location as a room zone
async function saveRoomZone(roomName) {
    console.log(`📍 Saving current location as: ${roomName}`);
    
    try {
        // Get WiFi fingerprint
        const fingerprint = await getWiFiFingerprint();
        
        if (!fingerprint || fingerprint.length === 0) {
            console.warn('⚠️ No WiFi networks detected');
            return false;
        }
        
        // Save fingerprint for this room
        indoorLocation.roomZones[roomName] = {
            fingerprint: fingerprint,
            timestamp: Date.now(),
            config: roomConfig[roomName] || {}
        };
        
        // Save to localStorage
        localStorage.setItem('memorycare_roomZones', JSON.stringify(indoorLocation.roomZones));
        
        console.log(`✅ Room zone saved: ${roomName}`, fingerprint);
        return true;
    } catch (error) {
        console.error('Error saving room zone:', error);
        return false;
    }
}

// Get WiFi fingerprint (signal strengths of nearby networks)
async function getWiFiFingerprint() {
    // Note: Browser APIs don't directly expose WiFi signal strength
    // This is a simplified simulation using available network info
    
    // For production, you would use:
    // 1. Bluetooth beacons (best option)
    // 2. Native mobile app with WiFi scanning permissions
    // 3. Device's built-in sensors
    
    // Simulated fingerprint based on available APIs
    const fingerprint = [];
    
    try {
        // Get connection info
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            fingerprint.push({
                type: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                timestamp: Date.now()
            });
        }
        
        // Add geolocation as additional fingerprint data
        if (navigator.geolocation) {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000
                });
            });
            
            fingerprint.push({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            });
        }
        
        return fingerprint;
    } catch (error) {
        console.error('Error getting WiFi fingerprint:', error);
        return [];
    }
}

// Start monitoring room changes
function startIndoorMonitoring() {
    if (indoorLocation.isMonitoring) {
        console.log('⚠️ Already monitoring');
        return;
    }
    
    console.log('🏠 Starting indoor location monitoring...');
    indoorLocation.isMonitoring = true;
    
    // Check room every 10 seconds
    indoorLocation.checkInterval = setInterval(async () => {
        await detectCurrentRoom();
    }, 10000);
    
    // Initial check
    detectCurrentRoom();
}

// Stop monitoring
function stopIndoorMonitoring() {
    if (indoorLocation.checkInterval) {
        clearInterval(indoorLocation.checkInterval);
        indoorLocation.checkInterval = null;
    }
    indoorLocation.isMonitoring = false;
    console.log('🏠 Indoor monitoring stopped');
}

// Detect which room the patient is currently in
async function detectCurrentRoom() {
    if (Object.keys(indoorLocation.roomZones).length === 0) {
        // No rooms configured yet
        return null;
    }
    
    try {
        // Get current fingerprint
        const currentFingerprint = await getWiFiFingerprint();
        
        if (!currentFingerprint || currentFingerprint.length === 0) {
            return null;
        }
        
        // Compare with saved room fingerprints
        let bestMatch = null;
        let highestSimilarity = 0;
        
        for (const [roomName, roomData] of Object.entries(indoorLocation.roomZones)) {
            const similarity = compareFingerprints(currentFingerprint, roomData.fingerprint);
            
            if (similarity > highestSimilarity && similarity > 0.7) {
                highestSimilarity = similarity;
                bestMatch = roomName;
            }
        }
        
        // Room changed?
        if (bestMatch && bestMatch !== indoorLocation.currentRoom) {
            console.log(`🚪 Room changed: ${indoorLocation.currentRoom} → ${bestMatch}`);
            onRoomChanged(bestMatch);
        }
        
        return bestMatch;
    } catch (error) {
        console.error('Error detecting room:', error);
        return null;
    }
}

// Compare two WiFi fingerprints
function compareFingerprints(fp1, fp2) {
    // Simple similarity calculation
    // For production, use proper WiFi fingerprinting algorithm
    
    if (!fp1 || !fp2 || fp1.length === 0 || fp2.length === 0) {
        return 0;
    }
    
    // Check geolocation similarity
    const loc1 = fp1.find(f => f.latitude);
    const loc2 = fp2.find(f => f.latitude);
    
    if (loc1 && loc2) {
        const distance = calculateDistance(
            loc1.latitude, loc1.longitude,
            loc2.latitude, loc2.longitude
        );
        
        // If within 5 meters, very similar (indoor)
        if (distance < 0.005) { // ~5 meters in km
            return 0.9;
        } else if (distance < 0.01) { // ~10 meters
            return 0.7;
        } else if (distance < 0.02) { // ~20 meters
            return 0.5;
        }
    }
    
    return 0.3;
}

// Calculate distance between two GPS coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Handle room change event
function onRoomChanged(newRoom) {
    indoorLocation.lastRoom = indoorLocation.currentRoom;
    indoorLocation.currentRoom = newRoom;
    
    const roomData = indoorLocation.roomZones[newRoom];
    const config = roomData?.config || roomConfig[newRoom] || {};
    
    console.log(`📍 Entered: ${config.name || newRoom}`);
    console.log(`🎯 Action: ${config.action}`);
    
    // Show notification
    showRoomNotification(config.icon, config.name);
    
    // Trigger room-specific action
    triggerRoomAction(newRoom, config);
}

// Show room entry notification
function showRoomNotification(icon, roomName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 24px;
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `${icon} ${roomName}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Trigger action based on room
function triggerRoomAction(roomName, config) {
    const action = config.action;
    const message = config.message;
    
    // Speak message
    if (typeof safeSpeakAndRespond !== 'undefined') {
        safeSpeakAndRespond(message);
    } else if (typeof speak !== 'undefined') {
        speak(message);
    }
    
    // Execute action
    switch(action) {
        case 'startBathroomTimer':
            handleBathroomEntry();
            break;
            
        case 'askPurpose':
            handleKitchenEntry();
            break;
            
        case 'checkTime':
            handleBedroomEntry();
            break;
            
        case 'greet':
            // Just greeting, no special action
            break;
            
        default:
            console.log(`⚠️ Unknown action: ${action}`);
    }
}

// Bathroom entry - start timer automatically
function handleBathroomEntry() {
    console.log('🚽 Bathroom entry detected - starting timer');
    
    // Call bathroom monitoring from trigger-monitor.js
    if (typeof bathroomStarted !== 'undefined') {
        bathroomStarted();
    } else if (typeof window.bathroomStarted === 'function') {
        window.bathroomStarted();
    } else {
        // Manual timer start
        const bathroomTime = Date.now();
        localStorage.setItem('bathroomStartTime', bathroomTime);
        console.log('✅ Bathroom timer started manually');
    }
}

// Kitchen entry - ask why and listen
function handleKitchenEntry() {
    console.log('🍳 Kitchen entry detected - asking purpose');
    
    // Ask question and listen for response
    if (typeof askQuestion !== 'undefined') {
        askQuestion('Why are you in the kitchen?', 'kitchen_purpose');
    } else if (typeof voiceAssistant !== 'undefined' && voiceAssistant.askQuestion) {
        voiceAssistant.askQuestion('Why are you in the kitchen?', 'kitchen_purpose');
    } else {
        // Fallback: just speak
        const responses = [
            'Are you looking for something to eat?',
            'Do you need water?',
            'Are you hungry?',
            'Can I help you find something?'
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        if (typeof safeSpeakAndRespond !== 'undefined') {
            safeSpeakAndRespond(response, true); // Listen after speaking
        } else if (typeof speak !== 'undefined') {
            speak(response);
        }
    }
    
    // Detect confusion
    detectConfusion('kitchen');
}

// Bedroom entry - check if it's bedtime
function handleBedroomEntry() {
    console.log('🛏️ Bedroom entry detected - checking time');
    
    const now = new Date();
    const hour = now.getHours();
    
    let message = '';
    
    if (hour >= 21 || hour < 6) {
        // Night time
        message = 'It\'s time to rest. Would you like me to remind you of your bedtime routine?';
    } else if (hour >= 13 && hour < 16) {
        // Afternoon nap time
        message = 'Taking an afternoon nap? Sleep well!';
    } else {
        // Other times
        message = 'Do you need something from the bedroom?';
    }
    
    if (typeof safeSpeakAndRespond !== 'undefined') {
        safeSpeakAndRespond(message, true);
    } else if (typeof speak !== 'undefined') {
        speak(message);
    }
}

// Detect confusion based on behavior
function detectConfusion(context) {
    console.log(`🤔 Checking for confusion in: ${context}`);
    
    // Track how long patient stays in room
    const entryTime = Date.now();
    
    setTimeout(() => {
        // If still in same room after 2 minutes, check if confused
        if (indoorLocation.currentRoom === context) {
            const confusionMessages = {
                kitchen: [
                    'You\'ve been in the kitchen for a while. Are you looking for something specific?',
                    'Let me help you. The cups are in the top cabinet. Water is in the fridge.',
                    'If you\'re hungry, there are snacks in the pantry.'
                ],
                bedroom: [
                    'Do you need help finding something?',
                    'Your clothes are in the closet. Medicines are in the drawer.',
                    'Would you like me to call someone to help you?'
                ],
                bathroom: [
                    'You\'ve been in the bathroom for a while. Are you okay?',
                    'Do you need any assistance?'
                ]
            };
            
            const messages = confusionMessages[context] || [];
            if (messages.length > 0) {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                
                if (typeof safeSpeakAndRespond !== 'undefined') {
                    safeSpeakAndRespond(randomMessage, true);
                } else if (typeof speak !== 'undefined') {
                    speak(randomMessage);
                }
                
                console.log('⚠️ Possible confusion detected - offering help');
            }
        }
    }, 120000); // 2 minutes
}

// Export functions
window.indoorLocation = {
    init: initIndoorLocation,
    saveRoomZone,
    startMonitoring: startIndoorMonitoring,
    stopMonitoring: stopIndoorMonitoring,
    getCurrentRoom: () => indoorLocation.currentRoom,
    getRoomZones: () => indoorLocation.roomZones
};

console.log('✅ Indoor Location System Loaded');
