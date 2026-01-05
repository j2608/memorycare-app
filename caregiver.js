// ============================================
// CAREGIVER DASHBOARD JAVASCRIPT
// Complete management system for patient care
// ============================================

console.log('🚀 CAREGIVER.JS IS LOADING...');

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== STARTING DASHBOARD ===');
    
    // 1. Time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
    
    // 2. TABS FIRST - SUPER SIMPLE, NO TIMEOUT
    console.log('Setting up tabs...');
    const allTabButtons = document.querySelectorAll('.tab-btn');
    console.log('Found tab buttons:', allTabButtons.length);
    
    allTabButtons.forEach((button, index) => {
        console.log(`Tab ${index}:`, button.textContent.trim());
        button.onclick = function() {
            const tabName = this.getAttribute('data-tab');
            console.log('🔥 CLICKED:', tabName);
            
            // Hide all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            
            // Show clicked tab
            this.classList.add('active');
            const panel = document.getElementById(tabName + 'Tab');
            if (panel) {
                panel.classList.add('active');
                console.log('✅ SHOWING:', tabName);
                
                // Maps
                if (tabName === 'places') setTimeout(initMap, 100);
                if (tabName === 'settings') setTimeout(initHomeMap, 100);
            } else {
                console.error('❌ Panel not found:', tabName + 'Tab');
            }
        };
    });
    
    console.log('✅ TABS READY!');
    
    // 3. Other event listeners
    setTimeout(setupEventListeners, 300);
    
    // 4. Login/Session
    currentRefCode = localStorage.getItem('currentRefCode');
    console.log('Reference code:', currentRefCode);
    
    if (!currentRefCode) {
        showSetupModal();
    } else {
        // Verify session still exists on server
        try {
            const testResponse = await fetch('/api/data?refCode=' + currentRefCode);
            const testData = await testResponse.json();
            
            // Check if session exists (has referenceCode field)
            if (!testData.referenceCode) {
                console.warn('⚠️ Session expired or server restarted - please create new session');
                alert('Session expired! The server was restarted. Please create a new session.');
                localStorage.removeItem('currentRefCode');
                currentRefCode = null;
                showSetupModal();
                return;
            }
            
            document.getElementById('currentRefCode').textContent = currentRefCode;
            document.getElementById('setupModal').style.display = 'none';
            await loadAllData();
            checkForAlerts();
            setInterval(checkForAlerts, 30000);
        } catch (error) {
            console.error('Session validation failed:', error);
            showSetupModal();
        }
    }
    
    console.log('=== READY - TRY CLICKING TABS NOW ===');
});

// Show setup modal
function showSetupModal() {
    console.log('Showing setup modal...');
    const modal = document.getElementById('setupModal');
    if (!modal) {
        console.error('❌ Setup modal not found in DOM!');
        alert('Error: Setup modal not found. Please refresh the page.');
        return;
    }
    console.log('✅ Modal found, displaying...');
    modal.style.display = 'flex';
    
    const createBtn = document.getElementById('createNewSessionBtn');
    const loginBtn = document.getElementById('loginBtn');
    const refCodeInput = document.getElementById('refCodeInput');
    
    console.log('Modal elements:', { createBtn: !!createBtn, loginBtn: !!loginBtn, refCodeInput: !!refCodeInput });
    
    if (createBtn) createBtn.onclick = createNewSession;
    if (loginBtn) loginBtn.onclick = loginWithCode;
    
    // Allow Enter key to login
    if (refCodeInput) {
        refCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginWithCode();
        });
    }
    console.log('Setup modal ready');
}

