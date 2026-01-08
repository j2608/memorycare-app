/**
 * Background Service Handler for Android
 * Keeps app active in background for voice alerts and monitoring
 */

console.log('🔧 Background Service Handler Loading...');

// Check if running on Android
const isAndroid = /android/i.test(navigator.userAgent);
const isCapacitor = typeof Capacitor !== 'undefined';

// Background service state
const backgroundService = {
    isRunning: false,
    wakeLock: null,
    keepAliveInterval: null
};

// Initialize background service
async function initBackgroundService() {
    console.log('🔧 Initializing background service...');
    
    if (!isAndroid) {
        console.log('⚠️ Not on Android - background service not needed');
        return;
    }
    
    try {
        // Request wake lock to keep app active
        await requestWakeLock();
        
        // Start keep-alive timer
        startKeepAlive();
        
        // Enable background audio
        enableBackgroundAudio();
        
        backgroundService.isRunning = true;
        console.log('✅ Background service started');
        
        showBackgroundNotification('Background monitoring active');
        
    } catch (error) {
        console.error('❌ Background service failed:', error);
    }
}

// Request wake lock to prevent sleep
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            backgroundService.wakeLock = await navigator.wakeLock.request('screen');
            
            backgroundService.wakeLock.addEventListener('release', () => {
                console.log('⚠️ Wake lock released - re-requesting...');
                setTimeout(() => requestWakeLock(), 1000);
            });
            
            console.log('✅ Wake lock acquired');
        } else {
            console.warn('⚠️ Wake Lock API not available');
        }
    } catch (error) {
        console.error('❌ Wake lock error:', error);
    }
}

// Keep app alive with periodic heartbeat
function startKeepAlive() {
    console.log('💓 Starting keep-alive heartbeat...');
    
    // Send heartbeat every 30 seconds
    backgroundService.keepAliveInterval = setInterval(() => {
        console.log('💓 Heartbeat - app is alive');
        
        // Ensure speech synthesis is ready
        if (window.speechSynthesis) {
            window.speechSynthesis.resume();
        }
        
        // Re-request wake lock if needed
        if (!backgroundService.wakeLock || backgroundService.wakeLock.released) {
            requestWakeLock();
        }
        
    }, 30000);
}

// Enable background audio (speech synthesis)
function enableBackgroundAudio() {
    console.log('🔊 Enabling background audio...');
    
    try {
        // Create silent audio context to keep audio active
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create silent oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set volume to 0 (silent)
        gainNode.gain.value = 0;
        
        // Start silent audio
        oscillator.start();
        
        console.log('✅ Silent audio context active');
        
        // Resume speech synthesis
        if (window.speechSynthesis) {
            window.speechSynthesis.resume();
            console.log('✅ Speech synthesis resumed');
        }
        
    } catch (error) {
        console.error('❌ Background audio error:', error);
    }
}

// Show persistent notification (keeps app in foreground)
function showBackgroundNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification('MemoryCare Active', {
                body: message,
                icon: 'favicon.svg',
                badge: 'favicon.svg',
                tag: 'background-service',
                requireInteraction: false,
                silent: true
            });
            
            console.log('✅ Background notification shown');
        } catch (error) {
            console.error('❌ Notification error:', error);
        }
    }
}

// Stop background service
function stopBackgroundService() {
    console.log('🛑 Stopping background service...');
    
    // Release wake lock
    if (backgroundService.wakeLock) {
        backgroundService.wakeLock.release();
        backgroundService.wakeLock = null;
    }
    
    // Stop keep-alive
    if (backgroundService.keepAliveInterval) {
        clearInterval(backgroundService.keepAliveInterval);
        backgroundService.keepAliveInterval = null;
    }
    
    backgroundService.isRunning = false;
    console.log('✅ Background service stopped');
}

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 App moved to background');
        
        // Ensure speech synthesis stays active
        if (window.speechSynthesis) {
            window.speechSynthesis.resume();
        }
        
        // Show notification to keep app alive
        showBackgroundNotification('Monitoring continues in background');
        
    } else {
        console.log('📱 App returned to foreground');
    }
});

// Handle page unload (app closing)
window.addEventListener('beforeunload', () => {
    console.log('⚠️ App closing - maintaining background service');
    // Don't stop service - let it run
});

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM Ready - Starting background service in 2 seconds...');
    
    setTimeout(() => {
        initBackgroundService();
    }, 2000);
});

// Export functions
window.backgroundService = {
    init: initBackgroundService,
    stop: stopBackgroundService,
    isRunning: () => backgroundService.isRunning
};

console.log('✅ Background Service Handler Ready');
