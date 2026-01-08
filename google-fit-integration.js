/**
 * Google Fit Integration for Health Data
 * Fetches steps, heart rate, sleep, calories from Google Fit
 * Separate module - does not modify existing website
 */

const GOOGLE_FIT_CONFIG = {
    CLIENT_ID: '565981994704-iv9eijdf9t6c27mlnuktvtjlutsl8lr6.apps.googleusercontent.com',
    SCOPES: [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
        'https://www.googleapis.com/auth/fitness.body.read'
    ],
    DATA_SOURCES: {
        STEPS: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
        HEART_RATE: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
        CALORIES: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
        SLEEP: 'derived:com.google.sleep.segment:com.google.android.gms:merged'
    }
};

let healthData = {
    steps: 0,
    stepGoal: 5000,
    heartRate: 0,
    calories: 0,
    calorieGoal: 2000,
    sleep: 0,
    lastUpdate: null
};

// Initialize Google Fit
async function initGoogleFit() {
    console.log('🏃 Initializing Google Fit integration...');
    
    // Check if running in Android WebView with Capacitor
    if (typeof Capacitor !== 'undefined') {
        // Use Capacitor plugin for native Android integration
        await initGoogleFitNative();
    } else {
        // Use Web OAuth for browser testing
        await initGoogleFitWeb();
    }
}

// Native Android integration (Capacitor)
async function initGoogleFitNative() {
    console.log('📱 Using native Google Fit integration');
    
    try {
        // Request Google Fit permissions
        const result = await Capacitor.Plugins.GoogleFit.requestPermissions({
            scopes: GOOGLE_FIT_CONFIG.SCOPES
        });
        
        if (result.granted) {
            console.log('✅ Google Fit permissions granted');
            startHealthDataSync();
        } else {
            console.error('❌ Google Fit permissions denied');
        }
    } catch (error) {
        console.error('Error initializing Google Fit:', error);
    }
}

// Web OAuth integration (for testing in browser)
async function initGoogleFitWeb() {
    console.log('🌐 Using web OAuth for Google Fit');
    
    // Load Google API client
    if (typeof gapi === 'undefined') {
        console.log('Loading Google API client...');
        await loadScript('https://apis.google.com/js/api.js');
        
        await new Promise((resolve) => {
            gapi.load('client:auth2', resolve);
        });
        
        await gapi.client.init({
            clientId: GOOGLE_FIT_CONFIG.CLIENT_ID,
            scope: GOOGLE_FIT_CONFIG.SCOPES.join(' ')
        });
        
        console.log('✅ Google API client loaded');
    }
    
    // Sign in
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        await gapi.auth2.getAuthInstance().signIn();
    }
    
    startHealthDataSync();
}

// Start syncing health data
function startHealthDataSync() {
    console.log('🔄 Starting health data sync...');
    
    // Initial fetch
    fetchAllHealthData();
    
    // Sync every 5 minutes
    setInterval(fetchAllHealthData, 5 * 60 * 1000);
}

// Fetch all health data
async function fetchAllHealthData() {
    console.log('📊 Fetching health data from Google Fit...');
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startTime = today.getTime();
        const endTime = Date.now();
        
        // Fetch steps
        const steps = await fetchSteps(startTime, endTime);
        healthData.steps = steps;
        
        // Fetch heart rate
        const heartRate = await fetchHeartRate();
        healthData.heartRate = heartRate;
        
        // Fetch calories
        const calories = await fetchCalories(startTime, endTime);
        healthData.calories = calories;
        
        // Fetch sleep
        const sleep = await fetchSleep();
        healthData.sleep = sleep;
        
        healthData.lastUpdate = Date.now();
        
        console.log('✅ Health data updated:', healthData);
        
        // Update trigger state
        if (typeof triggerState !== 'undefined') {
            triggerState.healthDataLastSync = Date.now();
            triggerState.lastActivityTime = Date.now() - (steps > 0 ? 0 : 2 * 60 * 60 * 1000);
        }
        
        // Check health-based triggers
        checkHealthTriggers();
        
        // Store for display
        localStorage.setItem('health_data', JSON.stringify(healthData));
        
    } catch (error) {
        console.error('Error fetching health data:', error);
    }
}

