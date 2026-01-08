/**
 * VOICE ASSISTANT - TALK AND LISTEN
 * Complete voice interaction system with speech recognition
 */

console.log('🎤 Voice Assistant Loading...');

// Voice assistant state
const voiceAssistant = {
    recognition: null,
    isListening: false,
    continuousMode: false,
    lastCommand: null,
    conversationContext: null
};

// Initialize speech recognition
function initVoiceRecognition() {
    console.log('🎤 Initializing voice recognition...');
    
    try {
        // Check for speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('⚠️ Speech recognition not supported in this browser');
            console.log('💡 Tip: Voice recognition works best in Chrome/Edge on Android');
            return false;
        }
        
        // Check if already initialized
        if (voiceAssistant.recognition) {
            console.log('✅ Voice recognition already initialized');
            return true;
        }
        
        // Create recognition instance
        voiceAssistant.recognition = new SpeechRecognition();
        
        // Configure recognition
        voiceAssistant.recognition.continuous = false; // Stop after one result
        voiceAssistant.recognition.interimResults = false; // Only final results
        voiceAssistant.recognition.lang = 'en-US';
        voiceAssistant.recognition.maxAlternatives = 1;
        
        // Handle recognition results
        voiceAssistant.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            const confidence = event.results[0][0].confidence;
            
            console.log('🎤 Heard:', transcript, '(confidence:', confidence + ')');
            
            // Process the command
            processVoiceCommand(transcript);
        };
        
        // Handle recognition start
        voiceAssistant.recognition.onstart = () => {
            console.log('🎤 Listening started...');
            voiceAssistant.isListening = true;
            showListeningIndicator(true);
        };
        
        // Handle recognition end
        voiceAssistant.recognition.onend = () => {
            console.log('🎤 Listening stopped');
            voiceAssistant.isListening = false;
            showListeningIndicator(false);
            
            // Restart if in continuous mode
            if (voiceAssistant.continuousMode) {
                setTimeout(() => {
                    startListening();
                }, 1000);
            }
        };
        
        // Handle recognition errors
        voiceAssistant.recognition.onerror = (event) => {
            console.error('🎤 Recognition error:', event.error);
            voiceAssistant.isListening = false;
            showListeningIndicator(false);
            
            // Auto-retry on certain errors
            if (event.error === 'no-speech' || event.error === 'network') {
                setTimeout(() => {
                    if (voiceAssistant.continuousMode) {
                        startListening();
                    }
                }, 2000);
            }
        };
        
        console.log('✅ Voice recognition initialized');
        return true;
        
    } catch (error) {
        console.error('❌ Voice recognition initialization failed:', error);
        return false;
    }
}

// Start listening
function startListening() {
    if (!voiceAssistant.recognition) {
        console.warn('⚠️ Recognition not initialized');
        return false;
    }
    
    if (voiceAssistant.isListening) {
        console.log('⚠️ Already listening');
        return false;
    }
    
    try {
        voiceAssistant.recognition.start();
        console.log('🎤 Started listening...');
        return true;
    } catch (error) {
        console.error('❌ Failed to start listening:', error);
        return false;
    }
}

// Stop listening
function stopListening() {
    if (!voiceAssistant.recognition) return;
    
    try {
        voiceAssistant.recognition.stop();
        voiceAssistant.isListening = false;
        showListeningIndicator(false);
        console.log('🎤 Stopped listening');
    } catch (error) {
        console.error('❌ Failed to stop listening:', error);
    }
}

// Enable continuous listening
function enableContinuousListening() {
    voiceAssistant.continuousMode = true;
    console.log('🎤 Continuous listening enabled');
    startListening();
}

// Disable continuous listening
function disableContinuousListening() {
    voiceAssistant.continuousMode = false;
    stopListening();
    console.log('🎤 Continuous listening disabled');
}

// Safe function caller - prevents errors
function safeCall(functionName, ...args) {
    try {
        if (typeof window[functionName] === 'function') {
            window[functionName](...args);
            return true;
        } else {
            console.warn('⚠️ Function not found:', functionName);
            return false;
        }
    } catch (error) {
        console.error('❌ Error calling', functionName, ':', error);
        return false;
    }
}

