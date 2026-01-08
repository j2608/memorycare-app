/**
 * ENHANCED Permissions Handler for MemoryCare App
 * Requests ALL permissions IMMEDIATELY on startup
 */

console.log('🚀 Enhanced Permissions Handler Loading...');

// Request permissions IMMEDIATELY
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📱 DOM Ready - Requesting ALL Permissions NOW!');
    await requestAllPermissions();
});

// Main permission request function
async function requestAllPermissions() {
    console.log('🔐 === REQUESTING ALL PERMISSIONS ===');
    
    try {
        // 1. LOCATION - Request first
        console.log('📍 1/4 Requesting LOCATION...');
        await requestLocationPermission();
        
        // 2. NOTIFICATION - Request second
        console.log('🔔 2/4 Requesting NOTIFICATION...');
        await requestNotificationPermission();
        
        // 3. CAMERA - Request third
        console.log('📷 3/4 Requesting CAMERA...');
        await requestCameraPermission();
        
        // 4. MICROPHONE - Request fourth
        console.log('🎤 4/4 Requesting MICROPHONE...');
        await requestMicrophonePermission();
        
        console.log('✅ ALL PERMISSIONS REQUESTED!');
        showSuccess('All Permissions Ready!');
        
    } catch (error) {
        console.error('❌ Permission Request Error:', error);
    }
}

// LOCATION Permission
async function requestLocationPermission() {
    try {
        if (navigator.geolocation) {
            await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('✅ LOCATION GRANTED');
                        showSuccess('Location Access Granted');
                        resolve(position);
                    },
                    (error) => {
                        console.warn('⚠️ LOCATION DENIED:', error);
                        showWarning('Location Access Needed');
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });
        }
    } catch (e) {
        console.error('Location error:', e);
    }
}

// NOTIFICATION Permission
async function requestNotificationPermission() {
    try {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                console.log('⏳ Asking for notification permission...');
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    console.log('✅ NOTIFICATION GRANTED');
                    showSuccess('Notifications Enabled');
                    
                    // Send test notification
                    setTimeout(() => {
                        new Notification('MemoryCare Active', {
                            body: 'You will receive important alerts',
                            icon: 'favicon.svg',
                            vibrate: [200, 100, 200]
                        });
                    }, 500);
                } else {
                    console.warn('⚠️ NOTIFICATION DENIED');
                    showWarning('Notifications Disabled');
                }
            } else if (Notification.permission === 'granted') {
                console.log('✅ NOTIFICATION ALREADY GRANTED');
            } else {
                console.warn('⚠️ NOTIFICATION PREVIOUSLY DENIED');
            }
        }
    } catch (e) {
        console.error('Notification error:', e);
    }
}

// CAMERA Permission
async function requestCameraPermission() {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('⏳ Asking for camera permission...');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: false
            });
            
            console.log('✅ CAMERA GRANTED');
            showSuccess('Camera Access Granted');
            
            // Stop the stream immediately (we just needed permission)
            stream.getTracks().forEach(track => track.stop());
            
        } else {
            console.warn('⚠️ Camera API not available');
        }
    } catch (e) {
        if (e.name === 'NotAllowedError') {
            console.warn('⚠️ CAMERA DENIED by user');
            showWarning('Camera Access Denied');
        } else {
            console.error('Camera error:', e);
        }
    }
}

// MICROPHONE Permission
async function requestMicrophonePermission() {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('⏳ Asking for microphone permission...');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true,
                video: false
            });
            
            console.log('✅ MICROPHONE GRANTED');
            showSuccess('Microphone Access Granted');
            
            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
            
        } else {
            console.warn('⚠️ Microphone API not available');
        }
    } catch (e) {
        if (e.name === 'NotAllowedError') {
            console.warn('⚠️ MICROPHONE DENIED by user');
            showWarning('Microphone Access Denied');
        } else {
            console.error('Microphone error:', e);
        }
    }
}

// Success notification
function showSuccess(message) {
    console.log('✅ SUCCESS:', message);
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        z-index: 999999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    notification.textContent = '✅ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Warning notification
function showWarning(message) {
    console.warn('⚠️ WARNING:', message);
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FF9800;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        z-index: 999999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    notification.textContent = '⚠️ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

console.log('✅ Enhanced Permissions Handler Ready');
