/**
 * Cross-Browser Storage Sync Module
 * Syncs data between different browsers using Firebase
 * NO UI CHANGES - Just adds backend sync
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCU4T70whXMPHKQbspSEpwCTfhtpnjMwcg",
    authDomain: "memorycare-1696d.firebaseapp.com",
    databaseURL: "https://memorycare-1696d-default-rtdb.firebaseio.com",
    projectId: "memorycare-1696d",
    storageBucket: "memorycare-1696d.firebasestorage.app",
    messagingSenderId: "324446449878",
    appId: "1:324446449878:web:07cf7f2855c63ff0115977",
    measurementId: "G-023CMGB3G4"
};

let db = null;

// Initialize Firebase
async function initCrossBrowserSync() {
    try {
        console.log('🚀 Initializing cross-browser sync...');
        
        if (typeof firebase === 'undefined') {
            console.log('📦 Loading Firebase scripts...');
            await loadFirebaseScripts();
        }
        
        if (!firebase.apps.length) {
            console.log('🔥 Initializing Firebase app...');
            firebase.initializeApp(firebaseConfig);
        }
        
        db = firebase.database();
        console.log('✅ Firebase database connected');
        console.log('✅ Cross-browser sync enabled');
        
        // Override localStorage methods to also sync with Firebase
        setupAutoSync();
        
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.log('⚠️ Using local-only storage');
        return false;
    }
}

// Load Firebase scripts
function loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js'
        ];
        
        let loaded = 0;
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loaded++;
                if (loaded === scripts.length) resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    });
}

// Setup automatic sync
function setupAutoSync() {
    console.log('⚙️ Setting up auto-sync interceptor...');
    
    // Intercept memorycare_ localStorage writes
    const originalSetItem = Storage.prototype.setItem;
    
    Storage.prototype.setItem = function(key, value) {
        // Call original
        originalSetItem.call(this, key, value);
        
        // Sync to Firebase if it's a memorycare key
        if (key.startsWith('memorycare_') && db) {
            console.log('📤 Auto-sync triggered for:', key);
            syncToFirebase(key, value).catch(err => {
                console.error('Auto-sync failed:', err);
            });
        }
    };
    
    console.log('✅ Auto-sync interceptor active');
}

// Sync data to Firebase
async function syncToFirebase(key, value) {
    if (!db) {
        console.warn('⚠️ Firebase not initialized, cannot sync:', key);
        return false;
    }
    
    try {
        console.log('🔄 Syncing to Firebase:', key, 'Length:', value?.length || 0);
        
        await db.ref('sessions/' + key).set({
            data: value,
            timestamp: Date.now()
        });
        
        console.log('✅ Successfully synced to cloud:', key);
        return true;
    } catch (error) {
        console.error('❌ Firebase sync failed:', error.message);
        console.error('Error details:', error);
        return false;
    }
}

// Load data from Firebase
async function loadFromFirebase(key) {
    if (!db) return null;
    
    try {
        const snapshot = await db.ref('sessions/' + key).once('value');
        const data = snapshot.val();
        
        if (data && data.data) {
            console.log('☁️ Loaded from cloud:', key);
            // Save to localStorage for offline access
            localStorage.setItem(key, data.data);
            return data.data;
        }
    } catch (error) {
        console.error('Load error:', error);
    }
    
    return null;
}

// Enhanced localStorage.getItem that checks cloud
async function getItemWithSync(key) {
    // ALWAYS check Firebase first for latest data
    if (key.startsWith('memorycare_') && db) {
        console.log('☁️ Fetching latest from Firebase:', key);
        const cloudData = await loadFromFirebase(key);
        if (cloudData) {
            return cloudData; // Already saved to localStorage by loadFromFirebase
        }
    }
    
    // Fallback to localStorage if Firebase unavailable or no data
    console.log('📱 Using localStorage for:', key);
    return localStorage.getItem(key);
}

// Setup real-time listener for data changes
function setupRealtimeSync(key, callback) {
    if (!db) {
        console.warn('⚠️ Firebase not initialized, cannot setup real-time sync');
        return null;
    }
    
    console.log('👂 Setting up real-time listener for:', key);
    
    const ref = db.ref('sessions/' + key);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data && data.data) {
            console.log('🔄 Real-time update received for:', key);
            console.log('📊 Data timestamp:', new Date(data.timestamp).toLocaleTimeString());
            
            // Update localStorage
            const oldData = localStorage.getItem(key);
            if (oldData !== data.data) {
                localStorage.setItem(key, data.data);
                console.log('✅ Local data updated from cloud');
                
                // Call callback if provided
                if (callback && typeof callback === 'function') {
                    callback(data.data);
                }
            }
        }
    });
    
    console.log('✅ Real-time sync active for:', key);
    
    return ref; // Return reference so it can be turned off later
}

// Stop real-time listener
function stopRealtimeSync(ref) {
    if (ref) {
        ref.off('value');
        console.log('🔇 Real-time sync stopped');
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.initCrossBrowserSync = initCrossBrowserSync;
    window.getItemWithSync = getItemWithSync;
    window.syncToFirebase = syncToFirebase;
    window.setupRealtimeSync = setupRealtimeSync;
    window.stopRealtimeSync = stopRealtimeSync;
}