// Safe speak function - uses patient.js speak if available
function safeSpeakAndRespond(text, listenAfter = false) {
    try {
        // Try patient.js speak function first
        if (typeof window.speak === 'function') {
            window.speak(text);
        } else {
            // Fallback to basic speech synthesis
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
        
        // Listen after speaking if requested
        if (listenAfter && voiceAssistant.recognition) {
            utterance.onend = () => {
                setTimeout(() => startListening(), 500);
            };
        }
    } catch (error) {
        console.error('❌ Speech error:', error);
    }
}

// Process voice commands
function processVoiceCommand(transcript) {
    console.log('🧠 Processing command:', transcript);
    
    voiceAssistant.lastCommand = transcript;
    
    // BATHROOM COMMANDS
    if (transcript.includes('bathroom') || transcript.includes('toilet') || transcript.includes('washroom')) {
        console.log('🚽 Bathroom command detected');
        safeSpeakAndRespond("Okay, take your time in the bathroom.");
        
        // Trigger bathroom monitoring
        safeCall('bathroomStarted');
        return;
    }
    
    // HELP/LOST COMMANDS
    if (transcript.includes('help') || transcript.includes('lost') || transcript.includes('where am i')) {
        console.log('🆘 Help command detected');
        safeSpeakAndRespond("Don't worry, I'm getting your location and sending help.");
        
        // Trigger help mode
        safeCall('handleSOSClick');
        return;
    }
    
    // MEDICINE COMMANDS
    if (transcript.includes('medicine') || transcript.includes('medication') || transcript.includes('pill')) {
        console.log('💊 Medicine command detected');
        safeSpeakAndRespond("Let me show you your medicines.");
        
        // Open medicine modal
        safeCall('openModal', 'medicineModal');
        return;
    }
    
    // ROUTINE COMMANDS
    if (transcript.includes('routine') || transcript.includes('schedule') || transcript.includes('what should i do')) {
        console.log('📅 Routine command detected');
        safeSpeakAndRespond("Here is your daily routine.");
        
        // Open routine modal
        safeCall('openModal', 'routineModal');
        return;
    }
    
    // WHO IS THIS COMMANDS
    if (transcript.includes('who is') || transcript.includes('identify') || transcript.includes('recognize')) {
        console.log('📸 Face recognition command detected');
        safeSpeakAndRespond("Let me help you identify this person. Please show me their face.");
        
        // Open face recognition
        safeCall('openFaceRecognition');
        return;
    }
    
    // PEOPLE COMMANDS
    if (transcript.includes('people') || transcript.includes('family') || transcript.includes('friends')) {
        console.log('👥 People command detected');
        safeSpeakAndRespond("Here are the people you know.");
        
        // Open people modal
        safeCall('openModal', 'peopleModal');
        return;
    }
    
    // TIME/DATE COMMANDS
    if (transcript.includes('what time') || transcript.includes('what day') || transcript.includes('date')) {
        console.log('🕐 Time command detected');
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        safeSpeakAndRespond(`It is ${timeStr} on ${dateStr}.`);
        return;
    }
    
    // LOCATION COMMANDS
    if (transcript.includes('where') || transcript.includes('location')) {
        console.log('📍 Location command detected');
        safeSpeakAndRespond("I'm checking your location now.");
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    safeSpeakAndRespond("I have your location. You are safe.");
                },
                (error) => {
                    safeSpeakAndRespond("I'm having trouble getting your location. Stay where you are.");
                }
            );
        }
        return;
    }
    
    // YES/NO RESPONSES (for conversation)
    if (transcript.includes('yes') || transcript.includes('yeah') || transcript.includes('okay')) {
        console.log('✅ Affirmative response');
        
        // Context-based response
        if (voiceAssistant.conversationContext === 'bathroom_check') {
            safeSpeakAndRespond("Good. Let me know if you need anything.");
            voiceAssistant.conversationContext = null;
        } else {
            safeSpeakAndRespond("Okay, good.");
        }
        return;
    }
    
    // KITCHEN PURPOSE RESPONSE
    if (voiceAssistant.conversationContext === 'kitchen_purpose') {
        console.log('🍳 Kitchen purpose heard:', transcript);
        
        // Save what they said they're doing (silently for later)
        if (typeof indoorLocation !== 'undefined') {
            indoorLocation.kitchenPurpose = transcript;
            indoorLocation.kitchenPurposeTime = Date.now();
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('kitchen_purpose', transcript);
        localStorage.setItem('kitchen_purpose_time', Date.now().toString());
        
        console.log('💾 Saved kitchen purpose silently - will remind only if confused');
        
        // Simple acknowledgment without repeating what they said
        safeSpeakAndRespond("Okay", false);
        voiceAssistant.conversationContext = null;
        return;
    }
    
    if (transcript.includes('no')) {
        console.log('❌ Negative response');
        
        if (voiceAssistant.conversationContext === 'bathroom_check') {
            safeSpeakAndRespond("Okay. Take your time and let me know when you're done.");
            voiceAssistant.conversationContext = null;
        } else {
            safeSpeakAndRespond("Okay, no problem.");
        }
        return;
    }
    
    // UNKNOWN COMMAND
    console.log('❓ Unknown command');
    safeSpeakAndRespond("I didn't understand that. You can ask for help, medicines, routine, or say you need the bathroom.");
}

