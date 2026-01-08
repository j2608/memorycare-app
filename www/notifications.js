/**
 * NOTIFICATION SYSTEM
 * Show alerts, person recognition, and other notifications
 */

console.log('🔔 Notification System Loading...');

// Show notification banner
function showNotification(message, icon = '✅', duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 18px;
        font-weight: bold;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    notification.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Show person information notification
function showPersonInfoNotification(person) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        z-index: 10001;
        text-align: center;
        min-width: 400px;
        animation: zoomIn 0.3s ease;
    `;
    
    const photoHTML = person.photo ? 
        `<img src="${person.photo}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; border: 5px solid #4CAF50;">` :
        `<div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 60px;">👤</div>`;
    
    notification.innerHTML = `
        ${photoHTML}
        <h2 style="margin: 15px 0; color: #333; font-size: 32px;">✅ Person Recognized!</h2>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; margin: 20px 0;">
            <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${person.name}</div>
            <div style="font-size: 24px; opacity: 0.9;">${person.relation}</div>
        </div>
        <div style="color: #666; font-size: 18px; line-height: 1.6;">
            ${person.notes ? `<p style="margin: 15px 0;"><strong>Notes:</strong> ${person.notes}</p>` : ''}
            ${person.frequency ? `<p style="margin: 15px 0;"><strong>Visits:</strong> ${person.frequency}</p>` : ''}
        </div>
        <div style="margin-top: 25px; color: #999; font-size: 16px;">
            🎬 Opening story mode in 3 seconds...
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Play sound
    if (typeof playAlertSound !== 'undefined') {
        playAlertSound();
    }
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'zoomOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes zoomIn {
        from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    @keyframes zoomOut {
        from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        to { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

console.log('✅ Notification system ready');
