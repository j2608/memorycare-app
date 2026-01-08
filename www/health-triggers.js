/**
 * Health & Safety Trigger System for Alzheimer's Care
 * Integrates with Google Fit for health data monitoring
 * DO NOT MODIFY EXISTING WEBSITE FILES - This is a separate module
 */

// Trigger configuration
const TRIGGERS = {
    // LOCATION & NAVIGATION (1-4)
    LEAVING_HOME: {
        id: 1,
        name: 'Patient Leaving Home',
        condition: 'geofence_exit',
        patientNotif: 'You are going out. Where are you going?',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    UNKNOWN_DESTINATION: {
        id: 2,
        name: 'Unknown Destination',
        condition: 'no_response_2min',
        patientNotif: "It's okay. Let's go back home together.",
        caregiverNotif: '📍 Patient location shared',
        voice: true,
        priority: 'high',
        showMap: true
    },
    OUTSIDE_TOO_LONG: {
        id: 3,
        name: 'Outside Too Long',
        condition: 'outside_30min',
        patientNotif: "You've been outside for a while. Let's return home.",
        caregiverNotif: '🚨 Patient outside too long',
        voice: true,
        priority: 'high'
    },
    LOST_CONFUSED: {
        id: 4,
        name: 'Lost / Confused Outside',
        condition: 'random_walking',
        patientNotif: 'Follow the arrow to go home.',
        caregiverNotif: '🚨 Patient may be confused + live location',
        voice: true,
        priority: 'critical',
        showMap: true
    },
    
    // BATHROOM & ROOM CONFUSION (5-8)
    BATHROOM_STARTED: {
        id: 5,
        name: 'Bathroom Started',
        condition: 'bathroom_detected',
        patientNotif: 'Okay, take your time.',
        caregiverNotif: null,
        voice: true,
        priority: 'low'
    },
    BATHROOM_TOO_LONG: {
        id: 6,
        name: 'Bathroom Too Long',
        condition: 'bathroom_15min',
        patientNotif: 'Are you okay? What are you doing now?',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    BATHROOM_CONFUSION: {
        id: 7,
        name: 'Bathroom Confusion',
        condition: 'no_response',
        patientNotif: 'You were using the bathroom. You can finish and return.',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    BATHROOM_RISK: {
        id: 8,
        name: 'Bathroom Risk',
        condition: 'bathroom_30min',
        patientNotif: null,
        caregiverNotif: '🚨 Patient in bathroom too long',
        voice: false,
        priority: 'critical'
    },
    
    // ROOM CHANGE & MEMORY LOSS (9-12)
    ENTERED_NEW_ROOM: {
        id: 9,
        name: 'Entered New Room',
        condition: 'room_change',
        patientNotif: 'What are you doing here?',
        caregiverNotif: null,
        voice: true,
        priority: 'low'
    },
    TASK_REMEMBERED: {
        id: 10,
        name: 'Task Remembered',
        condition: 'patient_answered',
        patientNotif: "Okay, I'll remind you if needed.",
        caregiverNotif: null,
        voice: true,
        priority: 'low'
    },
    FORGOT_TASK: {
        id: 11,
        name: 'Forgot Task',
        condition: 'same_room_10min',
        patientNotif: 'You came here to drink water.',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    REPEATED_CONFUSION: {
        id: 12,
        name: 'Repeated Confusion',
        condition: 'confusion_3times',
        patientNotif: null,
        caregiverNotif: '⚠️ Repeated confusion today',
        voice: false,
        priority: 'high'
    },
    
    // MEDICATION (13-15)
    MEDICATION_REMINDER: {
        id: 13,
        name: 'Medication Reminder',
        condition: 'scheduled_time',
        patientNotif: "It's time to take your medicine.",
        caregiverNotif: null,
        voice: true,
        priority: 'high'
    },
    MEDICATION_MISSED: {
        id: 14,
        name: 'Medication Missed',
        condition: 'not_taken_15min',
        patientNotif: 'Please take your medicine now.',
        caregiverNotif: null,
        voice: true,
        priority: 'high'
    },
    MEDICATION_SKIPPED: {
        id: 15,
        name: 'Medication Skipped',
        condition: 'missed_twice',
        patientNotif: null,
        caregiverNotif: '🚨 Patient missed medication',
        voice: false,
        priority: 'critical'
    },
    
    // DAILY ROUTINE (16-19)
    MORNING_ROUTINE: {
        id: 16,
        name: 'Morning Routine',
        condition: 'morning_time',
        patientNotif: "Good morning! Let's start your day.",
        caregiverNotif: null,
        voice: true,
        priority: 'low'
    },
    MEAL_REMINDER: {
        id: 17,
        name: 'Meal Reminder',
        condition: 'meal_time',
        patientNotif: "It's time to eat your meal.",
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    ROUTINE_MISSED: {
        id: 18,
        name: 'Routine Missed',
        condition: 'no_routine_activity',
        patientNotif: 'You planned to do this now.',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    ROUTINE_SKIPPED_REPEATEDLY: {
        id: 19,
        name: 'Routine Skipped Repeatedly',
        condition: 'routine_missed_daily',
        patientNotif: null,
        caregiverNotif: '⚠️ Routine not followed',
        voice: false,
        priority: 'high'
    },
    
    // WATCH & PHONE CHARGING (20-23)
    WATCH_BATTERY_LOW: {
        id: 20,
        name: 'Watch Battery Low',
        condition: 'watch_battery_20',
        patientNotif: 'Please charge your watch.',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    WATCH_NOT_CHARGING: {
        id: 21,
        name: 'Watch Not Charging',
        condition: 'battery_low_no_charging',
        patientNotif: 'Your watch needs charging now.',
        caregiverNotif: '🚨 Watch not charged',
        voice: true,
        priority: 'high'
    },
    PHONE_BATTERY_LOW: {
        id: 22,
        name: 'Phone Battery Low',
        condition: 'phone_battery_15',
        patientNotif: 'Please charge your phone.',
        caregiverNotif: null,
        voice: true,
        priority: 'high'
    },
    DEVICE_OFF_RISK: {
        id: 23,
        name: 'Device Off Risk',
        condition: 'phone_off',
        patientNotif: null,
        caregiverNotif: '🚨 Device unreachable',
        voice: false,
        priority: 'critical'
    },
    
    // INACTIVITY & FALL RISK (24-25)
    LONG_INACTIVITY: {
        id: 24,
        name: 'Long Inactivity',
        condition: 'no_steps_4hrs',
        patientNotif: 'Are you okay? Try moving a little.',
        caregiverNotif: null,
        voice: true,
        priority: 'medium'
    },
    NO_RESPONSE_AFTER_INACTIVITY: {
        id: 25,
        name: 'No Response After Inactivity',
        condition: 'inactivity_no_response',
        patientNotif: null,
        caregiverNotif: '🚨 Please check patient',
        voice: false,
        priority: 'critical'
    },
    
    // SYSTEM & PERMISSIONS (26-27)
    LOCATION_DISABLED: {
        id: 26,
        name: 'Location Disabled',
        condition: 'gps_off',
        patientNotif: 'Location is off. Please enable it.',
        caregiverNotif: '🚨 Location disabled',
        voice: true,
        priority: 'critical'
    },
    HEALTH_DATA_NOT_SYNCING: {
        id: 27,
        name: 'Health Data Not Syncing',
        condition: 'no_data_24hrs',
        patientNotif: null,
        caregiverNotif: '⚠️ Health data not syncing',
        voice: false,
        priority: 'high'
    }
};

// State tracking
let triggerState = {
    lastLocation: null,
    homeGeofence: null,
    leftHomeAt: null,
    bathroomEnteredAt: null,
    currentRoom: null,
    roomEnteredAt: null,
    lastTask: null,
    confusionCount: 0,
    medicationSchedule: [],
    lastActivityTime: Date.now(),
    healthDataLastSync: Date.now()
};

// Initialize trigger system
function initTriggerSystem() {
    console.log('🚀 Initializing Health & Safety Trigger System');
    console.log('Total triggers configured:', Object.keys(TRIGGERS).length);
    
    // Start monitoring loops
    startLocationMonitoring();
    startActivityMonitoring();
    startBatteryMonitoring();
    startHealthDataMonitoring();
    startRoutineMonitoring();
    
    // Request permissions
    requestPermissions();
}

// Request necessary permissions
async function requestPermissions() {
    console.log('📱 Requesting permissions...');
    
    // Location permission
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ Location permission granted');
                triggerState.lastLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            },
            (error) => {
                console.error('❌ Location permission denied:', error);
                fireTrigger(TRIGGERS.LOCATION_DISABLED);
            }
        );
    }
    
    // Notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
    }
}

// Fire a trigger
function fireTrigger(trigger, context = {}) {
    console.log(`🔔 Trigger fired: ${trigger.name} (ID: ${trigger.id})`);
    
    // Show patient notification
    if (trigger.patientNotif) {
        showNotification('MemoryCare Assistant', trigger.patientNotif, trigger.priority);
        
        // Speak notification
        if (trigger.voice) {
            speakText(trigger.patientNotif);
        }
    }
    
    // Send caregiver notification
    if (trigger.caregiverNotif) {
        sendCaregiverAlert(trigger, context);
    }
    
    // Show map if needed
    if (trigger.showMap && triggerState.lastLocation) {
        showMapToHome();
    }
    
    // Log trigger event
    logTriggerEvent(trigger, context);
}

// Show notification
function showNotification(title, message, priority = 'medium') {
    console.log(`📢 Notification: ${title} - ${message}`);
    
    if ('Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
            body: message,
            icon: '/icon.png',
            badge: '/badge.png',
            tag: 'memorycare-' + Date.now(),
            requireInteraction: priority === 'critical',
            vibrate: priority === 'critical' ? [200, 100, 200] : [100]
        });
        
        notif.onclick = () => {
            window.focus();
            notif.close();
        };
    } else {
        // Fallback to alert
        alert(`${title}\n\n${message}`);
    }
}

// Speak text using Web Speech API
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Send caregiver alert
function sendCaregiverAlert(trigger, context) {
    console.log(`📤 Sending caregiver alert: ${trigger.caregiverNotif}`);
    
    const alert = {
        triggerId: trigger.id,
        triggerName: trigger.name,
        message: trigger.caregiverNotif,
        timestamp: new Date().toISOString(),
        priority: trigger.priority,
        patientLocation: triggerState.lastLocation,
        context: context
    };
    
    // Store in localStorage for caregiver to retrieve
    const alerts = JSON.parse(localStorage.getItem('caregiver_alerts') || '[]');
    alerts.unshift(alert);
    localStorage.setItem('caregiver_alerts', JSON.stringify(alerts.slice(0, 100)));
    
    // TODO: Send to backend/Firebase when available
}

// Location monitoring
function startLocationMonitoring() {
    if (!navigator.geolocation) return;
    
    setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: Date.now()
            };
            
            checkLocationTriggers(newLocation);
            triggerState.lastLocation = newLocation;
        });
    }, 30000); // Check every 30 seconds
}

