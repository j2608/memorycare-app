
// ============================================
// INDOOR ROOM LOCATIONS
// ============================================

async function saveCurrentRoomZone(roomName) {
    console.log(`📍 Saving room zone: ${roomName}`);
    
    const statusDiv = document.getElementById(`${roomName}-status`);
    
    if (statusDiv) {
        statusDiv.innerHTML = '⏳ Scanning location...';
    }
    
    try {
        // Check if running in Capacitor (Android app)
        const isCapacitor = typeof Capacitor !== 'undefined';
        
        // Request location permission explicitly for Android
        if (isCapacitor && Capacitor.Plugins && Capacitor.Plugins.Geolocation) {
            console.log('📱 Running on Android - requesting Android location permission...');
            
            try {
                const permission = await Capacitor.Plugins.Geolocation.checkPermissions();
                console.log('📍 Current permission:', permission);
                
                if (permission.location !== 'granted') {
                    console.log('📍 Requesting location permission...');
                    const requested = await Capacitor.Plugins.Geolocation.requestPermissions();
                    console.log('📍 Permission result:', requested);
                    
                    if (requested.location !== 'granted') {
                        throw new Error('Location permission denied in Android settings');
                    }
                }
            } catch (permError) {
                console.error('🚫 Permission error:', permError);
                throw new Error('Please enable Location permission in Android Settings > Apps > MemoryCare > Permissions');
            }
        }
        
        // Request location permission explicitly for web/browser
        if (!navigator.geolocation) {
            throw new Error('Geolocation not supported by this device');
        }
        
        // Get current location fingerprint with permission request
        const fingerprint = await getCurrentLocationFingerprint();
        
        // Load existing room zones
        const roomZones = JSON.parse(localStorage.getItem('memorycare_roomZones') || '{}');
        
        // Check if room already exists - if so, create numbered variant
        let finalRoomName = roomName;
        let counter = 1;
        
        // Support multiple rooms of same type (bathroom1, bathroom2, etc)
        while (roomZones[finalRoomName]) {
            counter++;
            finalRoomName = `${roomName}${counter}`;
        }
        
        // Save with potentially numbered name
        roomZones[finalRoomName] = {
            fingerprint: fingerprint,
            timestamp: Date.now(),
            baseType: roomName, // Store original type for behavior matching
            displayName: counter > 1 ? `${getRoomDisplayName(roomName)} ${counter}` : getRoomDisplayName(roomName)
        };
        
        localStorage.setItem('memorycare_roomZones', JSON.stringify(roomZones));
        
        if (statusDiv) {
            statusDiv.innerHTML = `✅ Saved as: ${roomZones[finalRoomName].displayName}!`;
        }
        
        const displayMsg = counter > 1 
            ? `${roomName} number ${counter} saved successfully` 
            : `${roomName} location saved successfully`;
        speak(displayMsg);
        
        console.log(`✅ Room ${finalRoomName} saved:`, fingerprint);        console.log(`📍 GPS Coordinates: Lat ${fingerprint.latitude.toFixed(6)}, Lng ${fingerprint.longitude.toFixed(6)}`);
        console.log(`✅ LOCATION IS WORKING! Accuracy: ${fingerprint.accuracy.toFixed(1)}m`);    } catch (error) {
        console.error('Error saving room zone:', error);
        
        let errorMsg = 'Error saving room location.';
        if (error.message && error.message.includes('Android Settings')) {
            errorMsg = error.message;
        } else if (error.code === 1) {
            errorMsg = 'Location permission denied. Go to Android Settings > Apps > MemoryCare > Permissions > Location > Allow';
        } else if (error.code === 2) {
            errorMsg = 'Location unavailable. Please ensure GPS is enabled in Android Quick Settings.';
        } else if (error.code === 3) {
            errorMsg = 'Location request timeout. Make sure GPS is enabled and you are not indoors with poor signal.';
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = `❌ ${errorMsg}`;
        }
        
        alert(errorMsg);
    }
}

// Get display name for room type
function getRoomDisplayName(roomType) {
    const names = {
        'bathroom': 'Bathroom',
        'kitchen': 'Kitchen',
        'bedroom': 'Bedroom',
        'livingroom': 'Living Room'
    };
    return names[roomType] || roomType;
}

async function getCurrentLocationFingerprint() {
    // Get current GPS location as fingerprint
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        console.log('📍 Requesting high-accuracy location...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ Location obtained:', position.coords);
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: Date.now()
                });
            },
            (error) => {
                console.error('❌ Location error:', error.code, error.message);
                
                // Add detailed error information
                const enhancedError = new Error(error.message);
                enhancedError.code = error.code;
                enhancedError.details = {
                    PERMISSION_DENIED: error.code === 1,
                    POSITION_UNAVAILABLE: error.code === 2,
                    TIMEOUT: error.code === 3
                };
                
                reject(enhancedError);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // Increased timeout
                maximumAge: 0 // Always get fresh location
            }
        );
    });
}