// Speak and then listen for response (LEGACY - redirects to safeSpeakAndRespond)
function speakAndRespond(text, listenAfter = false) {
    console.log('💬 Speaking (legacy):', text);
    safeSpeakAndRespond(text, listenAfter);
}

// Ask a question and wait for response
function askQuestion(question, context = null) {
    voiceAssistant.conversationContext = context;
    safeSpeakAndRespond(question, true);
}

// Show listening indicator
function showListeningIndicator(show) {
    let indicator = document.getElementById('listeningIndicator');
    
    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'listeningIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 50px;
                border-radius: 20px;
                font-size: 24px;
                font-weight: bold;
                z-index: 999999;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                animation: pulse 1.5s infinite;
            `;
            indicator.innerHTML = '🎤 Listening...';
            document.body.appendChild(indicator);
            
            // Add pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                }
            `;
            document.head.appendChild(style);
        }
        indicator.style.display = 'block';
    } else {
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
}

// Add voice button to UI
function addVoiceButton() {
    const voiceBtn = document.createElement('button');
    voiceBtn.id = 'voiceAssistantBtn';
    voiceBtn.innerHTML = '🎤';
    voiceBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 32px;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: all 0.3s;
    `;
    
    voiceBtn.onclick = () => {
        if (voiceAssistant.isListening) {
            stopListening();
            voiceBtn.innerHTML = '🎤';
            voiceBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else {
            startListening();
            voiceBtn.innerHTML = '🔴';
            voiceBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)';
        }
    };
    
    document.body.appendChild(voiceBtn);
    console.log('✅ Voice button added to UI');
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎤 Initializing voice assistant...');
    
    setTimeout(() => {
        const initialized = initVoiceRecognition();
        
        if (initialized) {
            addVoiceButton();
            console.log('✅ Voice assistant ready!');
            
            // Welcome message (only in desktop, not on mobile to avoid annoying user)
            if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                setTimeout(() => {
                    safeSpeakAndRespond('Voice assistant is ready. Click the microphone to talk.');
                }, 2000);
            }
        } else {
            console.warn('⚠️ Voice assistant not available on this device');
        }
    }, 3000);
});

// Export functions
window.voiceAssistant = {
    startListening,
    stopListening,
    enableContinuousListening,
    disableContinuousListening,
    askQuestion,
    speak: safeSpeakAndRespond,
    safeCall,
    isListening: () => voiceAssistant.isListening
};

console.log('✅ Voice Assistant Module Loaded');