// Check location-based triggers
function checkLocationTriggers(location) {
    // Check if left home geofence
    if (triggerState.homeGeofence) {
        const distance = calculateDistance(location, triggerState.homeGeofence);
        
        if (distance > 100 && !triggerState.leftHomeAt) {
            // Just left home
            triggerState.leftHomeAt = Date.now();
            fireTrigger(TRIGGERS.LEAVING_HOME);
        } else if (distance > 100 && triggerState.leftHomeAt) {
            // Still outside, check duration
            const outsideDuration = Date.now() - triggerState.leftHomeAt;
            
            if (outsideDuration > 30 * 60 * 1000) {
                fireTrigger(TRIGGERS.OUTSIDE_TOO_LONG, { duration: outsideDuration });
            }
        } else if (distance <= 100 && triggerState.leftHomeAt) {
            // Returned home
            triggerState.leftHomeAt = null;
        }
    }
}

// Activity monitoring (Google Fit integration)
function startActivityMonitoring() {
    setInterval(() => {
        checkInactivity();
    }, 60000); // Check every minute
}

function checkInactivity() {
    const inactiveDuration = Date.now() - triggerState.lastActivityTime;
    
    if (inactiveDuration > 4 * 60 * 60 * 1000) {
        fireTrigger(TRIGGERS.LONG_INACTIVITY, { duration: inactiveDuration });
    }
}

