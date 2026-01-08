// ============================================
// CAREGIVER DASHBOARD - LOCAL VERSION
// Complete management system for patient care
// NO BACKEND REQUIRED - Works 100% Locally
// ============================================

console.log('🚀 CAREGIVER.JS LOCAL VERSION LOADING...');

let appData = {};
let currentRefCode = localStorage.getItem('currentRefCode') || null;

// Speech Synthesis for caregiver
const synth = window.speechSynthesis;

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    synth.speak(utterance);
}

// Generate random reference code
function generateRefCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Save data to localStorage
async function saveDataToLocal() {
    const key = `memorycare_${currentRefCode}`;
    const data = JSON.stringify(appData);
    
    console.log('💾 Saving data for:', currentRefCode);
    console.log('📊 Data size:', (data.length / 1024).toFixed(2), 'KB');
    console.log('📋 Routines:', appData.dailyRoutine?.length || 0);
    console.log('👥 Known people:', appData.knownPeople?.length || 0);
    console.log('💊 Medicines:', appData.medicines?.length || 0);
    
    localStorage.setItem(key, data);
    console.log('✅ Data saved to localStorage');
    
    // Also sync to Firebase for cross-browser access
    if (typeof syncToFirebase !== 'undefined') {
        console.log('☁️ Syncing to Firebase...');
        const success = await syncToFirebase(key, data);
        if (success) {
            console.log('✅ Cloud sync complete!');
        } else {
            console.warn('⚠️ Cloud sync failed - data saved locally only');
        }
    } else {
        console.warn('⚠️ Firebase sync not available');
    }
}

// Load data from localStorage
function loadDataFromLocal() {
    const saved = localStorage.getItem(`memorycare_${currentRefCode}`);
    if (saved) {
        appData = JSON.parse(saved);
        console.log('✅ Data loaded from localStorage');
    } else {
        appData = {
            referenceCode: currentRefCode,
            patientProfile: null,
            dailyRoutine: [],
            knownPeople: [],
            knownPlaces: [],
            medicines: [],
            appointments: [],
            emergencyContacts: [],
            sosAlerts: [],
            lostAlerts: [],
            missedMedicines: [],
            securityAlerts: [],
            watchChargingTime: null,
            homeLocation: null
        };
        saveDataToLocal();
    }
}

// Make sure modal is hidden initially
window.addEventListener('load', () => {
    const modal = document.getElementById('setupModal');
    if (modal && currentRefCode) {
        modal.style.display = 'none';
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== STARTING LOCAL DASHBOARD ===');
    
    // 1. Time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
    
    // 2. Setup tabs - MOBILE OPTIMIZED VERSION
    console.log('Setting up tabs...');
    const allTabButtons = document.querySelectorAll('.tab-btn');
    console.log('Found tab buttons:', allTabButtons.length);
    
    allTabButtons.forEach((button, index) => {
        console.log(`Tab ${index}:`, button.textContent.trim(), button.getAttribute('data-tab'));
        
        // Remove any existing listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Requery after cloning
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((button, index) => {
        // Use both click and touchend for better mobile support
        const handleTabClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.getAttribute('data-tab');
            console.log('🔥 TAB CLICKED:', tabName);
            
            // Remove active from all tabs and panels
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.backgroundColor = '';
                b.style.color = '';
            });
            
            document.querySelectorAll('.tab-panel').forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });
            
            // Activate clicked tab
            this.classList.add('active');
            this.style.backgroundColor = 'var(--primary)';
            this.style.color = 'white';
            
            const panel = document.getElementById(tabName + 'Tab');
            if (panel) {
                panel.classList.add('active');
                panel.style.display = 'block';
                console.log('✅ SHOWING TAB:', tabName);
                
                // Initialize maps when needed
                if (tabName === 'places') {
                    setTimeout(() => {
                        console.log('Initializing places map...');
                        if (typeof initMap === 'function') initMap();
                    }, 100);
                }
                if (tabName === 'settings') {
                    setTimeout(() => {
                        console.log('Initializing home map...');
                        if (typeof initHomeMap === 'function') initHomeMap();
                    }, 100);
                }
            } else {
                console.error('❌ Panel not found:', tabName + 'Tab');
            }
        };
        
        // Add both click and touchstart listeners for mobile
        button.addEventListener('click', handleTabClick, { passive: false });
        button.addEventListener('touchend', handleTabClick, { passive: false });
        
        // Visual feedback on touch
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
    
    // Activate first tab by default
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        setTimeout(() => {
            firstTab.click();
            console.log('✅ First tab activated');
        }, 500);
    }
    
    console.log('✅ TABS READY WITH MOBILE SUPPORT!');
    
    // 3. Other event listeners
    setTimeout(setupEventListeners, 300);
    
    // 4. Check for existing session
    currentRefCode = localStorage.getItem('currentRefCode');
    console.log('Reference code:', currentRefCode);
    
    if (!currentRefCode) {
        setTimeout(showSetupModal, 500);
    } else {
        document.getElementById('currentRefCode').textContent = currentRefCode;
        const modal = document.getElementById('setupModal');
        if (modal) modal.style.display = 'none';
        loadDataFromLocal();
        loadAllData();
        checkForAlerts();
        setInterval(checkForAlerts, 30000);
    }
    
    console.log('=== READY - LOCAL VERSION ===');
});

// Show setup modal
function showSetupModal() {
    console.log('Showing setup modal...');
    const modal = document.getElementById('setupModal');
    if (!modal) {
        console.error('❌ Setup modal not found in DOM!');
        return;
    }
    
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '9999';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    const createBtn = document.getElementById('createNewSessionBtn');
    const loginBtn = document.getElementById('loginBtn');
    const refCodeInput = document.getElementById('refCodeInput');
    
    if (createBtn) {
        createBtn.onclick = createNewSession;
        console.log('✅ Create button attached');
    }
    
    if (loginBtn) {
        loginBtn.onclick = loginWithCode;
        console.log('✅ Login button attached');
    }
    
    if (refCodeInput) {
        refCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginWithCode();
        });
        // Auto-focus on input
        setTimeout(() => refCodeInput.focus(), 100);
        console.log('✅ Input field ready');
    }
}

