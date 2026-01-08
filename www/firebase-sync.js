/**
 * Firebase Cloud Storage Integration for MemoryCare App
 * Syncs ALL data between localStorage and Firebase
 */

// Firebase Config (matching firebase-config.json)
const firebaseConfig = {
    apiKey: "AIzaSyD6eGCuIPrCdgLBGGdcQxBqmNiZdl9iLcI",
    authDomain: "memorycare-1696d.firebaseapp.com",
    databaseURL: "https://memorycare-1696d-default-rtdb.firebaseio.com",
    projectId: "memorycare-1696d",
    storageBucket: "memorycare-1696d.appspot.com",
    messagingSenderId: "565981994704",
    appId: "1:565981994704:web:97dc6f8f43ad70b27b7b5a"
};

// Initialize Firebase
let firebaseApp = null;
let firebaseDB = null;
let firebaseInitialized = false;

console.log('🔥 Firebase Sync Module Loading...');

// Initialize Firebase when ready
async function initializeFirebase() {
    try {
        console.log('🔥 Initializing Firebase...');
        
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded!');
            return false;
        }
        
        // Initialize app
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized');
        } else {
            firebaseApp = firebase.app();
            console.log('✅ Firebase app already initialized');
        }
        
        // Initialize database
        firebaseDB = firebase.database();
        firebaseInitialized = true;
        console.log('✅ Firebase database ready');
        
        return true;
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        firebaseInitialized = false;
        return false;
    }
}

// Save data to BOTH localStorage AND Firebase
async function saveData(key, value) {
    console.log('💾 Saving data:', key);
    
    try {
        // 1. Save to localStorage FIRST (always works)
        const fullKey = 'memorycare_' + key;
        localStorage.setItem(fullKey, JSON.stringify(value));
        console.log('✅ Saved to localStorage:', fullKey);
        
        // 2. Save to Firebase (if initialized)
        if (firebaseInitialized && firebaseDB) {
            try {
                await firebaseDB.ref(key).set(value);
                console.log('✅ Saved to Firebase:', key);
                showSyncSuccess('Data synced to cloud');
            } catch (fbError) {
                console.warn('⚠️ Firebase save failed:', fbError);
                showSyncWarning('Cloud sync failed - data saved locally');
            }
        } else {
            console.log('⚠️ Firebase not initialized - saved locally only');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Save failed:', error);
        return false;
    }
}

// Load data from Firebase FIRST, fallback to localStorage
async function loadData(key) {
    console.log('📖 Loading data:', key);
    
    try {
        // 1. Try Firebase FIRST (cloud data is most recent)
        if (firebaseInitialized && firebaseDB) {
            try {
                const snapshot = await firebaseDB.ref(key).once('value');
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log('✅ Loaded from Firebase:', key);
                    
                    // Also update localStorage with cloud data
                    const fullKey = 'memorycare_' + key;
                    localStorage.setItem(fullKey, JSON.stringify(data));
                    
                    return data;
                }
            } catch (fbError) {
                console.warn('⚠️ Firebase load failed:', fbError);
            }
        }
        
        // 2. Fallback to localStorage
        const fullKey = 'memorycare_' + key;
        const localData = localStorage.getItem(fullKey);
        if (localData) {
            try {
                // Only parse real JSON; reference codes and other plain strings must not be parsed.
                if (typeof localData === 'string' && (localData.startsWith('{') || localData.startsWith('['))) {
                    const data = JSON.parse(localData);
                    console.log('✅ Loaded from localStorage:', fullKey);
                    return data;
                }

                console.log('✅ Loaded plain string from localStorage:', fullKey);
                return localData;
            } catch (e) {
                console.warn('⚠️ localStorage data is not valid JSON for:', fullKey);
                return localData;
            }
        }
        
        console.log('⚠️ No data found for:', key);
        return null;
        
    } catch (error) {
        console.error('❌ Load failed:', error);
        return null;
    }
}

// Sync ALL caregiver data to Firebase
async function syncCaregiverData(caregiverCode) {
    console.log('🔄 Syncing caregiver data:', caregiverCode);
    
    try {
        // Load all local data
        const sessionKey = 'memorycare_session_' + caregiverCode;
        const sessionData = localStorage.getItem(sessionKey);
        
        if (!sessionData) {
            console.warn('⚠️ No session data found');
            return false;
        }

        let data;
        try {
            if (typeof sessionData === 'string' && (sessionData.startsWith('{') || sessionData.startsWith('['))) {
                data = JSON.parse(sessionData);
            } else {
                console.warn('⚠️ Session data is not JSON, skipping cloud sync for:', sessionKey);
                return false;
            }
        } catch (e) {
            console.warn('⚠️ Session data parse failed, skipping cloud sync for:', sessionKey);
            return false;
        }
        
        // Sync to Firebase
        await saveData('session_' + caregiverCode, data);
        
        console.log('✅ Caregiver data synced successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        return false;
    }
}

// Sync ALL patient data to Firebase
async function syncPatientData(patientCode) {
    console.log('🔄 Syncing patient data:', patientCode);
    
    try {
        // Load all local data
        const patientKey = 'memorycare_patient_' + patientCode;
        const patientData = localStorage.getItem(patientKey);
        
        if (!patientData) {
            console.warn('⚠️ No patient data found');
            return false;
        }

        let data;
        try {
            if (typeof patientData === 'string' && (patientData.startsWith('{') || patientData.startsWith('['))) {
                data = JSON.parse(patientData);
            } else {
                console.warn('⚠️ Patient data is not JSON, skipping cloud sync for:', patientKey);
                return false;
            }
        } catch (e) {
            console.warn('⚠️ Patient data parse failed, skipping cloud sync for:', patientKey);
            return false;
        }
        
        // Sync to Firebase
        await saveData('patient_' + patientCode, data);
        
        console.log('✅ Patient data synced successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        return false;
    }
}

// Auto-sync on data change
function enableAutoSync() {
    console.log('🔄 Auto-sync DISABLED - using manual sync only to prevent JSON errors');
    
    // COMPLETELY DISABLED to prevent any JSON parsing issues
    // Data will sync via saveDataToLocal() calling syncToFirebase() manually
}

// Success notification
function showSyncSuccess(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    notif.textContent = '☁️ ' + message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// Warning notification
function showSyncWarning(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #FF9800;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    notif.textContent = '⚠️ ' + message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Starting Firebase initialization...');
    const success = await initializeFirebase();
    
    if (success) {
        console.log('✅ Firebase ready - enabling auto-sync');
        enableAutoSync();
        showSyncSuccess('Cloud sync active');
    } else {
        console.warn('⚠️ Firebase failed - using local storage only');
        showSyncWarning('Offline mode - data saved locally');
    }
});

console.log('✅ Firebase Sync Module Ready');