// Battery monitoring
function startBatteryMonitoring() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then((battery) => {
            battery.addEventListener('levelchange', () => {
                checkBatteryLevel(battery.level * 100);
            });
            
            checkBatteryLevel(battery.level * 100);
        });
    }
}

function checkBatteryLevel(level) {
    if (level < 15) {
        fireTrigger(TRIGGERS.PHONE_BATTERY_LOW, { level });
    }
}

// Health data monitoring
function startHealthDataMonitoring() {
    setInterval(() => {
        const timeSinceSync = Date.now() - triggerState.healthDataLastSync;
        
        if (timeSinceSync > 24 * 60 * 60 * 1000) {
            fireTrigger(TRIGGERS.HEALTH_DATA_NOT_SYNCING, { duration: timeSinceSync });
        }
    }, 60 * 60 * 1000); // Check every hour
}

// Routine monitoring
function startRoutineMonitoring() {
    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();
        
        // Morning routine (8 AM)
        if (hour === 8 && now.getMinutes() === 0) {
            fireTrigger(TRIGGERS.MORNING_ROUTINE);
        }
        
        // Meal reminders
        if ((hour === 8 || hour === 13 || hour === 19) && now.getMinutes() === 0) {
            fireTrigger(TRIGGERS.MEAL_REMINDER);
        }
        
        // Medication reminders
        checkMedicationSchedule();
    }, 60000); // Check every minute
}

function checkMedicationSchedule() {
    const now = new Date();
    triggerState.medicationSchedule.forEach(med => {
        if (med.hour === now.getHours() && med.minute === now.getMinutes() && !med.taken) {
            fireTrigger(TRIGGERS.MEDICATION_REMINDER, { medication: med });
        }
    });
}

// Utility: Calculate distance between two coordinates
function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = loc1.lat * Math.PI / 180;
    const φ2 = loc2.lat * Math.PI / 180;
    const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
    const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

// Show map to home
function showMapToHome() {
    // This will be implemented with map UI
    console.log('🗺️ Showing map to home');
}

// Log trigger event
function logTriggerEvent(trigger, context) {
    const events = JSON.parse(localStorage.getItem('trigger_events') || '[]');
    events.unshift({
        triggerId: trigger.id,
        triggerName: trigger.name,
        timestamp: new Date().toISOString(),
        context: context
    });
    localStorage.setItem('trigger_events', JSON.stringify(events.slice(0, 1000)));
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTriggerSystem, fireTrigger, TRIGGERS };
}

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initTriggerSystem);
}