// Create new patient session (LOCAL) - FIXED FOR MOBILE
function createNewSession() {
    console.log('Creating new local session...');
    const messageDiv = document.getElementById('setupMessage');
    
    try {
        currentRefCode = generateRefCode();
        localStorage.setItem('memorycare_refCode', currentRefCode);
        localStorage.setItem('currentRefCode', currentRefCode);
        
        // Initialize new data structure
        appData = {
            referenceCode: currentRefCode,
            patientProfile: null,
            dailyRoutine: [],
            knownPeople: [],
            knownPlaces: [],
            medicines: [],
            appointments: [],
            emergencyContacts: [],
            sosAlerts: [],
            lostAlerts: [],
            missedMedicines: [],
            securityAlerts: [],
            watchChargingTime: null,
            homeLocation: null
        };
        
        saveDataToLocal();
        console.log('✅ Local session created:', currentRefCode);
        
        // Update header IMMEDIATELY
        const headerCode = document.getElementById('currentRefCode');
        if (headerCode) {
            headerCode.textContent = currentRefCode;
        }
        
        // Voice announcement
        speak(`Session created. Your reference code is ${currentRefCode.split('').join(' ')}`);
        
        // Show success message
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #4CAF50; color: white; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold;">
                    ✅ Session Created!<br>
                    Reference Code: ${currentRefCode}<br>
                    <small style="font-size: 14px;">Redirecting to dashboard...</small>
                </div>
            `;
        }
        
        // Close modal and initialize dashboard - IMMEDIATE
        const modal = document.getElementById('setupModal');
        if (modal) {
            modal.style.display = 'none !important';
            modal.style.visibility = 'hidden';
            modal.remove();  // Completely remove modal
        }
        
        // Load all data and initialize dashboard IMMEDIATELY
        loadDataFromLocal();
        loadAllData();
        
        // Start alert checking
        checkForAlerts();
        setInterval(checkForAlerts, 30000);
        
        // Activate first tab IMMEDIATELY
        setTimeout(() => {
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab) {
                firstTab.click();
            }
        }, 100);
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Error creating session:', error);
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                    ❌ Error: ${error.message}
                </div>
            `;
        }
    }
}

