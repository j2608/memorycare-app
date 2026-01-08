/**
 * CUSTOM ROOM MANAGEMENT
 * Add and save custom rooms like Balcony, Study Room, Garden, etc.
 */

console.log('🏠 Custom Rooms Module Loading...');

// Add a custom room
async function addCustomRoom() {
    const nameInput = document.getElementById('customRoomName');
    const iconInput = document.getElementById('customRoomIcon');
    const statusDiv = document.getElementById('customRoom-status');
    
    if (!nameInput || !iconInput) {
        console.error('Custom room inputs not found');
        return;
    }
    
    const roomName = nameInput.value.trim();
    const roomIcon = iconInput.value.trim() || '📍';
    
    if (!roomName) {
        if (statusDiv) {
            statusDiv.innerHTML = '❌ Please enter a room name';
            statusDiv.style.color = '#f44336';
        }
        return;
    }
    
    // Convert to lowercase key (e.g., "Balcony" -> "balcony")
    const roomKey = roomName.toLowerCase().replace(/\s+/g, '');
    
    console.log(`➕ Adding custom room: ${roomName} (${roomKey})`);
    
    if (statusDiv) {
        statusDiv.innerHTML = '⏳ Saving location...';
        statusDiv.style.color = '#FF9800';
    }
    
    try {
        // Get current location fingerprint
        const fingerprint = await getCurrentLocationFingerprint();
        
        // Load existing room zones
        const roomZones = JSON.parse(localStorage.getItem('memorycare_roomZones') || '{}');
        
        // Check if room already exists - if so, create numbered variant
        let finalRoomKey = roomKey;
        let counter = 1;
        
        while (roomZones[finalRoomKey]) {
            counter++;
            finalRoomKey = `${roomKey}${counter}`;
        }
        
        const displayName = counter > 1 ? `${roomName} ${counter}` : roomName;
        
        // Save custom room
        roomZones[finalRoomKey] = {
            fingerprint: fingerprint,
            timestamp: Date.now(),
            baseType: 'custom',
            customName: roomName,
            displayName: displayName,
            icon: roomIcon,
            isCustom: true
        };
        
        localStorage.setItem('memorycare_roomZones', JSON.stringify(roomZones));
        
        if (statusDiv) {
            statusDiv.innerHTML = `✅ ${displayName} saved successfully!`;
            statusDiv.style.color = '#4CAF50';
        }
        
        // Clear inputs
        nameInput.value = '';
        iconInput.value = '';
        
        // Speak confirmation
        if (typeof speak !== 'undefined') {
            speak(`${displayName} location saved successfully`);
        }
        
        // Update the saved rooms list
        updateSavedCustomRoomsList();
        
        console.log(`✅ Custom room ${finalRoomKey} saved:`, fingerprint);
        
        // Auto-clear status after 3 seconds
        setTimeout(() => {
            if (statusDiv) {
                statusDiv.innerHTML = '';
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error adding custom room:', error);
        
        let errorMsg = 'Error saving room location.';
        if (error.message && error.message.includes('Android Settings')) {
            errorMsg = error.message;
        } else if (error.code === 1) {
            errorMsg = 'Location permission denied. Enable in Android Settings > Apps > MemoryCare > Permissions';
        } else if (error.code === 2) {
            errorMsg = 'GPS unavailable. Please enable Location in Android settings.';
        } else if (error.code === 3) {
            errorMsg = 'Location timeout. Ensure GPS is enabled.';
        }
        
        if (statusDiv) {
            statusDiv.innerHTML = `❌ ${errorMsg}`;
            statusDiv.style.color = '#f44336';
        }
        
        alert(errorMsg);
    }
}

// Update the list of saved custom rooms
function updateSavedCustomRoomsList() {
    const listContainer = document.getElementById('savedCustomRoomsList');
    if (!listContainer) return;
    
    const roomZones = JSON.parse(localStorage.getItem('memorycare_roomZones') || '{}');
    
    // Filter custom rooms only
    const customRooms = Object.entries(roomZones).filter(([key, data]) => data.isCustom);
    
    if (customRooms.length === 0) {
        listContainer.innerHTML = '';
        return;
    }
    
    let html = '<div style="margin-top: 20px;"><h4>📋 Your Custom Rooms:</h4>';
    
    customRooms.forEach(([roomKey, roomData]) => {
        const icon = roomData.icon || '📍';
        const displayName = roomData.displayName || roomData.customName || roomKey;
        const savedTime = new Date(roomData.timestamp).toLocaleString();
        
        html += `
            <div style="background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%); padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 24px;">${icon}</div>
                    <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">${displayName}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 3px;">Saved: ${savedTime}</div>
                </div>
                <button onclick="deleteCustomRoom('${roomKey}')" class="btn" style="background: #f44336; color: white; padding: 8px 16px;">
                    🗑️ Delete
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    listContainer.innerHTML = html;
}

// Delete a custom room
function deleteCustomRoom(roomKey) {
    if (!confirm('Are you sure you want to delete this room location?')) {
        return;
    }
    
    const roomZones = JSON.parse(localStorage.getItem('memorycare_roomZones') || '{}');
    
    if (roomZones[roomKey]) {
        const roomName = roomZones[roomKey].displayName || roomKey;
        delete roomZones[roomKey];
        localStorage.setItem('memorycare_roomZones', JSON.stringify(roomZones));
        
        if (typeof speak !== 'undefined') {
            speak(`${roomName} deleted`);
        }
        
        console.log(`🗑️ Deleted custom room: ${roomKey}`);
        updateSavedCustomRoomsList();
    }
}

// Load and display custom rooms when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Update list if on Settings tab
    setTimeout(() => {
        updateSavedCustomRoomsList();
    }, 1000);
    
    console.log('✅ Custom rooms module ready');
});