// Fetch steps from Google Fit
async function fetchSteps(startTime, endTime) {
    if (typeof Capacitor !== 'undefined') {
        // Native Android
        const result = await Capacitor.Plugins.GoogleFit.getSteps({
            startTime,
            endTime
        });
        return result.steps || 0;
    } else {
        // Web API
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            method: 'POST',
            body: {
                aggregateBy: [{
                    dataSourceId: GOOGLE_FIT_CONFIG.DATA_SOURCES.STEPS
                }],
                bucketByTime: { durationMillis: endTime - startTime },
                startTimeMillis: startTime,
                endTimeMillis: endTime
            }
        });
        
        const steps = response.result.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
        return steps;
    }
}

// Fetch heart rate from Google Fit
async function fetchHeartRate() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    if (typeof Capacitor !== 'undefined') {
        const result = await Capacitor.Plugins.GoogleFit.getHeartRate({
            startTime: oneHourAgo,
            endTime: now
        });
        return result.heartRate || 0;
    } else {
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/fitness/v1/users/me/dataSources/' + 
                  GOOGLE_FIT_CONFIG.DATA_SOURCES.HEART_RATE + '/datasets/' + 
                  oneHourAgo + '000000-' + now + '000000',
            method: 'GET'
        });
        
        const points = response.result.point || [];
        if (points.length > 0) {
            return points[points.length - 1].value[0].fpVal;
        }
        return 0;
    }
}

// Fetch calories from Google Fit
async function fetchCalories(startTime, endTime) {
    if (typeof Capacitor !== 'undefined') {
        const result = await Capacitor.Plugins.GoogleFit.getCalories({
            startTime,
            endTime
        });
        return result.calories || 0;
    } else {
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            method: 'POST',
            body: {
                aggregateBy: [{
                    dataSourceId: GOOGLE_FIT_CONFIG.DATA_SOURCES.CALORIES
                }],
                bucketByTime: { durationMillis: endTime - startTime },
                startTimeMillis: startTime,
                endTimeMillis: endTime
            }
        });
        
        const calories = response.result.bucket[0]?.dataset[0]?.point[0]?.value[0]?.fpVal || 0;
        return Math.round(calories);
    }
}

// Fetch sleep from Google Fit
async function fetchSleep() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = today.getTime() - (24 * 60 * 60 * 1000);
    const now = Date.now();
    
    if (typeof Capacitor !== 'undefined') {
        const result = await Capacitor.Plugins.GoogleFit.getSleep({
            startTime: yesterday,
            endTime: now
        });
        return result.sleepMinutes || 0;
    } else {
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/fitness/v1/users/me/sessions',
            method: 'GET',
            params: {
                startTime: new Date(yesterday).toISOString(),
                endTime: new Date(now).toISOString(),
                activityType: 72 // Sleep activity type
            }
        });
        
        const sessions = response.result.session || [];
        const totalSleep = sessions.reduce((total, session) => {
            const duration = parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis);
            return total + duration;
        }, 0);
        
        return Math.round(totalSleep / (60 * 1000)); // Convert to minutes
    }
}

// Check health-based triggers
function checkHealthTriggers() {
    // Steps-based triggers
    if (healthData.steps >= healthData.stepGoal) {
        console.log('✅ Daily step goal achieved!');
    }
    
    const currentHour = new Date().getHours();
    if (currentHour >= 12 && healthData.steps < 1000) {
        if (typeof fireTrigger !== 'undefined' && typeof TRIGGERS !== 'undefined') {
            // Low activity warning (trigger would be added to TRIGGERS)
            console.log('⚠️ Low activity warning');
        }
    }
    
    // Heart rate triggers
    if (healthData.heartRate > 120) {
        console.log('⚠️ High heart rate detected:', healthData.heartRate);
    } else if (healthData.heartRate > 0 && healthData.heartRate < 45) {
        console.log('⚠️ Low heart rate detected:', healthData.heartRate);
    }
    
    // Sleep triggers
    const sleepHours = healthData.sleep / 60;
    if (sleepHours > 0 && sleepHours < 6) {
        console.log('⚠️ Poor sleep detected:', sleepHours, 'hours');
    } else if (sleepHours >= 8) {
        console.log('✅ Excellent sleep:', sleepHours, 'hours');
    }
    
    // Calories trigger
    if (healthData.calories >= healthData.calorieGoal) {
        console.log('✅ Calorie goal achieved!');
    } else if (currentHour >= 18 && healthData.calories < (healthData.calorieGoal * 0.5)) {
        console.log('⚠️ Low calorie burn by 6 PM');
    }
}

// Load external script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Get current health data
function getHealthData() {
    return healthData;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGoogleFit, getHealthData, healthData };
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🏥 Health module loaded');
        // Don't auto-init, wait for user action to avoid permission prompts
    });
}
