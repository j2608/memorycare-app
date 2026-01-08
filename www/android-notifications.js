/**
 * ANDROID PUSH NOTIFICATIONS
 * WhatsApp-style system notifications using Capacitor Local Notifications
 */

console.log('🔔 Android Notifications System Loading...');

// Initialize notification system
async function initAndroidNotifications() {
    console.log('📱 Initializing Android notifications...');
    
    // Check if running in Capacitor (Android app)
    if (typeof Capacitor === 'undefined' || !Capacitor.Plugins.LocalNotifications) {
        console.warn('⚠️ Local Notifications not available - using fallback');
        return false;
    }
    
    try {
        // Request notification permission
        const permission = await Capacitor.Plugins.LocalNotifications.requestPermissions();
        
        if (permission.display === 'granted') {
            console.log('✅ Notification permission granted');
            return true;
        } else {
            console.warn('⚠️ Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        return false;
    }
}

// Show Android system notification (WhatsApp style)
async function showAndroidNotification(title, body, options = {}) {
    console.log(`🔔 Showing Android notification: ${title}`);
    
    // Check if Capacitor is available
    if (typeof Capacitor === 'undefined' || !Capacitor.Plugins.LocalNotifications) {
        console.warn('⚠️ Falling back to in-app notification');
        // Use in-app notification as fallback
        if (typeof showNotification !== 'undefined') {
            showNotification(body, options.icon || '🔔');
        }
        return;
    }
    
    try {
        const notifications = [{
            id: options.id || Date.now(),
            title: title,
            body: body,
            sound: options.sound !== false ? 'default' : null,
            smallIcon: 'ic_stat_name',
            largeIcon: options.largeIcon || null,
            iconColor: options.iconColor || '#4A90E2',
            attachments: options.attachments || null,
            actionTypeId: options.actionTypeId || '',
            extra: options.extra || null,
            schedule: options.schedule || null,
            ongoing: options.ongoing || false,
            autoCancel: options.autoCancel !== false,
            group: options.group || 'memorycare',
            groupSummary: options.groupSummary || false
        }];
        
        await Capacitor.Plugins.LocalNotifications.schedule({
            notifications: notifications
        });
        
        console.log('✅ Android notification sent');
    } catch (error) {
        console.error('❌ Error showing Android notification:', error);
        // Fallback to in-app notification
        if (typeof showNotification !== 'undefined') {
            showNotification(body, options.icon || '🔔');
        }
    }
}

// Show person recognized notification (WhatsApp style)
async function showPersonRecognizedNotification(person) {
    await showAndroidNotification(
        '✅ Person Recognized',
        `${person.name} - ${person.relation}`,
        {
            id: 1001,
            iconColor: '#4CAF50',
            sound: true,
            ongoing: false,
            extra: { type: 'person_recognized', personId: person.id }
        }
    );
}

// Show medicine reminder notification (WhatsApp style)
async function showMedicineNotification(medicine) {
    await showAndroidNotification(
        '💊 Medicine Time!',
        `${medicine.name} - ${medicine.dosage}`,
        {
            id: 2001,
            iconColor: '#f5576c',
            sound: true,
            ongoing: true, // Stay until dismissed
            extra: { type: 'medicine', medicineId: medicine.id }
        }
    );
}

// Show routine reminder notification (WhatsApp style)
async function showRoutineNotification(routine) {
    await showAndroidNotification(
        '📅 Routine Reminder',
        `${routine.time} - ${routine.activity}`,
        {
            id: 3001,
            iconColor: '#FF9800',
            sound: true,
            extra: { type: 'routine', routineId: routine.id }
        }
    );
}

// Show room entry notification (WhatsApp style)
async function showRoomEntryNotification(roomName, icon) {
    await showAndroidNotification(
        `${icon} Entered ${roomName}`,
        `You are now in the ${roomName}`,
        {
            id: 4000 + Math.floor(Math.random() * 100),
            iconColor: '#667eea',
            sound: false, // No sound for room changes
            autoCancel: true
        }
    );
}

// Show confusion detected notification (WhatsApp style)
async function showConfusionNotification(roomName, message) {
    await showAndroidNotification(
        '🤔 Need Help?',
        message,
        {
            id: 5001,
            iconColor: '#FFA726',
            sound: true,
            ongoing: false,
            extra: { type: 'confusion', room: roomName }
        }
    );
}

// Show SOS alert notification (WhatsApp style)
async function showSOSNotification() {
    await showAndroidNotification(
        '🆘 EMERGENCY ALERT',
        'Emergency help has been requested!',
        {
            id: 9001,
            iconColor: '#f44336',
            sound: true,
            ongoing: true, // Critical - stay visible
            extra: { type: 'sos' }
        }
    );
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    const notificationReady = await initAndroidNotifications();
    if (notificationReady) {
        console.log('✅ Android notifications ready');
    }
});

console.log('✅ Android Notifications module loaded');