// Login with existing reference code (LOCAL)
function loginWithCode() {
    const codeInput = document.getElementById('refCodeInput');
    const messageDiv = document.getElementById('setupMessage');
    
    if (!codeInput) {
        console.error('Reference code input not found');
        return;
    }
    
    const code = codeInput.value.trim().toUpperCase();
    
    if (code.length !== 6) {
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #ff9800; color: white; padding: 10px; border-radius: 5px;">
                    Please enter a valid 6-character code
                </div>
            `;
        }
        speak('Please enter a valid code');
        return;
    }
    
    // Check if session exists in localStorage
    const sessionData = localStorage.getItem(`memorycare_${code}`);
    
    if (sessionData) {
        currentRefCode = code;
        localStorage.setItem('memorycare_refCode', currentRefCode);
        localStorage.setItem('currentRefCode', currentRefCode); // Backwards compatibility
        
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
                    ✓ Access granted!
                </div>
            `;
        }
        speak('Access granted');
        
        // Close modal IMMEDIATELY
        const modal = document.getElementById('setupModal');
        if (modal) {
            modal.style.display = 'none !important';
            modal.style.visibility = 'hidden';
            modal.remove();
        }
        const codeDisplay = document.getElementById('currentRefCode');
        if (codeDisplay) codeDisplay.textContent = currentRefCode;
        
        // Load data IMMEDIATELY
        loadDataFromLocal();
        loadAllData();
        checkForAlerts();
        
        // Start monitoring for new patient help alerts every 10 seconds
        setInterval(() => {
            checkForAlerts();
        }, 10000);
        
        // Activate first tab
        setTimeout(() => {
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab) {
                firstTab.click();
            }
        }, 100);
        
        console.log('✅ Dashboard ready!');
        console.log('⏰ Auto-checking for patient alerts every 10 seconds...');
    } else {
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                    Invalid reference code. Session not found.
                </div>
            `;
        }
        speak('Invalid code');
    }
}

// Load all data
function loadAllData() {
    loadProfile();
    loadRoutine();
    loadPeople();
    loadPlaces();
    loadMedicines();
    loadAppointments();
    loadContacts();
    loadSettings();
    loadRecentAlerts();
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab navigation with voice
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log(`Found ${tabButtons.length} tab buttons`);
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            const tabName = btn.textContent.trim();
            console.log(`Tab clicked: ${tab}`);
            speak(`Opening ${tabName.replace(/[^\w\s]/gi, '')}`);
        });
    });
    
    // Photo upload preview
    const personPhotoFile = document.getElementById('personPhotoFile');
    const contactPhotoFile = document.getElementById('contactPhotoFile');
    
    if (personPhotoFile) personPhotoFile.addEventListener('change', handlePhotoUpload);
    if (contactPhotoFile) contactPhotoFile.addEventListener('change', handleContactPhotoUpload);
    
    // Form submissions with voice confirmation
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        speak('Saving profile');
        saveProfile(e);
    });
    
    document.getElementById('routineForm').addEventListener('submit', (e) => {
        speak('Adding routine');
        addRoutine(e);
    });
    
    document.getElementById('peopleForm').addEventListener('submit', (e) => {
        speak('Adding person');
        addPerson(e);
    });
    
    document.getElementById('placesForm').addEventListener('submit', (e) => {
        speak('Adding place');
        addPlace(e);
    });
    
    document.getElementById('medicineForm').addEventListener('submit', (e) => {
        speak('Adding medicine');
        addMedicine(e);
    });
    
    document.getElementById('appointmentForm').addEventListener('submit', (e) => {
        speak('Adding appointment');
        addAppointment(e);
    });
    
    document.getElementById('contactsForm').addEventListener('submit', (e) => {
        speak('Adding contact');
        addContact(e);
    });
    
    document.getElementById('saveChargingBtn').addEventListener('click', () => {
        speak('Saving charging time');
        saveChargingTime();
    });
    
    // Google Fit toggle event listener
    const googleFitToggle = document.getElementById('googleFitToggle');
    if (googleFitToggle) {
        // Load saved state
        const googleFitEnabled = localStorage.getItem('googleFitEnabled') === 'true';
        googleFitToggle.checked = googleFitEnabled;
        
        // If enabled, initialize Google Fit
        if (googleFitEnabled) {
            initializeGoogleFitData();
        }
        
        // Handle toggle changes
        googleFitToggle.addEventListener('change', async (e) => {
            const isEnabled = e.target.checked;
            localStorage.setItem('googleFitEnabled', isEnabled);
            
            if (isEnabled) {
                speak('Enabling Google Fit integration');
                try {
                    await initGoogleFit();
                    await initializeGoogleFitData();
                    showNotification('Google Fit enabled successfully!', 'success');
                } catch (error) {
                    console.error('Google Fit initialization error:', error);
                    showNotification('Failed to enable Google Fit: ' + error.message, 'error');
                    googleFitToggle.checked = false;
                    localStorage.setItem('googleFitEnabled', 'false');
                }
            } else {
                speak('Disabling Google Fit integration');
                stopGoogleFitUpdates();
                clearHealthDataDisplay();
                showNotification('Google Fit disabled', 'info');
            }
        });
    }
    
    // Timeline events for memory moments
    setupTimelineEvents();
    
    console.log('✅ All event listeners attached');
}

// Handle photo upload and preview
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `
                <img src="${event.target.result}" alt="Preview" style="width: 150px; height: 150px; object-fit: cover; border-radius: 15px; border: 3px solid var(--primary);">
            `;
            preview.dataset.photoData = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function handleContactPhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('contactPhotoPreview');
            preview.innerHTML = `
                <img src="${event.target.result}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%; border: 3px solid var(--primary);">
            `;
            preview.dataset.photoData = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Map Initialization
let map;
let marker;

function initMap() {
    if (map) {
        map.invalidateSize();
        return;
    }

    const defaultLat = 17.3850;
    const defaultLng = 78.4867;

    map = L.map('mapPicker').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
        });
    }

    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }

        document.getElementById('placeLat').value = lat;
        document.getElementById('placeLng').value = lng;
        document.getElementById('placeAddress').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    });
}

// Time display
function updateTimeDisplay() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    
    document.getElementById('currentTime').textContent = `${dateStr} ${timeStr}`;
}

// Alert checking with voice notifications
function checkForAlerts() {
    // Reload data from localStorage to get latest alerts
    loadDataFromLocal();
    
    const alertsSection = document.getElementById('alertsSection');
    let alerts = [];
    let hasNewLocationAlert = false;
    let latestLocationAlert = null;
    
    // Check SOS alerts
    if (appData.sosAlerts && appData.sosAlerts.length > 0) {
        const recentSOS = appData.sosAlerts.slice(-3);
        alerts = alerts.concat(recentSOS.map(alert => ({
            type: 'sos',
            message: `🆘 EMERGENCY SOS at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp,
            location: alert.location
        })));
    }
    
    // Check lost alerts (HELP ME button)
    if (appData.lostAlerts && appData.lostAlerts.length > 0) {
        const recentLost = appData.lostAlerts.slice(-5);
        alerts = alerts.concat(recentLost.map(alert => ({
            type: 'lost',
            message: `🗺️ Patient HELP activated at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp,
            location: alert.location
        })));
        
        // Show fullscreen alert for ANY location alert
        const latestAlert = appData.lostAlerts[appData.lostAlerts.length - 1];
        if (latestAlert.location && latestAlert.location.latitude && latestAlert.location.longitude) {
            hasNewLocationAlert = true;
            latestLocationAlert = latestAlert;
        }
    }
    
    // Check bathroom alerts
    if (appData.bathroomAlerts && appData.bathroomAlerts.length > 0) {
        const recentBathroom = appData.bathroomAlerts.slice(-5);
        alerts = alerts.concat(recentBathroom.map(alert => ({
            type: 'bathroom',
            message: `🚻 Patient needs BATHROOM assistance at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp,
            location: alert.location
        })));
        
        // Show fullscreen alert for bathroom request
        const latestAlert = appData.bathroomAlerts[appData.bathroomAlerts.length - 1];
        if (latestAlert.location && latestAlert.location.latitude && latestAlert.location.longitude) {
            hasNewLocationAlert = true;
            latestLocationAlert = { ...latestAlert, type: 'bathroom' };
        }
    }
    
    // Check missed medicines
    if (appData.missedMedicines && appData.missedMedicines.length > 0) {
        const recentMissed = appData.missedMedicines.slice(-3);
        alerts = alerts.concat(recentMissed.map(alert => ({
            type: 'medicine',
            message: `💊 Missed medicine: ${alert.medicineName} at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp
        })));
    }

    // Check security alerts
    if (appData.securityAlerts && appData.securityAlerts.length > 0) {
        const recentSecurity = appData.securityAlerts.slice(-3);
        alerts = alerts.concat(recentSecurity.map(alert => ({
            type: 'security',
            message: `⚠️ Unknown Person Detected at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp
        })));
    }
    
    if (alerts.length > 0) {
        alertsSection.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.type === 'sos' ? '' : 'warning'}" style="
                position: relative;
                padding: 25px 30px;
                margin: 15px 0;
                border-radius: 15px;
                background: ${alert.type === 'lost' || alert.type === 'sos' ? 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)' : '#ff6b6b'};
                color: white;
                font-size: 22px;
                font-weight: bold;
                box-shadow: 0 8px 25px rgba(255,0,0,0.5);
                border: 4px solid #8b0000;
                animation: alertPulse 2s infinite;
            ">
                ${alert.message}
                ${alert.location && alert.location.latitude && alert.location.longitude ? `
                    <br><div style="font-size: 18px; margin-top: 10px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">📍 Location: ${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}</div>
                    <br><button onclick="window.open('https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}', '_blank')" 
                        style="margin-top: 12px; padding: 15px 25px; background: white; color: #ff0000; border: 3px solid white; border-radius: 10px; cursor: pointer; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: all 0.3s;"
                        onmouseover="this.style.transform='scale(1.05)'"
                        onmouseout="this.style.transform='scale(1)'">
                        🗺️ OPEN IN MAPS
                    </button>
                ` : ''}
            </div>
        `).join('');
        
        // Also reload recent alerts in settings tab
        loadRecentAlerts();
    } else {
        alertsSection.innerHTML = '';
    }
}

// BIG RED LOCATION ALERT - Fullscreen Emergency Notification
function showBigLocationAlert(alert) {
    // Check if alert already shown
    if (document.getElementById('bigLocationAlert')) return;
    
    const isBathroomAlert = alert.type === 'bathroom';
    const alertIcon = isBathroomAlert ? '🚽' : '🚨';
    const alertTitle = isBathroomAlert ? 'BATHROOM ASSISTANCE NEEDED!' : 'PATIENT NEEDS HELP!';
    const alertMessage = isBathroomAlert ? '🚽 BATHROOM ALERT' : '🗺️ LOCATION ALERT ACTIVATED';
    
    const modal = document.createElement('div');
    modal.id = 'bigLocationAlert';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: alertPulse 1s infinite;
    `;
    
    const lat = alert.location.latitude;
    const lng = alert.location.longitude;
    const time = new Date(alert.timestamp).toLocaleString();
    
    modal.innerHTML = `
        <style>
            @keyframes alertPulse {
                0%, 100% { opacity: 0.95; }
                50% { opacity: 1; }
            }
            @keyframes alertShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            @keyframes alertBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        </style>
        <div style="
            background: white;
            padding: 60px;
            border-radius: 30px;
            max-width: 700px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 80px rgba(0,0,0,0.8);
            animation: alertShake 0.5s ease-in-out;
            border: 10px solid #ff0000;
            position: relative;
        ">
            <button onclick="document.getElementById('bigLocationAlert').remove();" style="
                position: absolute;
                top: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #ff0000;
                color: white;
                border: 3px solid white;
                font-size: 36px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: all 0.3s;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">×</button>
            <div style="
                font-size: 120px;
                margin: 20px 0;
                animation: alertBounce 1s infinite;
            ">${alertIcon}</div>
            
            <h1 style="
                color: #ff0000;
                font-size: 56px;
                font-weight: bold;
                margin: 20px 0;
                text-transform: uppercase;
                letter-spacing: 3px;
            ">${alertTitle}</h1>
            
            <div style="
                background: #fff3cd;
                border: 3px solid #ff0000;
                border-radius: 15px;
                padding: 30px;
                margin: 30px 0;
            ">
                <p style="font-size: 28px; color: #333; margin: 10px 0; font-weight: bold;">
                    ${alertMessage}
                </p>
                <p style="font-size: 22px; color: #666; margin: 15px 0;">
                    ⏰ Time: ${time}
                </p>
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    font-family: monospace;
                ">
                    <p style="font-size: 24px; color: #000; margin: 5px 0; font-weight: bold;">
                        📍 GPS Coordinates:
                    </p>
                    <p style="font-size: 20px; color: #333; margin: 10px 0;">
                        Latitude: ${lat.toFixed(6)}
                    </p>
                    <p style="font-size: 20px; color: #333; margin: 10px 0;">
                        Longitude: ${lng.toFixed(6)}
                    </p>
                </div>
            </div>
            
            <button onclick="window.open('https://www.google.com/maps?q=${lat},${lng}', '_blank')" 
                style="
                    width: 100%;
                    padding: 25px;
                    background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                    color: white;
                    border: none;
                    border-radius: 15px;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 10px 0;
                    box-shadow: 0 8px 20px rgba(255,0,0,0.4);
                    transition: all 0.3s;
                "
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'"
            >
                🗺️ OPEN LOCATION IN MAPS NOW
            </button>
            
            <button onclick="
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTQwOUKfl8LZjHAU6k9n0yn0sBSh+zPLaizsKGGS46+qnVRQMSKHh8r1uIQYsgc3y2Ik2CBlpu+znnk0MDlCn5fC2YxwGOpPZ9Mp9LAUpfs/y2os7ChlluOvqp1UUDEmi4fK9biEGLIHN8tiJNggZaLvs555NDA5Qp+XwtmMcBjqT2fTKfSwGKX/P8tqLOwoZZbjr6qdVFAxJouHyvW4hBiyBzfLYiTYIGWi77OeeTQwOUKfl8LZjHAY6k9n0yn0sBil/z/LaizsKGWW46+qnVRQMSaLh8r1uIQYsgc3y2Ik2CBlou+znno0MDk6v5O+2YxwGOpPZ9Mp9LAYpf8/y2os7ChlluOvqp1UUDEmi4fK9biEGLIHN8tiJNggZaLvs555NDA5Qp+XwtmMcBjqT2fTKfSwGKX/P8tqLOwoZZbjr6qdVFAxJouHyvW4hBiyBzfLYiTYIGWi77OeeTQwOUKfl8LZjHAY6k9n0yn0sBil/z/LaizsKGWW46+qnVRQMSaLh8r1uIQYsgc3y2Ik2CBloO+znno0MDk6v5O+2YxwGOpPZ9Mp9LAYpf8/y2os7ChlluOvqp1UUDEmi4fK9biEGLIHN8tiJNggZaLvs555NDA5Qp+XwtmMcBjqT2fTKfSwGKX/P8tqLOwoZZbjr6qdVFAxJouHyvW4hBiyBzfLYiTYIG');
                audio.play();
                this.parentElement.parentElement.remove();
                speak('Location alert acknowledged. Patient location opened in maps.');
            " style="
                width: 100%;
                padding: 20px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 15px;
                font-size: 22px;
                font-weight: bold;
                cursor: pointer;
                margin: 10px 0;
                box-shadow: 0 4px 15px rgba(40,167,69,0.4);
            ">
                ✓ ACKNOWLEDGE ALERT
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Play alarm sound and speak
    speak('URGENT ALERT! Patient needs help! Location alert activated. Check the map immediately!');
    
    // Auto-open maps after 2 seconds
    setTimeout(() => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }, 2000);
}

// ============================================
// PATIENT PROFILE
// ============================================

function loadProfile() {
    if (appData.patientProfile) {
        document.getElementById('patientName').value = appData.patientProfile.name || '';
        document.getElementById('patientAge').value = appData.patientProfile.age || '';
        document.getElementById('patientCondition').value = appData.patientProfile.condition || '';
        document.getElementById('emergencyContact').value = appData.patientProfile.emergencyContact || '';
        document.getElementById('emergencyPhone').value = appData.patientProfile.emergencyPhone || '';
        document.getElementById('patientAddress').value = appData.patientProfile.address || '';
    }
}

function saveProfile(e) {
    e.preventDefault();
    console.log('Saving profile...');
    
    const profile = {
        name: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        condition: document.getElementById('patientCondition').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        address: document.getElementById('patientAddress').value
    };
    
    appData.patientProfile = profile;
    saveDataToLocal();
    speak('Profile saved successfully');
    alert('✓ Profile saved successfully!');
    console.log('Profile saved:', profile);
}

// ============================================
// DAILY ROUTINE
// ============================================

function loadRoutine() {
    const list = document.getElementById('routineList');
    
    if (appData.dailyRoutine && appData.dailyRoutine.length > 0) {
        list.innerHTML = appData.dailyRoutine
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(item => `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">⏰ ${item.time}</div>
                        <div class="list-item-detail">${item.activity}</div>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteRoutine(${item.id})">Delete</button>
                    </div>
                </div>
            `).join('');
    } else {
        list.innerHTML = '<p>No routine items yet. Add some activities above.</p>';
    }
}

function addRoutine(e) {
    e.preventDefault();
    console.log('Adding routine...');
    
    const routine = {
        id: Date.now(),
        time: document.getElementById('routineTime').value,
        activity: document.getElementById('routineActivity').value
    };
    
    if (!routine.time || !routine.activity) {
        alert('Please fill in both time and activity');
        return;
    }
    
    appData.dailyRoutine.push(routine);
    saveDataToLocal();
    
    document.getElementById('routineForm').reset();
    speak('Routine added successfully');
    loadRoutine();
}

function deleteRoutine(id) {
    if (confirm('Delete this routine item?')) {
        appData.dailyRoutine = appData.dailyRoutine.filter(r => r.id !== id);
        saveDataToLocal();
        speak('Routine deleted');
        loadRoutine();
    }
}

// ============================================
// KNOWN PEOPLE
// ============================================

let currentTimeline = [];

function loadPeople() {
    const list = document.getElementById('peopleList');
    
    if (appData.knownPeople && appData.knownPeople.length > 0) {
        list.innerHTML = appData.knownPeople.map(person => `
            <div class="list-item">
                ${person.photo ? `<img src="${person.photo}" alt="${person.name}" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover; margin-right: 15px;">` : ''}
                <div class="list-item-content">
                    <div class="list-item-title">👤 ${person.name}</div>
                    <div class="list-item-detail">Relation: ${person.relation}</div>
                    ${person.timeline && person.timeline.length > 0 ? `<div class="list-item-detail">📖 ${person.timeline.length} Memory Moments</div>` : ''}
                    ${person.description ? `<div class="list-item-detail">${person.description}</div>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-danger btn-small" onclick="deletePerson(${person.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } else {
        list.innerHTML = '<p>No people added yet.</p>';
    }
}

function setupTimelineEvents() {
    const btn = document.getElementById('addMomentBtn');
    const fileInput = document.getElementById('timelineMedia');
    const captionInput = document.getElementById('timelineCaption');
    
    if (!btn) return;
    
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', async () => {
        console.log('🔘 Add Moment button clicked!');
        const file = fileInput?.files[0];
        const caption = captionInput?.value || '';
        
        console.log('📋 Form data:', {
            hasFile: !!file,
            fileName: file?.name,
            fileType: file?.type,
            fileSize: file?.size,
            caption: caption
        });

        if (!file && !caption.trim()) {
            alert('Please add a photo/video or a caption for the memory.');
            return;
        }

        let mediaData = null;
        let mediaType = null;

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Please use files under 5MB.');
                return;
            }
            
            try {
                mediaData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                });
                console.log('📁 File detected:', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                
                if (file.type.startsWith('video')) {
                    mediaType = 'video';
                    console.log('✅ Detected as VIDEO');
                } else if (file.type.startsWith('audio')) {
                    mediaType = 'audio';
                    console.log('✅ Detected as AUDIO');
                } else {
                    mediaType = 'image';
                    console.log('✅ Detected as IMAGE');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
                return;
            }
        }

        const moment = {
            id: Date.now(),
            media: mediaData,
            type: mediaType,
            caption: caption.trim()
        };
        
        console.log('💾 Adding moment to timeline:', {
            type: moment.type,
            hasMedia: !!moment.media,
            mediaSize: moment.media?.length || 0,
            caption: moment.caption
        });

        currentTimeline.push(moment);
        renderTimelinePreview();
        
        if (fileInput) fileInput.value = '';
        if (captionInput) captionInput.value = '';
    });
}

function renderTimelinePreview() {
    const container = document.getElementById('timelineList');
    container.innerHTML = currentTimeline.map((moment, index) => `
        <div class="timeline-item" style="display: flex; align-items: center; margin-bottom: 10px; background: white; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
            <span style="font-weight: bold; margin-right: 10px;">${index + 1}.</span>
            ${moment.media ? 
                (moment.type === 'video' ? 
                    `<video src="${moment.media}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;"></video>` : 
                  moment.type === 'audio' ?
                    `<div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 5px; margin-right: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎙️</div>` :
                    `<img src="${moment.media}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;">`
                ) : ''
            }
            <div style="flex: 1; font-size: 0.9rem;">${moment.caption || (moment.type === 'audio' ? 'Voice Message' : 'No caption')}</div>
            <button type="button" onclick="removeMoment(${moment.id})" style="background: #ff4d4d; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
        </div>
    `).join('');
}

window.removeMoment = function(id) {
    currentTimeline = currentTimeline.filter(m => m.id !== id);
    renderTimelinePreview();
};

async function addPerson(e) {
    e.preventDefault();
    console.log('Adding person...');
    
    const photoPreview = document.getElementById('photoPreview');
    const photoData = photoPreview?.dataset?.photoData || '';
    const voiceInput = document.getElementById('personVoice');
    const voiceFile = voiceInput?.files?.[0] || null;
    let voiceNoteData = '';

    if (voiceFile) {
        // Keep it small so localStorage/Firebase sync stays reliable
        if (voiceFile.size > 5 * 1024 * 1024) {
            alert('Voice note file is too large. Please use files under 5MB.');
            return;
        }
        try {
            voiceNoteData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (evt) => resolve(evt.target.result);
                reader.onerror = () => reject(new Error('Failed to read voice note file'));
                reader.readAsDataURL(voiceFile);
            });
        } catch (error) {
            alert('Error reading voice note: ' + error.message);
            return;
        }
    }
    
    const person = {
        id: Date.now(),
        name: document.getElementById('personName').value,
        relation: document.getElementById('personRelation').value,
        photo: photoData,
        voiceNote: voiceNoteData,
        timeline: [...currentTimeline],
        description: document.getElementById('personDescription').value
    };
    
    if (!person.name || !person.relation) {
        alert('Please fill in name and relation');
        return;
    }
    
    appData.knownPeople.push(person);
    saveDataToLocal();
    
    document.getElementById('peopleForm').reset();
    if (photoPreview) {
        photoPreview.innerHTML = '';
        photoPreview.dataset.photoData = '';
    }
    currentTimeline = [];
    renderTimelinePreview();
    
    loadPeople();
    speak('Person added successfully');
    alert('✓ Person added successfully!');
}

function deletePerson(id) {
    if (confirm('Delete this person?')) {
        appData.knownPeople = appData.knownPeople.filter(p => p.id !== id);
        saveDataToLocal();
        speak('Person deleted');
        loadPeople();
    }
}

// ============================================
// KNOWN PLACES
// ============================================

function loadPlaces() {
    const list = document.getElementById('placesList');
    
    if (appData.knownPlaces && appData.knownPlaces.length > 0) {
        list.innerHTML = appData.knownPlaces.map(place => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">📍 ${place.name}</div>
                    <div class="list-item-detail">${place.address}</div>
                    ${place.description ? `<div class="list-item-detail">${place.description}</div>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-danger btn-small" onclick="deletePlace(${place.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } else {
        list.innerHTML = '<p>No places added yet.</p>';
    }
}

function addPlace(e) {
    e.preventDefault();
    console.log('Adding place...');
    
    const place = {
        id: Date.now(),
        name: document.getElementById('placeName').value,
        address: document.getElementById('placeAddress').value,
        lat: document.getElementById('placeLat').value,
        lng: document.getElementById('placeLng').value,
        description: document.getElementById('placeDescription').value
    };
    
    if (!place.name) {
        alert('Please enter a place name');
        return;
    }
    
    appData.knownPlaces.push(place);
    saveDataToLocal();
    
    document.getElementById('placesForm').reset();
    speak('Place added successfully');
    loadPlaces();
}

function deletePlace(id) {
    if (confirm('Delete this place?')) {
        appData.knownPlaces = appData.knownPlaces.filter(p => p.id !== id);
        saveDataToLocal();
        speak('Place deleted');
        loadPlaces();
    }
}

// ============================================
// MEDICINES
// ============================================

function loadMedicines() {
    const list = document.getElementById('medicineList');
    
    if (appData.medicines && appData.medicines.length > 0) {
        list.innerHTML = appData.medicines
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(med => `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">💊 ${med.name}</div>
                        <div class="list-item-detail">Time: ${med.time} | Dosage: ${med.dosage}</div>
                        ${med.instructions ? `<div class="list-item-detail">${med.instructions}</div>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteMedicine(${med.id})">Delete</button>
                    </div>
                </div>
            `).join('');
    } else {
        list.innerHTML = '<p>No medicines scheduled yet.</p>';
    }
}

function addMedicine(e) {
    e.preventDefault();
    console.log('Adding medicine...');
    
    const medicine = {
        id: Date.now(),
        name: document.getElementById('medicineName').value,
        time: document.getElementById('medicineTime').value,
        dosage: document.getElementById('medicineDosage').value,
        instructions: document.getElementById('medicineInstructions').value
    };
    
    if (!medicine.name || !medicine.time) {
        alert('Please fill in medicine name and time');
        return;
    }
    
    appData.medicines.push(medicine);
    saveDataToLocal();
    
    document.getElementById('medicineForm').reset();
    speak('Medicine added successfully');
    loadMedicines();
}

function deleteMedicine(id) {
    if (confirm('Delete this medicine?')) {
        appData.medicines = appData.medicines.filter(m => m.id !== id);
        saveDataToLocal();
        speak('Medicine deleted');
        loadMedicines();
    }
}

// ============================================
// APPOINTMENTS
// ============================================

function loadAppointments() {
    const list = document.getElementById('appointmentList');
    
    if (appData.appointments && appData.appointments.length > 0) {
        list.innerHTML = appData.appointments
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(apt => `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">🏥 Dr. ${apt.doctor}</div>
                        <div class="list-item-detail">📅 ${apt.date} at ${apt.time}</div>
                        ${apt.location ? `<div class="list-item-detail">📍 ${apt.location}</div>` : ''}
                        ${apt.purpose ? `<div class="list-item-detail">${apt.purpose}</div>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-danger btn-small" onclick="deleteAppointment(${apt.id})">Delete</button>
                    </div>
                </div>
            `).join('');
    } else {
        list.innerHTML = '<p>No appointments scheduled yet.</p>';
    }
}

function addAppointment(e) {
    e.preventDefault();
    console.log('Adding appointment...');
    
    const appointment = {
        id: Date.now(),
        doctor: document.getElementById('doctorName').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        location: document.getElementById('appointmentLocation').value,
        purpose: document.getElementById('appointmentPurpose').value
    };
    
    if (!appointment.doctor || !appointment.date) {
        alert('Please fill in doctor name and date');
        return;
    }
    
    appData.appointments.push(appointment);
    saveDataToLocal();
    
    speak('Appointment added successfully');
    document.getElementById('appointmentForm').reset();
    loadAppointments();
}

function deleteAppointment(id) {
    if (confirm('Delete this appointment?')) {
        appData.appointments = appData.appointments.filter(a => a.id !== id);
        saveDataToLocal();
        speak('Appointment deleted');
        loadAppointments();
    }
}

// ============================================
// EMERGENCY CONTACTS
// ============================================

function loadContacts() {
    const list = document.getElementById('contactsList');
    
    if (appData.emergencyContacts && appData.emergencyContacts.length > 0) {
        list.innerHTML = appData.emergencyContacts.map(contact => `
            <div class="list-item">
                ${contact.photo ? `<img src="${contact.photo}" alt="${contact.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-right: 15px;">` : ''}
                <div class="list-item-content">
                    <div class="list-item-title">👤 ${contact.name}</div>
                    <div class="list-item-detail">📞 ${contact.phone}</div>
                    <div class="list-item-detail">${contact.relation}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteContact(${contact.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } else {
        list.innerHTML = '<p>No emergency contacts added yet.</p>';
    }
}

function addContact(e) {
    e.preventDefault();
    
    const photoPreview = document.getElementById('contactPhotoPreview');
    const photoData = photoPreview?.dataset?.photoData || '';
    
    const contact = {
        id: Date.now(),
        name: document.getElementById('contactName').value,
        phone: document.getElementById('contactPhone').value,
        relation: document.getElementById('contactRelation').value,
        photo: photoData
    };
    
    appData.emergencyContacts.push(contact);
    saveDataToLocal();
    
    speak('Contact added successfully');
    document.getElementById('contactsForm').reset();
    if (photoPreview) {
        photoPreview.innerHTML = '';
        photoPreview.dataset.photoData = '';
    }
    loadContacts();
}

function deleteContact(id) {
    if (confirm('Delete this contact?')) {
        appData.emergencyContacts = appData.emergencyContacts.filter(c => c.id !== id);
        saveDataToLocal();
        speak('Contact deleted');
        loadContacts();
    }
}

// ============================================
// SETTINGS
// ============================================

let homeMap;
let homeMarker;

function loadSettings() {
    if (appData.watchChargingTime) {
        document.getElementById('chargingTime').value = appData.watchChargingTime;
    }
    
    setTimeout(initHomeMap, 500);
}

function initHomeMap() {
    const mapContainer = document.getElementById('homeMap');
    if (!mapContainer) return;

    if (homeMap) {
        setTimeout(() => homeMap.invalidateSize(), 100);
        return;
    }

    const initialLat = appData.homeLocation ? appData.homeLocation.lat : 17.3850;
    const initialLng = appData.homeLocation ? appData.homeLocation.lng : 78.4867;

    homeMap = L.map('homeMap').setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(homeMap);

    if (appData.homeLocation) {
        homeMarker = L.marker([appData.homeLocation.lat, appData.homeLocation.lng]).addTo(homeMap);
        document.getElementById('homeAddress').value = appData.homeLocation.address || 'Saved Location';
        document.getElementById('homeLat').value = appData.homeLocation.lat;
        document.getElementById('homeLng').value = appData.homeLocation.lng;
    }

    if (!appData.homeLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            homeMap.setView([lat, lng], 15);
        });
    }

    homeMap.on('click', async function(e) {
        const { lat, lng } = e.latlng;
        
        if (homeMarker) {
            homeMarker.setLatLng(e.latlng);
        } else {
            homeMarker = L.marker(e.latlng).addTo(homeMap);
        }

        document.getElementById('homeLat').value = lat;
        document.getElementById('homeLng').value = lng;
        document.getElementById('homeAddress').value = "Fetching address...";

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            document.getElementById('homeAddress').value = data.display_name;
            speak('Home location updated');
        } catch (error) {
            document.getElementById('homeAddress').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    });
}

document.getElementById('saveHomeBtn').addEventListener('click', () => {
    const lat = document.getElementById('homeLat').value;
    const lng = document.getElementById('homeLng').value;
    const address = document.getElementById('homeAddress').value;

    if (!lat || !lng) {
        alert('Please click on the map to select a home location.');
        return;
    }

    appData.homeLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address
    };
    
    saveDataToLocal();
    speak('Home location saved successfully');
    alert('Home location saved!');
});

function saveChargingTime() {
    const time = document.getElementById('chargingTime').value;
    
    appData.watchChargingTime = time;
    saveDataToLocal();
    
    speak('Charging time saved successfully');
    alert('✓ Charging time saved!');
}

function loadRecentAlerts() {
    const container = document.getElementById('recentAlerts');
    let alerts = [];
    
    if (appData.sosAlerts) {
        alerts = alerts.concat(appData.sosAlerts.map(a => ({ ...a, type: 'sos' })));
    }
    if (appData.lostAlerts) {
        alerts = alerts.concat(appData.lostAlerts.map(a => ({ ...a, type: 'lost' })));
    }
    if (appData.missedMedicines) {
        alerts = alerts.concat(appData.missedMedicines.map(a => ({ ...a, type: 'medicine' })));
    }
    if (appData.securityAlerts) {
        alerts = alerts.concat(appData.securityAlerts.map(a => ({ ...a, type: 'security' })));
    }
    
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (alerts.length > 0) {
        container.innerHTML = alerts.slice(0, 10).map(alert => {
            let title = '';
            let content = '';
            let locationButton = '';
            
            switch(alert.type) {
                case 'sos': 
                    title = '🆘 EMERGENCY SOS ALERT';
                    if (alert.location?.latitude && alert.location?.longitude) {
                        content = `Location: ${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`;
                        locationButton = `<button onclick="window.open('https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}', '_blank')" style="width: 100%; padding: 12px; background: #E74C3C; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin-top: 10px; cursor: pointer;">🗺️ OPEN LOCATION IN MAPS</button>`;
                    } else {
                        content = 'Location not available';
                    }
                    break;
                case 'lost': 
                    title = '🗺️ PATIENT NEEDS HELP - LOCATION ALERT';
                    if (alert.location?.latitude && alert.location?.longitude) {
                        content = `Patient Location:<br>Latitude: ${alert.location.latitude.toFixed(6)}<br>Longitude: ${alert.location.longitude.toFixed(6)}`;
                        locationButton = `<button onclick="window.open('https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}', '_blank')" style="width: 100%; padding: 12px; background: #FF9800; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin-top: 10px; cursor: pointer;">🗺️ OPEN LOCATION IN MAPS</button>`;
                    } else {
                        content = 'Location not available';
                    }
                    break;
                case 'medicine': 
                    title = '💊 Missed Medicine'; 
                    content = alert.medicineName || 'Unknown medicine'; 
                    break;
                case 'security': 
                    title = '⚠️ Unknown Person Detected'; 
                    content = alert.location?.latitude ? `Location: ${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}` : 'Location: N/A'; 
                    break;
            }
            
            return `
                <div class="alert-item ${alert.type}" style="background: ${alert.type === 'sos' ? '#ffebee' : alert.type === 'lost' ? '#fff3e0' : 'white'}; padding: 20px; margin: 15px 0; border-radius: 12px; border-left: 5px solid ${alert.type === 'sos' ? '#E74C3C' : alert.type === 'lost' ? '#FF9800' : '#4CAF50'}; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <strong style="font-size: 18px; color: ${alert.type === 'sos' ? '#E74C3C' : alert.type === 'lost' ? '#FF9800' : '#333'};">${title}</strong><br>
                    <div style="font-size: 16px; color: #555; margin: 10px 0; line-height: 1.6;">${content}</div>
                    <small style="color: #888; font-size: 14px;">⏰ ${new Date(alert.timestamp).toLocaleString()}</small>
                    ${locationButton}
                </div>
            `;
        }).join('');
    } else {
        container.innerHTML = '<p>No recent alerts.</p>';
    }
}
// ==================== Google Fit Integration Functions ====================

let googleFitUpdateInterval = null;

// Initialize Google Fit data fetching and display
async function initializeGoogleFitData() {
    try {
        console.log('🏃 Initializing Google Fit data...');
        
        // Initial data fetch
        await fetchAndDisplayHealthData();
        
        // Set up periodic updates every 5 minutes
        if (googleFitUpdateInterval) {
            clearInterval(googleFitUpdateInterval);
        }
        
        googleFitUpdateInterval = setInterval(async () => {
            await fetchAndDisplayHealthData();
        }, 5 * 60 * 1000); // 5 minutes
        
        console.log('✅ Google Fit data updates started');
    } catch (error) {
        console.error('❌ Error initializing Google Fit data:', error);
        throw error;
    }
}

// Fetch and display health data
async function fetchAndDisplayHealthData() {
    try {
        // Check if Google Fit integration is available
        if (typeof fetchAllHealthData === 'function') {
            const healthData = await fetchAllHealthData();
            updateHealthDataDisplay(healthData);
            
            // Run health triggers check
            if (typeof checkHealthTriggers === 'function') {
                checkHealthTriggers(healthData);
            }
        } else {
            console.warn('Google Fit integration not available');
        }
    } catch (error) {
        console.error('Error fetching health data:', error);
        // Don't throw - just log the error and continue
        updateHealthDataDisplay({
            steps: { value: 'Error', lastSync: new Date() },
            heartRate: { value: 'Error', lastSync: new Date() },
            calories: { value: 'Error', lastSync: new Date() },
            sleep: { value: 'Error', lastSync: new Date() }
        });
    }
}

// Update health data display in the UI
function updateHealthDataDisplay(healthData) {
    try {
        // Update steps
        const stepsElement = document.getElementById('stepsCount');
        if (stepsElement && healthData.steps) {
            stepsElement.textContent = healthData.steps.value !== undefined ? 
                healthData.steps.value.toLocaleString() : 'N/A';
        }
        
        // Update heart rate
        const heartRateElement = document.getElementById('heartRateValue');
        if (heartRateElement && healthData.heartRate) {
            heartRateElement.textContent = healthData.heartRate.value !== undefined ? 
                healthData.heartRate.value + ' bpm' : 'N/A';
        }
        
        // Update calories
        const caloriesElement = document.getElementById('caloriesValue');
        if (caloriesElement && healthData.calories) {
            caloriesElement.textContent = healthData.calories.value !== undefined ? 
                healthData.calories.value.toLocaleString() : 'N/A';
        }
        
        // Update sleep
        const sleepElement = document.getElementById('sleepValue');
        if (sleepElement && healthData.sleep) {
            const sleepHours = healthData.sleep.value !== undefined ? 
                (healthData.sleep.value / 60).toFixed(1) : 'N/A';
            sleepElement.textContent = sleepHours !== 'N/A' ? sleepHours + ' hrs' : 'N/A';
        }
        
        // Update last sync time
        const lastSyncElement = document.getElementById('lastSyncTime');
        if (lastSyncElement) {
            const now = new Date();
            lastSyncElement.textContent = now.toLocaleTimeString();
        }
        
        console.log('✅ Health data display updated');
    } catch (error) {
        console.error('Error updating health data display:', error);
    }
}

// Stop Google Fit updates
function stopGoogleFitUpdates() {
    if (googleFitUpdateInterval) {
        clearInterval(googleFitUpdateInterval);
        googleFitUpdateInterval = null;
        console.log('🛑 Google Fit updates stopped');
    }
}

// Clear health data display
function clearHealthDataDisplay() {
    const elements = [
        'stepsCount',
        'heartRateValue',
        'caloriesValue',
        'sleepValue'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '--';
        }
    });
    
    const lastSyncElement = document.getElementById('lastSyncTime');
    if (lastSyncElement) {
        lastSyncElement.textContent = 'Not synced';
    }
}  
// INDOOR ROOM LOCATIONS  
