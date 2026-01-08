/**
 * TRIGGER MONITORING SYSTEM - ACTIVE VERSION
 * Monitors location, bathroom, room changes in real-time
 * Works with voice alerts in background
 */

console.log('🎯 Trigger Monitor Loading...');

// Global trigger state
const monitorState = {
    locationTracking: false,
    bathroomStartTime: null,
    currentRoom: null,
    lastRoomChangeTime: null,
    homeLocation: null,
    outsideStartTime: null,
    lastLocation: null,
    locationCheckInterval: null,
    roomCheckInterval: null,
    bathroomCheckInterval: null,
    isInitialized: false
};

// Initialize trigger monitoring
function initTriggerMonitoring() {
    console.log('🎯 Initializing Trigger Monitoring System...');
    
    if (monitorState.isInitialized) {
        console.log('⚠️ Already initialized');
        return;
    }
    
    // Start location monitoring (every 30 seconds)
    startLocationMonitoring();
    
    // Start room change monitoring (every 60 seconds)
    startRoomMonitoring();
    
    // Start bathroom monitoring (every 15 seconds)
    startBathroomMonitoring();
    
    monitorState.isInitialized = true;
    console.log('✅ Trigger Monitoring Active!');
    
    // Show confirmation
    speakWithBackground('Monitoring system is now active. I will alert you when needed.');
}

// ==================== LOCATION TRIGGER ====================
function startLocationMonitoring() {
    console.log('📍 Starting location monitoring...');
    
    // Get home location from patient data
    const homeData = localStorage.getItem('memorycare_home_location');
    if (homeData) {
        monitorState.homeLocation = JSON.parse(homeData);
        console.log('🏠 Home location set:', monitorState.homeLocation);
    }
    
    // Start tracking every 30 seconds
    monitorState.locationCheckInterval = setInterval(() => {
        checkLocationTrigger();
    }, 30000);
    
    // Check immediately
    checkLocationTrigger();
}