// Create new patient session
async function createNewSession() {
    console.log('Creating new session...');
    const messageDiv = document.getElementById('setupMessage');
    const codeDisplayDiv = document.getElementById('generatedCodeDisplay');
    const codeTextDiv = document.getElementById('codeText');
    
    try {
        const response = await fetch('/api/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.success) {
            currentRefCode = data.referenceCode;
            localStorage.setItem('currentRefCode', currentRefCode);
            console.log('✅ Session created:', currentRefCode);
            
            // Show code in modal
            if (codeTextDiv) codeTextDiv.textContent = currentRefCode;
            if (codeDisplayDiv) codeDisplayDiv.style.display = 'block';
            
            // Update header
            const headerCode = document.getElementById('currentRefCode');
            if (headerCode) headerCode.textContent = currentRefCode;
            
            // Voice announcement
            speak(`Session created. Your reference code is ${currentRefCode.split('').join(' ')}`);
            
            if (messageDiv) messageDiv.innerHTML = '';
            
        } else {
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                        Failed to create session. Please try again.
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error creating session:', error);
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                    Error: ${error.message}. Make sure the server is running.
                </div>
            `;
        }
    }
}

// Login with existing reference code
async function loginWithCode() {
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
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referenceCode: code })
        });
        const data = await response.json();
        
        if (data.success) {
            currentRefCode = code;
            localStorage.setItem('currentRefCode', currentRefCode);
            
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="background: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
                        ✓ Access granted!
                    </div>
                `;
            }
            speak('Access granted');
            
            setTimeout(() => {
                const modal = document.getElementById('setupModal');
                if (modal) modal.style.display = 'none';
                const codeDisplay = document.getElementById('currentRefCode');
                if (codeDisplay) codeDisplay.textContent = currentRefCode;
                
                // Load data immediately
                loadAllData().then(() => {
                    checkForAlerts();
                    console.log('✅ Dashboard ready!');
                });
            }, 1000);
        } else {
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                        Invalid reference code. Please try again.
                    </div>
                `;
            }
            speak('Invalid code');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                    Error connecting: ${error.message}. Please try again.
                </div>
            `;
        }
    }
}

// Load all data from server
async function loadAllData() {
    try {
        const response = await fetch(`/api/data?refCode=${currentRefCode}`);
        appData = await response.json();
        
        // Load all sections
        loadProfile();
        loadRoutine();
        loadPeople();
        loadPlaces();
        loadMedicines();
        loadAppointments();
        loadContacts();
        loadSettings();
        loadRecentAlerts();
    } catch (error) {
        console.error('Error loading data:', error);
    }
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
            switchTab(tab);
        });
    });
    
    // Photo upload preview
    document.getElementById('personPhotoFile').addEventListener('change', handlePhotoUpload);
    document.getElementById('contactPhotoFile').addEventListener('change', handleContactPhotoUpload);
    
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
            // Store base64 in a data attribute for later use
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

