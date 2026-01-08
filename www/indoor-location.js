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

// Get room config by base type (handles bathroom2, kitchen3, etc)
function getRoomConfig(roomKey, roomData) {
    const baseType = roomData?.baseType || roomKey.replace(/\d+$/, ''); // Remove trailing numbers
    return roomConfig[baseType] || null;
}

// Save a room zone/fingerprint
async function saveRoomZone(roomName, roomData = null) {
    try {
        // Get current fingerprint
        const fingerprint = await getWiFiFingerprint();

        if (!fingerprint || fingerprint.length === 0) {
            console.warn('⚠️ No fingerprint data detected');
            return false;
        }

        const baseType = (roomData && roomData.baseType) ? roomData.baseType : roomName.replace(/\d+$/, '');
        const config = getRoomConfig(roomName, roomData) || roomConfig[baseType] || {};

        indoorLocation.roomZones[roomName] = {
            fingerprint,
            timestamp: Date.now(),
            baseType,
            displayName: roomData?.displayName,
            config
        };

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
        
        for (const [roomKey, roomData] of Object.entries(indoorLocation.roomZones)) {
            const similarity = compareFingerprints(currentFingerprint, roomData.fingerprint);
            
            console.log(`📍 ${roomKey}: ${(similarity * 100).toFixed(0)}% match`);
            
            if (similarity > highestSimilarity && similarity > 0.7) {
                highestSimilarity = similarity;
                bestMatch = { key: roomKey, data: roomData, similarity };
            }
        }
        
        // Room changed?
        if (bestMatch && bestMatch.key !== indoorLocation.currentRoom) {
            const displayName = bestMatch.data.displayName || bestMatch.key;
            console.log(`🚪 Room changed: ${indoorLocation.currentRoom} → ${displayName}`);
            onRoomChanged(bestMatch.key, bestMatch.data);
        }
        
        return bestMatch ? bestMatch.key : null;
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
function onRoomChanged(roomKey, roomData) {
    indoorLocation.lastRoom = indoorLocation.currentRoom;
    indoorLocation.currentRoom = roomKey;
    
    const config = getRoomConfig(roomKey, roomData);
    if (!config) {
        console.warn(`⚠️ No configuration found for room: ${roomKey}`);
        return;
    }
    
    const displayName = roomData.displayName || roomKey;
    console.log(`📍 Entered: ${displayName}`);
    console.log(`🎯 Action: ${config.action}`);
    
    // Show notification
    showRoomNotification(config.icon, displayName);
    
    // Trigger room-specific action
    triggerRoomAction(roomKey, config, displayName);
}

// Show room entry notification
function showRoomNotification(icon, roomName) {
    // Show Android push notification
    if (typeof showRoomEntryNotification !== 'undefined') {
        showRoomEntryNotification(roomName, icon);
    }
    
    // Also show in-app notification
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
function triggerRoomAction(roomKey, config, displayName) {
    const action = config.action;
    const message = config.message;
    
    // Speak message
    if (typeof safeSpeakAndRespond !== 'undefined') {
        safeSpeakAndRespond(message);
    } else if (typeof speak !== 'undefined') {
        speak(message);
    }
    
    // Execute action with display name
    switch(action) {
        case 'startBathroomTimer':
            handleBathroomEntry(displayName);
            break;
            
        case 'askPurpose':
            handleKitchenEntry(displayName);
            break;
            
        case 'checkTime':
            handleBedroomEntry(displayName);
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
function handleKitchenEntry(displayName) {
    console.log('🍳 Kitchen entry detected - asking purpose');
    
    const roomName = displayName || 'Kitchen';
    
    // Always ask what they're doing and listen
    const question = "What are you doing in the kitchen?";
    
    if (typeof askQuestion !== 'undefined') {
        console.log('🎤 Asking question and listening...');
        askQuestion(question, 'kitchen_purpose');
    } else if (typeof safeSpeakAndRespond !== 'undefined') {
        console.log('🎤 Speaking and listening (fallback)...');
        safeSpeakAndRespond(question, true);
        
        // Set context manually if askQuestion not available
        if (typeof voiceAssistant !== 'undefined') {
            voiceAssistant.conversationContext = 'kitchen_purpose';
        }
    } else if (typeof speak !== 'undefined') {
        speak(question);
    }
    
    // Start confusion detection for kitchen
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
        if (indoorLocation.currentRoom === context || 
            (indoorLocation.currentRoom && indoorLocation.currentRoom.startsWith(context))) {
            
            console.log('⏰ 2 minutes passed - checking for confusion...');
            
            let confusionMessage = '';
            
            // KITCHEN - Remind them what they said they were doing
            if (context === 'kitchen' || (indoorLocation.currentRoom && indoorLocation.currentRoom.startsWith('kitchen'))) {
                const savedPurpose = localStorage.getItem('kitchen_purpose');
                const savedTime = localStorage.getItem('kitchen_purpose_time');
                
                if (savedPurpose && savedTime) {
                    const timeDiff = Date.now() - parseInt(savedTime);
                    // Only use if saved within last 10 minutes
                    if (timeDiff < 10 * 60 * 1000) {
                        confusionMessage = `Remember, you came to the kitchen to ${savedPurpose}. Do you need help with that?`;
                        console.log('💡 Reminding patient of their stated purpose:', savedPurpose);
                    } else {
                        confusionMessage = "You've been in the kitchen for a while. Are you looking for something specific? The cups are in the top cabinet. Water is in the fridge.";
                    }
                } else {
                    confusionMessage = "You've been in the kitchen for a while. Are you looking for something? Let me help you. The cups are in the top cabinet.";
                }
            }
            // BEDROOM
            else if (context === 'bedroom' || (indoorLocation.currentRoom && indoorLocation.currentRoom.startsWith('bedroom'))) {
                const messages = [
                    'Do you need help finding something?',
                    'Your clothes are in the closet. Medicines are in the drawer.',
                    'Would you like me to call someone to help you?'
                ];
                confusionMessage = messages[Math.floor(Math.random() * messages.length)];
            }
            // BATHROOM
            else if (context === 'bathroom' || (indoorLocation.currentRoom && indoorLocation.currentRoom.startsWith('bathroom'))) {
                const messages = [
                    'You\'ve been in the bathroom for a while. Are you okay?',
                    'Do you need any assistance?'
                ];
                confusionMessage = messages[Math.floor(Math.random() * messages.length)];
            }
            // OTHER ROOMS
            else {
                confusionMessage = 'You\'ve been here for a while. Do you need help with something?';
            }
            
            if (confusionMessage) {
                // Show Android notification
                if (typeof showConfusionNotification !== 'undefined') {
                    showConfusionNotification(context, confusionMessage);
                }
                
                // Speak the message and listen
                if (typeof safeSpeakAndRespond !== 'undefined') {
                    safeSpeakAndRespond(confusionMessage, true);
                } else if (typeof speak !== 'undefined') {
                    speak(confusionMessage);
                }
                
                console.log('⚠️ Possible confusion detected - offering help');
                console.log('🔔 Android notification sent');
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