function checkLocationTrigger() {
    if (!navigator.geolocation) {
        console.warn('⚠️ Geolocation not available');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            
            console.log(`📍 Current location: ${currentLat}, ${currentLng}`);
            
            monitorState.lastLocation = { lat: currentLat, lng: currentLng };
            
            // Check if left home (if home location is set)
            if (monitorState.homeLocation) {
                const distance = calculateDistance(
                    monitorState.homeLocation.lat,
                    monitorState.homeLocation.lng,
                    currentLat,
                    currentLng
                );
                
                console.log(`📏 Distance from home: ${distance.toFixed(2)}m`);
                
                // If more than 100 meters from home
                if (distance > 100) {
                    if (!monitorState.outsideStartTime) {
                        // Just left home
                        monitorState.outsideStartTime = Date.now();
                        console.log('🚶 TRIGGER: Left home');
                        
                        triggerLocationAlert('leaving_home', {
                            distance: distance,
                            message: 'You are going out. Where are you going?'
                        });
                    } else {
                        // Check how long outside
                        const timeOutside = Date.now() - monitorState.outsideStartTime;
                        const minutesOutside = Math.floor(timeOutside / 60000);
                        
                        console.log(`⏱️ Been outside for ${minutesOutside} minutes`);
                        
                        // Alert if outside more than 30 minutes
                        if (minutesOutside >= 30 && minutesOutside % 15 === 0) {
                            console.log('⚠️ TRIGGER: Outside too long');
                            
                            triggerLocationAlert('outside_too_long', {
                                minutes: minutesOutside,
                                message: `You have been outside for ${minutesOutside} minutes. Let's return home.`
                            });
                        }
                    }
                } else {
                    // Back home
                    if (monitorState.outsideStartTime) {
                        console.log('🏠 Back home');
                        monitorState.outsideStartTime = null;
                    }
                }
            }
        },
        (error) => {
            console.error('❌ Location error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function triggerLocationAlert(type, data) {
    console.log('📍 LOCATION TRIGGER:', type, data);
    
    // Speak the alert
    speakWithBackground(data.message);
    
    // Show visual alert
    showTriggerNotification('📍 Location Alert', data.message);
    
    // Notify caregiver
    notifyCaregiver({
        type: 'location',
        trigger: type,
        location: monitorState.lastLocation,
        data: data,
        timestamp: new Date().toISOString()
    });
}

// ==================== ROOM CHANGE TRIGGER ====================
function startRoomMonitoring() {
    console.log('🚪 Starting room change monitoring...');
    
    // Monitor room changes every 60 seconds
    monitorState.roomCheckInterval = setInterval(() => {
        checkRoomChange();
    }, 60000);
}

function checkRoomChange() {
    // This would typically use Bluetooth beacons or WiFi detection
    // For now, we'll use a simplified detection method
    
    // Check if significant location change (indoors)
    if (monitorState.lastLocation) {
        // Simulated room detection (in real app, use beacons)
        const currentTime = Date.now();
        
        if (monitorState.lastRoomChangeTime) {
            const timeSinceLastChange = currentTime - monitorState.lastRoomChangeTime;
            
            // If room hasn't changed in a while, check periodically
            if (timeSinceLastChange > 5 * 60 * 1000) { // 5 minutes
                console.log('🚪 Checking for room change...');
                
                // Randomly trigger for demo (in real app, use actual room detection)
                if (Math.random() < 0.1) { // 10% chance per check
                    triggerRoomChangeAlert();
                }
            }
        }
    }
}

function triggerRoomChangeAlert() {
    console.log('🚪 TRIGGER: Entered new room');
    
    monitorState.lastRoomChangeTime = Date.now();
    
    const message = 'You entered a different room. What are you doing here?';
    
    // Speak the alert
    speakWithBackground(message);
    
    // Show visual alert
    showTriggerNotification('🚪 Room Change', message);
    
    // Notify caregiver
    notifyCaregiver({
        type: 'room_change',
        trigger: 'entered_new_room',
        timestamp: new Date().toISOString()
    });
}

// ==================== BATHROOM TRIGGER ====================
function startBathroomMonitoring() {
    console.log('🚽 Starting bathroom monitoring...');
    
    // Check bathroom status every 15 seconds
    monitorState.bathroomCheckInterval = setInterval(() => {
        checkBathroomDuration();
    }, 15000);
}

function bathroomStarted() {
    console.log('🚽 TRIGGER: Bathroom started');
    
    monitorState.bathroomStartTime = Date.now();
    
    const message = 'Okay, take your time.';
    
    // Speak the alert
    speakWithBackground(message);
    
    // Show visual notification
    showTriggerNotification('🚽 Bathroom', message);
}

function checkBathroomDuration() {
    if (!monitorState.bathroomStartTime) {
        return;
    }
    
    const duration = Date.now() - monitorState.bathroomStartTime;
    const minutes = Math.floor(duration / 60000);
    
    console.log(`🚽 In bathroom for ${minutes} minutes`);
    
    // Alert after 15 minutes
    if (minutes === 15) {
        const message = 'Are you okay? What are you doing now?';
        speakWithBackground(message);
        showTriggerNotification('🚽 Bathroom Check', message);
        
        notifyCaregiver({
            type: 'bathroom',
            trigger: 'bathroom_too_long',
            duration: minutes,
            timestamp: new Date().toISOString()
        });
    }
    
    // Critical alert after 30 minutes
    if (minutes === 30) {
        const message = 'You have been in the bathroom a long time. Are you alright?';
        speakWithBackground(message);
        showTriggerNotification('🚨 Bathroom Alert', message);
        
        notifyCaregiver({
            type: 'bathroom',
            trigger: 'bathroom_risk',
            duration: minutes,
            priority: 'critical',
            timestamp: new Date().toISOString()
        });
    }
}

function bathroomEnded() {
    console.log('🚽 Bathroom ended');
    monitorState.bathroomStartTime = null;
}

// ==================== HELPER FUNCTIONS ====================

// Enhanced speak function that works in background
function speakWithBackground(text) {
    console.log('🔊 SPEAKING:', text);
    
    try {
        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // CRITICAL: Resume speech synthesis (needed for background)
        window.speechSynthesis.resume();
        
        // Speak
        window.speechSynthesis.speak(utterance);
        
        // Keep speech alive in background
        utterance.onend = () => {
            console.log('✅ Speech completed');
            window.speechSynthesis.cancel(); // Clean up
        };
        
        utterance.onerror = (error) => {
            console.error('❌ Speech error:', error);

            const err = error?.error;
            // Avoid infinite loops when we cancel speech to interrupt with another message.
            if (err === 'interrupted' || err === 'canceled') return;
            if (utterance.__retryAttempted) return;
            utterance.__retryAttempted = true;

            // Retry once for non-interrupt failures
            setTimeout(() => {
                window.speechSynthesis.cancel();
                window.speechSynthesis.resume();
                window.speechSynthesis.speak(utterance);
            }, 500);
        };
        
        console.log('✅ Speech queued');
        
    } catch (error) {
        console.error('❌ Speech failed:', error);
    }
}

// Show visual notification
function showTriggerNotification(title, message) {
    // Create notification element
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 20px;
        font-size: 24px;
        font-weight: bold;
        z-index: 999999;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        text-align: center;
        max-width: 90%;
        animation: slideIn 0.5s ease-out;
    `;
    
    notif.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">${title.split(' ')[0]}</div>
        <div style="font-size: 20px; line-height: 1.5;">${message}</div>
    `;
    
    document.body.appendChild(notif);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        notif.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => notif.remove(), 500);
    }, 8000);
}

// Calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

// Notify caregiver of trigger event
function notifyCaregiver(data) {
    console.log('📲 Notifying caregiver:', data);
    
    // Save to localStorage for caregiver dashboard
    const alerts = JSON.parse(localStorage.getItem('memorycare_caregiver_alerts') || '[]');
    alerts.unshift(data);
    localStorage.setItem('memorycare_caregiver_alerts', JSON.stringify(alerts.slice(0, 100)));
    
    // If Firebase is available, sync to cloud
    if (window.firebaseDB) {
        try {
            const refCode = localStorage.getItem('memorycare_refCode');
            if (refCode) {
                window.firebaseDB.ref(`alerts_${refCode}`).push(data);
                console.log('☁️ Alert synced to Firebase');
            }
        } catch (error) {
            console.error('❌ Firebase sync failed:', error);
        }
    }
}

// Set home location
function setHomeLocation(lat, lng) {
    monitorState.homeLocation = { lat, lng };
    localStorage.setItem('memorycare_home_location', JSON.stringify(monitorState.homeLocation));
    console.log('🏠 Home location saved:', monitorState.homeLocation);
}

// Manual trigger functions (for testing/manual activation)
window.triggerBathroomStart = bathroomStarted;
window.triggerBathroomEnd = bathroomEnded;
window.triggerRoomChange = triggerRoomChangeAlert;
window.setHomeLocation = setHomeLocation;

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM Ready - Starting trigger monitoring in 3 seconds...');
    
    // Wait a bit for page to fully load
    setTimeout(() => {
        initTriggerMonitoring();
    }, 3000);
});

console.log('✅ Trigger Monitor Ready');