// Tab switching
function switchTab(tabName) {
    console.log('🔄 switchTab called with:', tabName);
    
    // Remove active class from all tabs and panels
    const allButtons = document.querySelectorAll('.tab-btn');
    const allPanels = document.querySelectorAll('.tab-panel');
    console.log(`Found ${allButtons.length} buttons and ${allPanels.length} panels`);
    
    allButtons.forEach(btn => btn.classList.remove('active'));
    allPanels.forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedPanel = document.getElementById(`${tabName}Tab`);
    
    console.log('Selected button:', selectedBtn);
    console.log('Selected panel:', selectedPanel);
    
    if (selectedBtn) {
        selectedBtn.classList.add('active');
        console.log('✅ Button activated');
    } else {
        console.error('❌ Button not found!');
    }
    
    if (selectedPanel) {
        selectedPanel.classList.add('active');
        console.log('✅ Panel shown');
    } else {
        console.error('❌ Panel not found!');
    }

    // Initialize maps when respective tabs are selected
    if (tabName === 'places') {
        console.log('Initializing places map...');
        setTimeout(initMap, 100);
    } else if (tabName === 'settings') {
        console.log('Initializing settings map...');
        setTimeout(initHomeMap, 100);
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

    // Default to a central location (e.g., New York or user's location)
    // Here we use a default, but in production we'd ask for location
    const defaultLat = 40.7128;
    const defaultLng = -74.0060;

    map = L.map('mapPicker').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
        });
    }

    // Handle map clicks
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }

        // Update form fields
        document.getElementById('placeLat').value = lat;
        document.getElementById('placeLng').value = lng;
        document.getElementById('placeAddress').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        
        // Optional: Reverse geocoding could go here to get real address
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
async function checkForAlerts() {
    await loadAllData();
    
    const alertsSection = document.getElementById('alertsSection');
    let alerts = [];
    let hasNewAlerts = false;
    
    // Check SOS alerts
    if (appData.sosAlerts && appData.sosAlerts.length > 0) {
        const recentSOS = appData.sosAlerts.slice(-3);
        alerts = alerts.concat(recentSOS.map(alert => ({
            type: 'sos',
            message: `🆘 EMERGENCY SOS at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp
        })));
        
        // Voice alert for new SOS
        const lastSOS = appData.sosAlerts[appData.sosAlerts.length - 1];
        if (new Date() - new Date(lastSOS.timestamp) < 60000) {
            speak('EMERGENCY! SOS alert received from patient');
            hasNewAlerts = true;
            // Show urgent popup alert
            showUrgentAlert('SOS', lastSOS);
        }
    }
    
    // Check lost alerts
    if (appData.lostAlerts && appData.lostAlerts.length > 0) {
        const recentLost = appData.lostAlerts.slice(-5);
        alerts = alerts.concat(recentLost.map(alert => ({
            type: alert.live ? 'live-location' : 'lost',
            message: alert.live 
                ? `📍 LIVE LOCATION UPDATE at ${new Date(alert.timestamp).toLocaleTimeString()}`
                : `🗺️ Patient HELP activated at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp,
            location: alert.location
        })));
        
        // Voice alert for new lost alert
        const lastLost = appData.lostAlerts[appData.lostAlerts.length - 1];
        if (!lastLost.live && new Date() - new Date(lastLost.timestamp) < 60000) {
            speak('Patient has activated help mode and may be lost');
            hasNewAlerts = true;
            // Show urgent popup alert
            showUrgentAlert('HELP', lastLost);
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

    // Check security alerts (Unknown Person)
    if (appData.securityAlerts && appData.securityAlerts.length > 0) {
        const recentSecurity = appData.securityAlerts.slice(-3);
        alerts = alerts.concat(recentSecurity.map(alert => ({
            type: 'security',
            message: `⚠️ Unknown Person Detected at ${new Date(alert.timestamp).toLocaleTimeString()}`,
            time: alert.timestamp
        })));
        
        // Voice alert for security issue
        const lastSecurity = appData.securityAlerts[appData.securityAlerts.length - 1];
        if (new Date() - new Date(lastSecurity.timestamp) < 60000) {
            speak('Security alert! Unknown person detected');
            hasNewAlerts = true;
        }
    }
    
    if (alerts.length > 0) {
        alertsSection.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.type === 'sos' ? '' : alert.type === 'lost' ? 'warning' : alert.type === 'live-location' ? 'info' : alert.type === 'security' ? 'danger' : 'info'}">
                ${alert.message}
                ${alert.location ? `<br><small>📍 Lat: ${alert.location.latitude.toFixed(4)}, Lng: ${alert.location.longitude.toFixed(4)}</small>` : ''}
            </div>
        `).join('');
    } else {
        alertsSection.innerHTML = '';
    }
}

// Show urgent popup alert with sound and visual
function showUrgentAlert(type, alertData) {
    // Create urgent alert popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'SOS' ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' : 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'};
        color: white;
        padding: 50px;
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.5);
        z-index: 100000;
        text-align: center;
        min-width: 600px;
        animation: urgentPulse 0.5s infinite alternate;
    `;
    
    const icon = type === 'SOS' ? '🆘' : '🗺️';
    const title = type === 'SOS' ? 'EMERGENCY SOS ALERT!' : 'HELP REQUESTED!';
    const message = type === 'SOS' 
        ? 'Patient has pressed the emergency SOS button!' 
        : 'Patient has activated HELP mode and may be lost!';
    
    popup.innerHTML = `
        <style>
            @keyframes urgentPulse {
                from { transform: translate(-50%, -50%) scale(1); }
                to { transform: translate(-50%, -50%) scale(1.05); }
            }
        </style>
        <h1 style="font-size: 64px; margin: 0 0 20px 0;">${icon} ${title}</h1>
        <p style="font-size: 32px; margin: 20px 0; font-weight: bold;">${message}</p>
        <p style="font-size: 24px; margin: 20px 0;">
            Time: ${new Date(alertData.timestamp).toLocaleTimeString()}
        </p>
        ${alertData.location ? `
            <p style="font-size: 20px; margin: 20px 0;">
                📍 Location: ${alertData.location.latitude.toFixed(4)}, ${alertData.location.longitude.toFixed(4)}
            </p>
            <button onclick="window.open('https://www.google.com/maps?q=${alertData.location.latitude},${alertData.location.longitude}', '_blank')" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 15px 30px;
                font-size: 20px;
                border-radius: 10px;
                cursor: pointer;
                margin: 10px;
                font-weight: bold;
            ">🗺️ Open in Maps</button>
        ` : ''}
        <br>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: ${type === 'SOS' ? '#f44336' : '#ff9800'};
            border: none;
            padding: 20px 50px;
            font-size: 28px;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 20px;
            font-weight: bold;
        ">✓ Acknowledged</button>
    `;
    
    document.body.appendChild(popup);
    
    // Play alert sound (browser beep)
    const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIGWi77eefTRAMUKfj8LZjHAY4ktfzzHksBSR3yPLdkEAKE160+OuoVRQKRZ/j8r1sIQUrhc7y2Yk3CBlpu+3nn00QDFA==');
    beep.play().catch(() => {});
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 30000);
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

async function saveProfile(e) {
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
    
    try {
        const response = await fetch('/api/patient-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...profile, refCode: currentRefCode })
        });
        
        if (response.ok) {
            // Update local data immediately
            appData.patientProfile = profile;
            speak('Profile saved successfully');
            alert('✓ Profile saved successfully!');
            console.log('Profile saved:', profile);
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        alert('Error saving profile');
        console.error(error);
    }
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

async function addRoutine(e) {
    e.preventDefault();
    console.log('Adding routine...');
    console.log('📝 Current refCode:', currentRefCode);
    
    const routine = {
        time: document.getElementById('routineTime').value,
        activity: document.getElementById('routineActivity').value
    };
    
    if (!routine.time || !routine.activity) {
        alert('Please fill in both time and activity');
        return;
    }
    
    try {
        console.log('📤 Sending:', { ...routine, refCode: currentRefCode });
        const response = await fetch('/api/routine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...routine, refCode: currentRefCode })
        });
        
        const data = await response.json();
        console.log('Routine added response:', data);
        
        if (response.ok) {
            // Add to local data immediately
            if (!appData.dailyRoutine) appData.dailyRoutine = [];
            appData.dailyRoutine.push(data.routine || { ...routine, id: Date.now() });
            
            document.getElementById('routineForm').reset();
            speak('Routine added successfully');
            loadRoutine();
            console.log('Routine list updated');
        } else {
            throw new Error('Failed to add routine');
        }
    } catch (error) {
        alert('Error adding routine');
        console.error(error);
    }
}

async function deleteRoutine(id) {
    if (confirm('Delete this routine item?')) {
        try {
            await fetch(`/api/routine/${id}?refCode=${currentRefCode}`, { method: 'DELETE' });
            speak('Routine deleted');
            await loadAllData();
            loadRoutine();
        } catch (error) {
            console.error(error);
        }
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

// Handle Timeline Additions
function setupTimelineEvents() {
    const btn = document.getElementById('addMomentBtn');
    const fileInput = document.getElementById('timelineMedia');
    const captionInput = document.getElementById('timelineCaption');
    
    if (!btn) {
        console.log('Add moment button not found - timeline feature might not be visible');
        return;
    }
    
    // Remove old listener
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', async () => {
        const file = fileInput?.files[0];
        const caption = captionInput?.value || '';

        if (!file && !caption.trim()) {
            alert('Please add a photo/video or a caption for the memory.');
            return;
        }

        let mediaData = null;
        let mediaType = null;

        if (file) {
            // Limit to 5MB for better performance
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
                mediaType = file.type.startsWith('video') ? 'video' : 'image';
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

        currentTimeline.push(moment);
        renderTimelinePreview();
        
        // Reset inputs
        if (fileInput) fileInput.value = '';
        if (captionInput) captionInput.value = '';
        
        console.log('Memory moment added:', moment);
    });
    
    console.log('Timeline events set up successfully');
}


function renderTimelinePreview() {
    const container = document.getElementById('timelineList');
    container.innerHTML = currentTimeline.map((moment, index) => `
        <div class="timeline-item" style="display: flex; align-items: center; margin-bottom: 10px; background: white; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
            <span style="font-weight: bold; margin-right: 10px;">${index + 1}.</span>
            ${moment.media ? 
                (moment.type === 'video' ? 
                    `<video src="${moment.media}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;"></video>` : 
                    `<img src="${moment.media}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;">`
                ) : ''
            }
            <div style="flex: 1; font-size: 0.9rem;">${moment.caption || 'No caption'}</div>
            <button type="button" onclick="removeMoment(${moment.id})" style="background: #ff4d4d; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
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
    
    // Handle Voice Note
    const voiceInput = document.getElementById('personVoice');
    let voiceData = null;
    if (voiceInput?.files[0]) {
        const voiceFile = voiceInput.files[0];
        if (voiceFile.size > 5 * 1024 * 1024) {
            alert('Voice file is too large. Please use a file under 5MB.');
            return;
        }
        try {
            voiceData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('Failed to read voice file'));
                reader.readAsDataURL(voiceFile);
            });
        } catch (error) {
            alert('Error reading voice file: ' + error.message);
            return;
        }
    }

    const person = {
        name: document.getElementById('personName').value,
        relation: document.getElementById('personRelation').value,
        photo: photoData,
        voiceNote: voiceData,
        timeline: currentTimeline,
        description: document.getElementById('personDescription').value
    };
    
    if (!person.name || !person.relation) {
        alert('Please fill in name and relation');
        return;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        const response = await fetch('/api/people', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...person, refCode: currentRefCode })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('Person added:', result);
        
        // Add to local data immediately
        if (!appData.knownPeople) appData.knownPeople = [];
        appData.knownPeople.push(result.person || person);
        
        // Reset form
        document.getElementById('peopleForm').reset();
        if (photoPreview) {
            photoPreview.innerHTML = '';
            photoPreview.dataset.photoData = '';
        }
        currentTimeline = [];
        renderTimelinePreview();
        
        // Reload people list
        loadPeople();
        
        speak('Person added successfully');
        alert('✓ Person added successfully!');
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        alert(`Error adding person: ${error.message}\n\nTip: If you added large files, try smaller ones (under 5MB).`);
        console.error('Error adding person:', error);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Add Person';
            submitBtn.disabled = false;
        }
    }
}

async function deletePerson(id) {
    if (confirm('Delete this person?')) {
        try {
            await fetch(`/api/people/${id}?refCode=${currentRefCode}`, { method: 'DELETE' });
            speak('Person deleted');
            await loadAllData();
            loadPeople();
        } catch (error) {
            console.error(error);
        }
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

async function addPlace(e) {
    e.preventDefault();
    console.log('Adding place...');
    
    const place = {
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
    
    try {
        const response = await fetch('/api/places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...place, refCode: currentRefCode })
        });
        
        const data = await response.json();
        if (response.ok) {
            // Add to local data immediately
            if (!appData.knownPlaces) appData.knownPlaces = [];
            appData.knownPlaces.push(data.place || { ...place, id: Date.now() });
            
            document.getElementById('placesForm').reset();
            speak('Place added successfully');
            loadPlaces();
            console.log('Place added');
        } else {
            throw new Error(data.error || 'Failed to add place');
        }
    } catch (error) {
        alert('Error adding place: ' + error.message);
        console.error(error);
    }
}

async function deletePlace(id) {
    if (confirm('Delete this place?')) {
        try {
            await fetch(`/api/places/${id}?refCode=${currentRefCode}`, { method: 'DELETE' });
            speak('Place deleted');
            await loadAllData();
            loadPlaces();
        } catch (error) {
            console.error(error);
        }
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
                        ${med.taken ? '<div class="list-item-detail" style="color: green;">✓ Taken</div>' : ''}
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

async function addMedicine(e) {
    e.preventDefault();
    console.log('Adding medicine...');
    
    const medicine = {
        name: document.getElementById('medicineName').value,
        time: document.getElementById('medicineTime').value,
        dosage: document.getElementById('medicineDosage').value,
        instructions: document.getElementById('medicineInstructions').value
    };
    
    if (!medicine.name || !medicine.time) {
        alert('Please fill in medicine name and time');
        return;
    }
    
    try {
        const response = await fetch('/api/medicines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...medicine, refCode: currentRefCode })
        });
        
        const data = await response.json();
        if (response.ok) {
            // Add to local data immediately
            if (!appData.medicines) appData.medicines = [];
            appData.medicines.push(data.medicine || { ...medicine, id: Date.now(), taken: false });
            
            document.getElementById('medicineForm').reset();
            speak('Medicine added successfully');
            loadMedicines();
            console.log('Medicine added');
        } else {
            throw new Error(data.error || 'Failed to add medicine');
        }
    } catch (error) {
        alert('Error adding medicine: ' + error.message);
        console.error(error);
    }
}

async function deleteMedicine(id) {
    if (confirm('Delete this medicine?')) {
        try {
            await fetch(`/api/medicines/${id}?refCode=${currentRefCode}`, { method: 'DELETE' });
            speak('Medicine deleted');
            await loadAllData();
            loadMedicines();
        } catch (error) {
            console.error(error);
        }
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
            .map(apt => {
                return `
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
            `}).join('');
    } else {
        list.innerHTML = '<p>No appointments scheduled yet.</p>';
    }
}

async function addAppointment(e) {
    e.preventDefault();
    console.log('Adding appointment...');
    
    const appointment = {
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
    
    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...appointment, refCode: currentRefCode })
        });
        
        const data = await response.json();
        if (response.ok) {
            // Add to local data immediately
            if (!appData.appointments) appData.appointments = [];
            appData.appointments.push(data.appointment || { ...appointment, id: Date.now() });
            
            speak('Appointment added successfully');
            document.getElementById('appointmentForm').reset();
            loadAppointments();
            console.log('Appointment added');
        } else {
            throw new Error(data.error || 'Failed to add appointment');
        }
    } catch (error) {
        alert('Error adding appointment: ' + error.message);
    };
    
    try {
        await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...appointment, refCode: currentRefCode })
        });
        
        speak('Appointment added successfully');
        document.getElementById('appointmentForm').reset();
        await loadAllData();
        loadAppointments();
    } catch (error) {
        alert('Error adding appointment');
        console.error(error);
    }
}

async function deleteAppointment(id) {
    if (confirm('Delete this appointment?')) {
        try {
            await fetch(`/api/appointments/${id}?refCode=${currentRefCode}`, { method: 'DELETE' });
            speak('Appointment deleted');
            await loadAllData();
            loadAppointments();
        } catch (error) {
            console.error(error);
        }
    }
}

async function addContact(e) {
    e.preventDefault();
    
    const photoPreview = document.getElementById('contactPhotoPreview');
    const photoData = photoPreview.dataset.photoData || '';
    
    const contact = {
        name: document.getElementById('contactName').value,
        phone: document.getElementById('contactPhone').value,
        relation: document.getElementById('contactRelation').value,
        photo: photoData
    };
    
    try {
        await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...contact, refCode: currentRefCode })
        });
        
        document.getElementById('contactsForm').reset();
        photoPreview.innerHTML = '';
        speak('Contact added successfully');
        photoPreview.dataset.photoData = '';
        await loadAllData();
        loadContacts();
    } catch (error) {
        alert('Error adding contact');
        console.error(error);
    }
}

async function deleteContact(id) {
    if (confirm('Delete this contact?')) {
        try {
            await fetch(`/api/contacts/${id}?refCode=${currentRefCode}`, { method: 'DELETE' });
            speak('Contact deleted');
            await loadAllData();
            loadContacts();
        } catch (error) {
            console.error(error);
        }
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
    
    // Initialize Home Map if tab is visible
    // We'll use a timeout to ensure the div is visible
    setTimeout(initHomeMap, 500);
}

function initHomeMap() {
    const mapContainer = document.getElementById('homeMap');
    if (!mapContainer) return;

    if (homeMap) {
        // Map already exists, just refresh it
        setTimeout(() => homeMap.invalidateSize(), 100);
        return;
    }

    // Default to a central location or existing home location
    const initialLat = appData.homeLocation ? appData.homeLocation.lat : 17.3850; // Hyderabad default
    const initialLng = appData.homeLocation ? appData.homeLocation.lng : 78.4867;

    homeMap = L.map('homeMap').setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(homeMap);

    // Add marker if location exists
    if (appData.homeLocation) {
        homeMarker = L.marker([appData.homeLocation.lat, appData.homeLocation.lng]).addTo(homeMap);
        document.getElementById('homeAddress').value = appData.homeLocation.address || 'Saved Location';
        document.getElementById('homeLat').value = appData.homeLocation.lat;
        document.getElementById('homeLng').value = appData.homeLocation.lng;
    }

    // Try to get user's current location if no home location set
    if (!appData.homeLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            homeMap.setView([lat, lng], 15);
        });
    }

    // Click to set home
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

        // Reverse Geocoding
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

document.getElementById('saveHomeBtn').addEventListener('click', async () => {
    const lat = document.getElementById('homeLat').value;
    const lng = document.getElementById('homeLng').value;
    const address = document.getElementById('homeAddress').value;

    if (!lat || !lng) {
        alert('Please click on the map to select a home location.');
        return;
    }

    try {
        await fetch('/api/home-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: parseFloat(lat), lng: parseFloat(lng), address, refCode: currentRefCode })
        });
        speak('Home location saved successfully');
        alert('Home location saved!');
        await loadAllData();
    } catch (error) {
        console.error(error);
        alert('Error saving home location');
    }
});

async function saveChargingTime() {
    const time = document.getElementById('chargingTime').value;
    
    try {
        await fetch('/api/watch-charging', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time, refCode: currentRefCode })
        });
        speak('Charging time saved successfully');
        
        alert('✓ Charging time saved!');
        await loadAllData();
    } catch (error) {
        alert('Error saving charging time');
        console.error(error);
    }
}

function loadRecentAlerts() {
    const container = document.getElementById('recentAlerts');
    let alerts = [];
    
    // Combine all alerts
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
    
    // Sort by timestamp
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (alerts.length > 0) {
        container.innerHTML = alerts.slice(0, 10).map(alert => {
            let title = '';
            let content = '';
            
            switch(alert.type) {
                case 'sos': title = '🆘 SOS Alert'; content = 'Location: ' + (alert.location?.latitude || 'N/A'); break;
                case 'lost': title = '🗺️ Lost Alert'; content = 'Location: ' + (alert.location?.latitude || 'N/A'); break;
                case 'medicine': title = '💊 Missed Medicine'; content = alert.medicineName; break;
                case 'security': title = '⚠️ Unknown Person Detected'; content = 'Location: ' + (alert.location?.latitude || 'N/A'); break;
            }
            
            return `
            <div class="alert-item ${alert.type}">
                <strong>${title}</strong><br>
                ${content}<br>
                <small>${new Date(alert.timestamp).toLocaleString()}</small>
            </div>
        `}).join('');
    } else {
        container.innerHTML = '<p>No recent alerts.</p>';
    }
}
