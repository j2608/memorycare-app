
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
        // Get current location fingerprint
        const fingerprint = await getCurrentLocationFingerprint();
        
        // Save to localStorage (patient phone will read this)
        const roomZones = JSON.parse(localStorage.getItem('memorycare_roomZones') || '{}');
        roomZones[roomName] = {
            fingerprint: fingerprint,
            timestamp: Date.now()
        };
        localStorage.setItem('memorycare_roomZones', JSON.stringify(roomZones));
        
        if (statusDiv) {
            statusDiv.innerHTML = `✅ Saved! (${new Date().toLocaleTimeString()})`;
        }
        speak(`${roomName} location saved successfully`);
        
        console.log(`✅ Room ${roomName} saved:`, fingerprint);
    } catch (error) {
        console.error('Error saving room zone:', error);
        if (statusDiv) {
            statusDiv.innerHTML = '❌ Error - please try again';
        }
        alert('Error saving room location. Please ensure location is enabled.');
    }
}

async function getCurrentLocationFingerprint() {
    // Get current GPS location as fingerprint
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now()
                });
            },
            (error) => {
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
