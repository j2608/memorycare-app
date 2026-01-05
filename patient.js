// ============================================
// PATIENT INTERFACE JAVASCRIPT
// All features with voice support, reminders, and safety
// ============================================

console.log('🚀 PATIENT.JS FILE LOADED - TOP OF FILE');

let currentLanguage = 'en';
let patientData = {};
let medicineCheckInterval;
let watchCheckInterval;
let map = null;
let marker = null;
let currentRefCode = localStorage.getItem('patientRefCode') || null;

console.log('📱 Initial currentRefCode from localStorage:', currentRefCode);

// Immediate check - show modal if no reference code
if (!currentRefCode) {
    console.log('⚠️ NO REF CODE - Will show login modal when DOM ready');
    // Set a flag to show modal ASAP
    window.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 DOM LOADED - Forcing modal to show NOW');
        const modal = document.getElementById('patientLoginModal');
        if (modal) {
            modal.style.setProperty('display', 'flex', 'important');
            console.log('✅ Modal display set to flex with !important');
        } else {
            console.error('❌ MODAL ELEMENT NOT FOUND!');
        }
    });
}

// Multi-language translations
const translations = {
    en: {
        'dont-worry': '🗺️ DON\'T WORRY',
        'help-coming': 'Help is on the way',
        'stay-here': 'Stay where you are',
        'im-okay': 'I\'M OKAY NOW',
        'emergency': 'Emergency! Calling for help now!',
        'lost-msg': 'You are lost. Don\'t worry. Stay where you are. Help is coming.',
        'charge-watch': 'Please charge your watch now',
        'medicine-time': 'Medicine time! Please take your medicine',
        'help-me': 'HELP ME',
        'who-is-this': 'WHO IS THIS?',
        'my-routine': 'MY ROUTINE',
        'my-medicines': 'MY MEDICINES',
        'people-i-know': 'PEOPLE I KNOW',
        'important-places': 'IMPORTANT PLACES',
        'my-profile': 'MY PROFILE',
        'capture': '📸 CAPTURE',
        'read-to-me': '🔊 READ TO ME'
    },
    hi: {
        'dont-worry': '🗺️ चिंता मत करो',
        'help-coming': 'मदद आ रही है',
        'stay-here': 'आप जहां हैं वहीं रहें',
        'im-okay': 'मैं ठीक हूं',
        'emergency': 'आपातकाल! मदद के लिए बुला रहा हूं!',
        'lost-msg': 'आप खो गए हैं। चिंता मत करें। जहां हैं वहीं रहें। मदद आ रही है।',
        'charge-watch': 'कृपया अपनी घड़ी चार्ज करें',
        'medicine-time': 'दवा का समय! कृपया अपनी दवा लें',
        'help-me': 'मुझे मदद करें',
        'who-is-this': 'यह कौन है?',
        'my-routine': 'मेरी दिनचर्या',
        'my-medicines': 'मेरी दवाइयाँ',
        'people-i-know': 'मेरे परिचित लोग',
        'important-places': 'महत्वपूर्ण स्थान',
        'my-profile': 'मेरी प्रोफाइल',
        'capture': '📸 कैप्चर करें',
        'read-to-me': '🔊 मुझे पढ़ें'
    },
    te: {
        'dont-worry': '🗺️ భయపడకండి',
        'help-coming': 'సహాయం వస్తోంది',
        'stay-here': 'మీరు ఉన్న చోట ఉండండి',
        'im-okay': 'నేను బాగున్నాను',
        'emergency': 'అపాయం! సహాయాన్ని అడుగుతున్నాను!',
        'lost-msg': 'మీరు తప్పిపోయారు। భయపడకండి। మీరు ఉన్న చోట ఉండండి। సహాయం వస్తోంది।',
        'charge-watch': 'దయచేసి మీ గడియారం చార్జ్ చేయండి',
        'medicine-time': 'మందు సమయం! దయచేసి మీ మందు తీసుకోండి',
        'help-me': 'నాకు సహాయం చేయండి',
        'who-is-this': 'ఇది ఎవరు?',
        'my-routine': 'నా దినచర్య',
        'my-medicines': 'నా మందులు',
        'people-i-know': 'నాకు తెలిసిన వ్యక్తులు',
        'important-places': 'ముఖ్యమైన ప్రదేశాలు',
        'my-profile': 'నా ప్రొఫైల్',
        'capture': '📸 తీయండి',
        'read-to-me': '🔊 చదవండి'
    },
    ta: {
        'dont-worry': '🗺️ கவலைப்பட வேண்டாம்',
        'help-coming': 'உதவி வருகிறது',
        'stay-here': 'நீங்கள் இருக்கும் இடத்திலே இருங்கள்',
        'im-okay': 'நான் நன்றாக இருக்கிறேன்',
        'emergency': 'அாபத்து! உதவிக்காக அழைக்கிறேன்!',
        'lost-msg': 'நீங்கள் வழி தவறிட்டீர்கள்। கவலைப்பட வேண்டாம்। உதவி வருகிறது।',
        'charge-watch': 'தயவு செய்து உங்கள் கடிகாரம் சார்ஜ் செய்யுங்கள்',
        'medicine-time': 'மருந்து நேரம்! தயவு செய்து மருந்தை எடுங்கள்'
    },
    kn: {
        'dont-worry': '🗺️ ಚಿಂತೆ ಮಾಡಬೇಡಿ',
        'help-coming': 'ಸಹಾಯ ಬರುತ್ತಿದೆ',
        'stay-here': 'ನೀವು ಇದ್ದ ಹಿಂದೆ ಇರಿ',
        'im-okay': 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ',
        'emergency': 'ಆಪತ್ತು! ಸಹಾಯಕ್ಕಾಗಿ ಕರೆಯುತ್ತಿದ್ದೇನೆ!',
        'lost-msg': 'ನೀವು ಕಳೆದುಕೊಂಡಿದ್ದೀರಿ। ಚಿಂತೆ ಮಾಡಬೇಡಿ। ಸಹಾಯ ಬರುತ್ತಿದೆ।',
        'charge-watch': 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಗಡಿಯಾರವನ್ನು ಚಾರ್ಜ್ ಮಾಡಿ',
        'medicine-time': 'ಹಸು ಸಮಯ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಸು ತಗೊಳ್ಳಿ'
    },
    ml: {
        'dont-worry': '🗺️ ആശങ്കപ്പെടേണ്ട',
        'help-coming': 'സഹായം വരുന്നു',
        'stay-here': 'നിങ്ങൾ ഇവിടെ തന്നെ നിൽക്കുക',
        'im-okay': 'ഞാൻ നല്ലതാണ്',
        'emergency': 'അപകടം! സഹായത്തിനായി വിളിക്കുന്നു!',
        'lost-msg': 'നിങ്ങൾ വഴിയും തെറ്റു। ആശങ്കപ്പെടേണ്ടത്തില്ല। സഹായം വരുന്നു।',
        'charge-watch': 'ദയവായി നിങ്ങളുടെ വാച്ച് ചാർജ്ജ് ചെയ്യുക',
        'medicine-time': 'മരുന്നു സമയം! ദയവായി മരുന്ന് കഴിക്കുക'
    },
    mr: {
        'dont-worry': '🗺️ काळजी करू नका',
        'help-coming': 'मदत येत आहे',
        'stay-here': 'तुम्ही जिथे आहात तिथेच रहा',
        'im-okay': 'मी बरी आहे',
        'emergency': 'आपत्काळ! मदतीसाठी बोलवत आहे!',
        'lost-msg': 'तुम्ही हरवला आहात। काळजी करू नका। मदत येत आहे।',
        'charge-watch': 'कृपया आपले घड्याळ चार्ज करा',
        'medicine-time': 'ौषध वेळ! कृपया आपली ौषधे घ्या'
    },
    bn: {
        'dont-worry': '🗺️ চিন্তা করবেন না',
        'help-coming': 'সাহায্য আসছে',
        'stay-here': 'আপনি যেখানে আছেন সেখানেই থাকুন',
        'im-okay': 'আমি ঠিক আছি',
        'emergency': 'জরুরি! সাহায্যের জন্য ডাকছি!',
        'lost-msg': 'আপনি হারিয়ে গেছেন। চিন্তা করবেন না। সাহায্য আসছে।',
        'charge-watch': 'অনুগ্রহ করে আপনার ঘড়ি চার্জ করুন',
        'medicine-time': 'ওষুধের সময়! অনুগ্রহ করে আপনার ওষুধ খান'
    },
    gu: {
        'dont-worry': '🗺️ ચિંતા ન કરો',
        'help-coming': 'મદદ આવી રહી છે',
        'stay-here': 'તમે જ્યાં છો ત્યાં રહો',
        'im-okay': 'હું ઠીક છું',
        'emergency': 'આપત્કાળ! મદદ માટે બોલાવી રહ્યો છું!',
        'lost-msg': 'તમે ગુમ થયા છો। ચિંતા ન કરો। મદદ આવી રહી છે।',
        'charge-watch': 'કૃપયા કરીને તમારી ઘડિયાળ ચાર્જ કરો',
        'medicine-time': 'દવાનું સમય! કૃપયા કરીને તમારી દવા લો'
    },
    pa: {
        'dont-worry': '🗺️ ਚਿੰਤਾ ਨਾ ਕਰੋ',
        'help-coming': 'ਮਦਦ ਆ ਰਹੀ ਹੈ',
        'stay-here': 'ਤੁਸੀਂ ਜਿੱਥੇ ਹੋ ਉੱਥੇ ਹੀ ਰਹੋ',
        'im-okay': 'ਮੈਂ ਠੀਕ ਹਾਂ',
        'emergency': 'ਅਪਾਤਕਾਲ! ਮਦਦ ਲਈ ਬੁਲਾ ਰਿਹਾ ਹਾਂ!',
        'lost-msg': 'ਤੁਸੀਂ ਗੁਮ ਹੋ ਗਏ ਹੋ। ਚਿੰਤਾ ਨਾ ਕਰੋ। ਮਦਦ ਆ ਰਹੀ ਹੈ।',
        'charge-watch': 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਘੜੀ ਚਾਰਜ ਕਰੋ',
        'medicine-time': 'ਦਵਾਈ ਦਾ ਸਮਾਂ! ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਦਵਾਈ ਲਵੋ'
    }
};

// Speech Synthesis
const synth = window.speechSynthesis;

// Language code mapping for speech synthesis
const languageCodes = {
    en: 'en-US',
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    gu: 'gu-IN',
    pa: 'pa-IN'
};

function speak(text, langCode = null) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode || languageCodes[currentLanguage] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    synth.speak(utterance);
}

function getText(key) {
    return translations[currentLanguage]?.[key] || translations.en[key];
}

function updateLanguageTexts() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (key && translations[currentLanguage]?.[key]) {
            el.textContent = translations[currentLanguage][key];
        }
    });
    console.log(`🌐 Language changed to: ${currentLanguage}`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 PATIENT.JS LOADING...');
    console.log('📱 Current Reference Code:', currentRefCode);
    
    if (!currentRefCode) {
        console.log('⚠️ No reference code found - showing login modal');
        showPatientLoginModal();
    } else {
        console.log('✅ Reference code found:', currentRefCode);
        await loadPatientData();
        setupEventListeners();
        updateTimeDisplay();
        setInterval(updateTimeDisplay, 1000);
        
        // Start checking for medicine and watch reminders
        startReminderChecks();
    }
});

// Show patient login modal
function showPatientLoginModal() {
    console.log('🔐 Showing patient login modal...');
    const modal = document.getElementById('patientLoginModal');
    if (!modal) {
        console.error('❌ Patient login modal not found!');
        return;
    }
    // Use setProperty with !important to override CSS
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    modal.style.setProperty('opacity', '1', 'important');
    
    document.getElementById('patientLoginBtn').onclick = patientLogin;
    
    // Allow Enter key to login
    const input = document.getElementById('patientRefCodeInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') patientLogin();
    });
    
    // Focus on input
    setTimeout(() => {
        input.focus();
        console.log('✅ Patient login modal displayed');
    }, 300);
}

// Patient login with reference code
async function patientLogin() {
    const code = document.getElementById('patientRefCodeInput').value.trim().toUpperCase();
    
    if (code.length !== 6) {
        document.getElementById('patientLoginMessage').innerHTML = `
            <div style="background: #ff9800; color: white; padding: 10px; border-radius: 5px;">
                Please enter a valid 6-character code
            </div>
        `;
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
            localStorage.setItem('patientRefCode', currentRefCode);
            document.getElementById('patientLoginMessage').innerHTML = `
                <div style="background: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
                    ✓ Welcome! Loading your information...
                </div>
            `;
            speak('Welcome! Loading your information');
            setTimeout(() => {
                document.getElementById('patientLoginModal').style.display = 'none';
                location.reload();
            }, 1500);
        } else {
            document.getElementById('patientLoginMessage').innerHTML = `
                <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                    Invalid code. Please ask your caregiver for the correct code.
                </div>
            `;
            speak('Invalid code. Please ask your caregiver');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        document.getElementById('patientLoginMessage').innerHTML = `
            <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px;">
                Connection error. Please try again.
            </div>
        `;
        speak('Connection error');
    }
}

// Load all patient data from server
async function loadPatientData() {
    if (!currentRefCode) {
        console.warn('⚠️ Cannot load data - no reference code');
        return;
    }
    
    try {
        console.log('📥 Loading patient data for:', currentRefCode);
        const response = await fetch(`/api/data?refCode=${currentRefCode}`);
        const data = await response.json();
        patientData = data;
        console.log('✅ Patient data loaded:', patientData);
        updateWelcomeMessage();
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

function updateWelcomeMessage() {
    const name = patientData.patientProfile?.name || 'Friend';
    document.getElementById('welcomeMessage').textContent = `Hello, ${name}!`;
}

// Setup all event listeners
function setupEventListeners() {
    // Language selector
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        updateLanguageTexts();
        speak(getText('dont-worry'));
    });
    
    // SOS Button - with voice
    document.getElementById('sosButton').addEventListener('click', () => {
        speak(getText('emergency'));
        handleSOS();
    });
    
    // Action buttons with voice announcements
    document.getElementById('helpButton').addEventListener('click', () => {
        speak('Activating help mode');
        handleHelp();
    });
    
    document.getElementById('faceButton').addEventListener('click', () => {
        speak('Opening face recognition');
        openFaceRecognition();
    });
    
    document.getElementById('routineButton').addEventListener('click', () => {
        speak('Showing your daily routine');
        showRoutine();
    });
    
    document.getElementById('medicineButton').addEventListener('click', () => {
        speak('Showing your medicines');
        showMedicines();
    });
    
    document.getElementById('peopleButton').addEventListener('click', () => {
        speak('Showing people you know');
        showPeople();
    });
    
    document.getElementById('placesButton').addEventListener('click', () => {
        speak('Showing important places');
        showPlaces();
    });
    
    document.getElementById('profileButton').addEventListener('click', () => {
        speak('Showing your profile');
        showProfile();
    });
    
    // Modal close buttons
    document.getElementById('closeFaceModal').addEventListener('click', () => closeModal('faceModal'));
    document.getElementById('closeLostModal').addEventListener('click', () => closeModal('lostModal'));
    document.getElementById('closeRoutineModal').addEventListener('click', () => closeModal('routineModal'));
    document.getElementById('closeMedicineModal').addEventListener('click', () => closeModal('medicineModal'));
    document.getElementById('closePeopleModal').addEventListener('click', () => closeModal('peopleModal'));
    document.getElementById('closePlacesModal').addEventListener('click', () => closeModal('placesModal'));
    document.getElementById('closeProfileModal').addEventListener('click', () => closeModal('profileModal'));
    
    // Face recognition
    document.getElementById('captureBtn').addEventListener('click', captureFace);
    
    // Voice buttons with announcements
    document.getElementById('speakRoutine').addEventListener('click', () => {
        speak('Reading your routine');
        speakRoutine();
    });
    
    document.getElementById('speakPeople').addEventListener('click', () => {
        speak('Reading people information');
        speakPeople();
    });
    
    document.getElementById('speakPlaces').addEventListener('click', () => {
        speak('Reading places information');
        speakPlaces();
    });
    
    document.getElementById('speakProfile').addEventListener('click', () => {
        speak('Reading your profile information');
        speakProfile();
    });
}

// Language toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'english' ? 'telugu' : 'english';
    const btn = document.getElementById('langBtn');
    btn.textContent = currentLanguage === 'english' ? 'తెలుగు' : 'English';
    
    // You can add more language toggle effects here
    speak(currentLanguage === 'english' ? 'Switched to English' : 'Switched to Telugu', 
          currentLanguage === 'english' ? 'en-US' : 'te-IN');
}

// Emergency SOS
async function handleSOS() {
    speak(getText('emergency'));
    
    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            // Send SOS alert to server
            try {
                await fetch('/api/sos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location, refCode: currentRefCode })
                });
                
                alert('🆘 EMERGENCY ALERT SENT!\n\nYour caregiver has been notified.\nHelp is on the way.');
                speak('Emergency alert sent. Help is coming.');
            } catch (error) {
                console.error('Error sending SOS:', error);
            }
        }, () => {
            // Location not available
            fetch('/api/sos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: 'Location unavailable', refCode: currentRefCode })
            });
            alert('🆘 EMERGENCY ALERT SENT!\n\nYour caregiver has been notified.');
        });
    }
}

// Lost/Help Mode with Google Maps
async function handleHelp() {
    openModal('lostModal');
    updateLanguageTexts();
    
    // Speak in current language
    speak(getText('lost-msg'));
    
    // Get location and show on map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            // Display location info
            document.getElementById('locationInfo').innerHTML = `
                📍 Your Location:<br>
                Lat: ${location.latitude.toFixed(6)}<br>
                Lng: ${location.longitude.toFixed(6)}
            `;
            
            // Initialize Google Maps
            initLostMap(location.latitude, location.longitude);
            
            const response = await fetch('/api/lost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, refCode: currentRefCode, urgent: true })
            });
            
            if (response.ok) {
                console.log('✅ Help alert sent to caregiver');
            }
        }, (error) => {
            document.getElementById('locationInfo').innerHTML = '⚠️ Location unavailable';
            document.getElementById('lostMapContainer').innerHTML = '<p>Please enable location services</p>';
        });
    }
}

// Initialize Google Map for lost mode
function initLostMap(lat, lng) {
    const mapContainer = document.getElementById('lostMapContainer');
    
    // Using embedded Google Maps iframe (no API key needed)
    mapContainer.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            frameborder="0"
            style="border:0; border-radius: 15px;"
            src="https://www.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed"
            allowfullscreen>
        </iframe>
    `;
}

// Face Recognition
let videoStream = null;

async function openFaceRecognition() {
    openModal('faceModal');
    
    try {
        const video = document.getElementById('faceVideo');
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        speak('Point the camera at the person you want to recognize', 'en-US');
    } catch (error) {
        alert('Camera not available. Please check permissions.');
        console.error('Camera error:', error);
    }
}

async function captureFace() {
    const video = document.getElementById('faceVideo');
    const canvas = document.getElementById('faceCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // Stop video stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    
    await loadPatientData();
    
    if (patientData.knownPeople && patientData.knownPeople.length > 0) {
        // Randomly match with known person (demo logic)
        const randomPerson = patientData.knownPeople[Math.floor(Math.random() * patientData.knownPeople.length)];
        
        // Close face modal and launch story mode
        closeModal('faceModal');
        setTimeout(() => {
            playStoryMode(randomPerson);
        }, 500);
    } else {
        const result = document.getElementById('faceResult');
        result.innerHTML = `
            <div class="person-info">
                <h3>⚠️ Person Not Recognized</h3>
                <p>I don't recognize this person. Please be careful.</p>
            </div>
        `;
        speak('I do not recognize this person. Please be careful.', languageCodes[currentLanguage]);
    }
}

// Story Mode - Play video, audio, and memories with screen effects
async function playStoryMode(person) {
    console.log('🎬 Starting story mode for:', person.name);
    
    // Create fullscreen story overlay
    const storyOverlay = document.createElement('div');
    storyOverlay.id = 'storyModeOverlay';
    storyOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        animation: storyFadeIn 1s ease-in;
    `;
    
    storyOverlay.innerHTML = `
        <style>
            @keyframes storyFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes storyPulse {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
            }
            @keyframes storyGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
                50% { box-shadow: 0 0 60px rgba(255,255,255,0.8); }
            }
            
            @media (max-width: 768px) {
                .story-container {
                    padding: 20px !important;
                }
                .story-title {
                    font-size: 32px !important;
                }
                .story-relation {
                    font-size: 24px !important;
                }
                .story-photo {
                    max-width: 250px !important;
                    max-height: 250px !important;
                }
                .story-description {
                    font-size: 18px !important;
                }
                .story-button {
                    padding: 15px 40px !important;
                    font-size: 20px !important;
                }
                .story-media-item {
                    max-width: 100% !important;
                }
            }
            
            @media (max-width: 480px) {
                .story-title {
                    font-size: 24px !important;
                }
                .story-relation {
                    font-size: 18px !important;
                }
                .story-photo {
                    max-width: 200px !important;
                    max-height: 200px !important;
                }
                .story-description {
                    font-size: 16px !important;
                }
                .story-button {
                    padding: 12px 30px !important;
                    font-size: 18px !important;
                }
            }
        </style>
        <div class="story-container" style="text-align: center; max-width: 900px; width: 95%; padding: 40px; animation: storyPulse 4s infinite;">
            <div id="personProfileHeader" style="margin-bottom: 50px;">
                <h1 class="story-title" style="color: white; font-size: 56px; margin-bottom: 30px; text-shadow: 0 4px 8px rgba(0,0,0,0.5);">
                    ✨ ${person.name}
                </h1>
                <p class="story-relation" style="color: rgba(255,255,255,0.9); font-size: 36px; margin-bottom: 40px;">
                    ${person.relation}
                </p>
                
                ${person.photo ? `
                    <img src="${person.photo}" class="story-photo story-media-item" style="
                        max-width: 400px;
                        max-height: 400px;
                        width: 90%;
                        height: auto;
                        border-radius: 20px;
                        margin: 30px auto;
                        display: block;
                        animation: storyGlow 3s infinite;
                        border: 5px solid white;
                    ">` : ''}
                
                ${person.description ? `
                    <p class="story-description" style="color: white; font-size: 28px; line-height: 1.6; margin: 30px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                        ${person.description}
                    </p>` : ''}
            </div>
            
            <div id="storyMediaContainer" style="margin: 40px 0; min-height: 200px; width: 100%;"></div>
            
            <button onclick="document.getElementById('storyModeOverlay').remove()" class="story-button" style="
                background: white;
                color: #7e22ce;
                border: none;
                padding: 20px 60px;
                font-size: 28px;
                border-radius: 15px;
                cursor: pointer;
                margin-top: 40px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                min-height: 44px;
                min-width: 44px;
            ">✓ I Remember Now</button>
        </div>
    `;
    
    document.body.appendChild(storyOverlay);
    
    // Screen lighting effects
    setTimeout(() => {
        storyOverlay.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 3000);
    
    setTimeout(() => {
        storyOverlay.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }, 6000);
    
    setTimeout(() => {
        storyOverlay.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    }, 9000);
    
    // Sequential story-telling experience
    const mediaContainer = document.getElementById('storyMediaContainer');
    
    // Speak the introduction first
    const storyText = `This is ${person.name}, your ${person.relation}. ${person.description || ''}`;
    setTimeout(() => {
        speak(storyText, languageCodes[currentLanguage]);
    }, 1000);
    
    // Build sequential playback timeline
    let currentDelay = 5000; // Start after intro speech
    
    // Step 1: Play voice note first (if available)
    if (person.voiceNote) {
        setTimeout(() => {
            console.log('🎵 Playing voice note...');
            mediaContainer.innerHTML = `
                <audio id="storyAudio" autoplay style="
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    display: block;
                    border-radius: 10px;
                ">
                    <source src="${person.voiceNote}" type="audio/mpeg">
                </audio>
            `;
            
            // Get audio duration and schedule next step
            const audioEl = document.getElementById('storyAudio');
            audioEl.addEventListener('loadedmetadata', () => {
                const audioDuration = (audioEl.duration || 10) * 1000;
                playTimelineSequentially(person, audioDuration + 2000);
            });
            audioEl.addEventListener('error', () => {
                playTimelineSequentially(person, 2000);
            });
        }, currentDelay);
    } else {
        // No voice note, start timeline immediately
        setTimeout(() => {
            playTimelineSequentially(person, 0);
        }, currentDelay);
    }
}

// Play timeline moments one by one
function playTimelineSequentially(person, startDelay) {
    if (!person.timeline || person.timeline.length === 0) {
        // No timeline, just repeat the name reminder
        startNameReminder(person);
        return;
    }
    
    const mediaContainer = document.getElementById('storyMediaContainer');
    let delay = startDelay;
    
    person.timeline.forEach((moment, index) => {
        setTimeout(() => {
            if (!document.getElementById('storyModeOverlay')) return; // Story closed
            
            console.log(`📖 Playing moment ${index + 1}/${person.timeline.length}`);
            
            if (moment.type === 'photo') {
                // Replace profile photo with timeline photo
                mediaContainer.innerHTML = `
                    <div style="animation: storyFadeIn 1s ease-in;">
                        ${moment.caption ? `<p style="color: white; font-size: 28px; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" class="story-caption">${moment.caption}</p>` : ''}
                        <img src="${moment.media}" class="story-media-item" style="
                            max-width: 400px;
                            max-height: 400px;
                            width: 90%;
                            height: auto;
                            border-radius: 20px;
                            margin: 30px auto;
                            display: block;
                            animation: storyGlow 3s infinite;
                            border: 5px solid white;
                            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                        ">
                    </div>
                `;
                
                // Speak the caption
                if (moment.caption) {
                    speak(moment.caption, languageCodes[currentLanguage]);
                }
            } else if (moment.type === 'video') {
                // Replace profile photo with video
                mediaContainer.innerHTML = `
                    <div style="animation: storyFadeIn 1s ease-in;">
                        ${moment.caption ? `<p style="color: white; font-size: 28px; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" class="story-caption">${moment.caption}</p>` : ''}
                        <video id="storyVideo${index}" autoplay controls playsinline class="story-media-item" style="
                            max-width: 700px;
                            width: 95%;
                            height: auto;
                            margin: 10px auto;
                            display: block;
                            border-radius: 15px;
                            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                        ">
                            <source src="${moment.media}" type="video/mp4">
                        </video>
                    </div>
                `;
                
                // Speak the caption
                if (moment.caption) {
                    setTimeout(() => {
                        speak(moment.caption, languageCodes[currentLanguage]);
                    }, 500);
                }
            }
            
            // If this is the last moment, start name reminder
            if (index === person.timeline.length - 1) {
                setTimeout(() => {
                    startNameReminder(person);
                }, 3000);
            }
        }, delay);
        
        // Calculate delay for next moment
        if (moment.type === 'photo') {
            delay += 8000; // Show photo for 8 seconds
        } else if (moment.type === 'video') {
            delay += 15000; // Estimate 15 seconds for video (will continue playing)
        }
    });
}

// Repeat name reminder periodically
function startNameReminder(person) {
    const repeatInterval = setInterval(() => {
        if (document.getElementById('storyModeOverlay')) {
            speak(`${person.name}, your ${person.relation}`, languageCodes[currentLanguage]);
        } else {
            clearInterval(repeatInterval);
        }
    }, 20000);
}

// Show Routine
async function showRoutine() {
    await loadPatientData();
    openModal('routineModal');
    
    const display = document.getElementById('routineDisplay');
    
    if (patientData.dailyRoutine && patientData.dailyRoutine.length > 0) {
        display.innerHTML = patientData.dailyRoutine
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(item => `
                <div class="info-item">
                    <div class="info-item-title">${item.time}</div>
                    <div class="info-item-detail">${item.activity}</div>
                </div>
            `).join('');
    } else {
        display.innerHTML = '<p class="large-text">No routine set yet. Ask your caregiver to add activities.</p>';
    }
}

function speakRoutine() {
    if (patientData.dailyRoutine && patientData.dailyRoutine.length > 0) {
        let text = 'Your daily routine: ';
        patientData.dailyRoutine
            .sort((a, b) => a.time.localeCompare(b.time))
            .forEach(item => {
                text += `At ${item.time}, ${item.activity}. `;
            });
        speak(text, 'en-US');
    }
}

// Show Medicines
async function showMedicines() {
    await loadPatientData();
    openModal('medicineModal');
    
    const display = document.getElementById('medicineDisplay');
    
    if (patientData.medicines && patientData.medicines.length > 0) {
        display.innerHTML = patientData.medicines
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(med => `
                <div class="medicine-card ${med.taken ? 'taken' : ''}">
                    <div class="medicine-name">💊 ${med.name}</div>
                    <div class="medicine-time">⏰ ${med.time}</div>
                    <div class="medicine-dosage">${med.dosage}</div>
                    ${med.instructions ? `<div class="medicine-instructions">${med.instructions}</div>` : ''}
                    ${med.taken ? '<div class="info-item-detail" style="color: green;">✓ Taken</div>' : ''}
                    ${!med.taken ? `<div class="medicine-actions"><button class="btn btn-large btn-success" onclick="markMedicineTaken(${med.id})">✓ I TOOK THIS</button></div>` : ''}
                </div>
            `).join('');
    } else {
        display.innerHTML = '<p class="large-text">No medicines scheduled.</p>';
    }
}

async function markMedicineTaken(medId) {
    try {
        await fetch(`/api/medicines/${medId}/taken`, { method: 'POST' });
        speak('Good job! Medicine marked as taken.', 'en-US');
        await showMedicines(); // Refresh display
    } catch (error) {
        console.error('Error marking medicine:', error);
    }
}

// Show People
async function showPeople() {
    await loadPatientData();
    openModal('peopleModal');
    
    const display = document.getElementById('peopleDisplay');
    
    if (patientData.knownPeople && patientData.knownPeople.length > 0) {
        display.innerHTML = patientData.knownPeople.map(person => `
            <div class="info-item">
                <div class="info-item-title">👤 ${person.name}</div>
                <div class="info-item-detail"><strong>Relation:</strong> ${person.relation}</div>
                ${person.description ? `<div class="info-item-detail">${person.description}</div>` : ''}
            </div>
        `).join('');
    } else {
        display.innerHTML = '<p class="large-text">No people added yet.</p>';
    }
}

function speakPeople() {
    if (patientData.knownPeople && patientData.knownPeople.length > 0) {
        let text = 'People you know: ';
        patientData.knownPeople.forEach(person => {
            text += `${person.name}, your ${person.relation}. `;
        });
        speak(text, 'en-US');
    }
}

// Show Places
async function showPlaces() {
    await loadPatientData();
    openModal('placesModal');
    
    const display = document.getElementById('placesDisplay');
    
    if (patientData.knownPlaces && patientData.knownPlaces.length > 0) {
        display.innerHTML = patientData.knownPlaces.map(place => `
            <div class="info-item">
                <div class="info-item-title">📍 ${place.name}</div>
                <div class="info-item-detail"><strong>Address:</strong> ${place.address}</div>
                ${place.description ? `<div class="info-item-detail">${place.description}</div>` : ''}
            </div>
        `).join('');
    } else {
        display.innerHTML = '<p class="large-text">No places added yet.</p>';
    }
}

function speakPlaces() {
    if (patientData.knownPlaces && patientData.knownPlaces.length > 0) {
        let text = 'Important places: ';
        patientData.knownPlaces.forEach(place => {
            text += `${place.name}, located at ${place.address}. `;
        });
        speak(text, 'en-US');
    }
}

// Show Profile
async function showProfile() {
    await loadPatientData();
    openModal('profileModal');
    
    const display = document.getElementById('profileDisplay');
    const profile = patientData.patientProfile || {};
    
    if (profile.name || profile.age) {
        display.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
                <h3 style="font-size: 42px; margin: 0 0 10px 0;">👤 ${profile.name || 'Not Set'}</h3>
                ${profile.age ? `<p style="font-size: 28px; margin: 10px 0;">Age: ${profile.age} years</p>` : ''}
                ${profile.condition ? `<p style="font-size: 24px; margin: 10px 0; opacity: 0.9;">Condition: ${profile.condition}</p>` : ''}
            </div>
            
            ${profile.address ? `
                <div class="info-item">
                    <div class="info-item-title">🏠 My Home Address</div>
                    <div class="info-item-detail">${profile.address}</div>
                </div>
            ` : ''}
            
            ${profile.emergencyContact ? `
                <div class="info-item">
                    <div class="info-item-title">📞 Emergency Contact</div>
                    <div class="info-item-detail">
                        <strong>${profile.emergencyContact}</strong><br>
                        ${profile.emergencyPhone || ''}
                    </div>
                </div>
            ` : ''}
            
            ${patientData.emergencyContacts && patientData.emergencyContacts.length > 0 ? `
                <div class="info-item">
                    <div class="info-item-title">👨‍👩‍👧‍👦 My Caregivers</div>
                    <div class="info-item-detail">
                        ${patientData.emergencyContacts.map(contact => `
                            <div style="margin: 15px 0; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 10px;">
                                <strong style="font-size: 28px;">📱 ${contact.name}</strong><br>
                                <span style="font-size: 24px;">${contact.phone}</span><br>
                                ${contact.relation ? `<span style="font-size: 22px; opacity: 0.8;">${contact.relation}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    } else {
        display.innerHTML = '<p class="large-text">No profile information available yet. Ask your caregiver to set up your profile.</p>';
    }
}

function speakProfile() {
    const profile = patientData.patientProfile || {};
    let text = 'Your profile: ';
    
    if (profile.name) text += `Your name is ${profile.name}. `;
    if (profile.age) text += `You are ${profile.age} years old. `;
    if (profile.address) text += `Your home address is ${profile.address}. `;
    if (profile.emergencyContact) text += `Your emergency contact is ${profile.emergencyContact}, phone number ${profile.emergencyPhone}. `;
    
    if (patientData.emergencyContacts && patientData.emergencyContacts.length > 0) {
        text += 'Your caregivers are: ';
        patientData.emergencyContacts.forEach(contact => {
            text += `${contact.name}, ${contact.phone}. `;
        });
    }
    
    speak(text, languageCodes[currentLanguage]);
}

// Modal controls
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Stop video if closing face modal
    if (modalId === 'faceModal' && videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
}

// Time display
function updateTimeDisplay() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    document.getElementById('currentTimePatient').textContent = timeStr;
    document.getElementById('currentDatePatient').textContent = dateStr;
}

// Medicine and Watch Reminders
function startReminderChecks() {
    // Check every minute
    medicineCheckInterval = setInterval(checkMedicineReminders, 60000);
    watchCheckInterval = setInterval(checkWatchReminder, 60000);
    setInterval(checkRoutineReminders, 60000);
    
    // Check immediately
    checkMedicineReminders();
    checkWatchReminder();
    checkRoutineReminders();
}

async function checkMedicineReminders() {
    await loadPatientData();
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (patientData.medicines) {
        patientData.medicines.forEach(medicine => {
            if (medicine.time === currentTime && !medicine.taken) {
                showMedicineReminder(medicine);
            }
        });
    }
}

function showMedicineReminder(medicine) {
    // Create prominent medicine alert
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 50px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        min-width: 500px;
        animation: pulse 1s infinite;
    `;
    
    alertDiv.innerHTML = `
        <h2 style="font-size: 56px; margin: 0 0 20px 0;">💊 Medicine Time!</h2>
        <p style="font-size: 36px; margin: 20px 0; font-weight: bold;">${medicine.name}</p>
        <p style="font-size: 28px; margin: 20px 0;">${medicine.dosage}</p>
        <p style="font-size: 24px; margin: 20px 0;">⏰ ${medicine.time}</p>
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
            <button id="takeMedBtn_${medicine.id}" style="
                background: white;
                color: #f5576c;
                border: none;
                padding: 20px 40px;
                font-size: 24px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
            ">✓ Taken</button>
            <button id="snoozeMedBtn_${medicine.id}" style="
                background: rgba(255,255,255,0.3);
                color: white;
                border: 2px solid white;
                padding: 20px 40px;
                font-size: 24px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
            ">⏰ Remind Later</button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Speak loudly multiple times
    speak(`Medicine time! Please take your medicine: ${medicine.name}, ${medicine.dosage}`, 'en-US');
    setTimeout(() => speak(`${medicine.name}, ${medicine.dosage}`, 'en-US'), 3000);
    
    // Setup buttons
    document.getElementById(`takeMedBtn_${medicine.id}`).onclick = async () => {
        await markMedicineTaken(medicine.id);
        alertDiv.remove();
        speak('Good job! Medicine marked as taken', 'en-US');
    };
    
    document.getElementById(`snoozeMedBtn_${medicine.id}`).onclick = () => {
        alertDiv.remove();
        speak('I will remind you again in 10 minutes', 'en-US');
        // Remind again in 10 minutes
        setTimeout(() => showMedicineReminder(medicine), 10 * 60 * 1000);
    };
}

async function checkRoutineReminders() {
    await loadPatientData();
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (patientData.dailyRoutine) {
        patientData.dailyRoutine.forEach(routine => {
            if (routine.time === currentTime) {
                showRoutineReminder(routine);
            }
        });
    }
}

function showRoutineReminder(routine) {
    // Create reminder alert
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        min-width: 400px;
        animation: pulse 1s infinite;
    `;
    
    alertDiv.innerHTML = `
        <h2 style="font-size: 48px; margin: 0 0 20px 0;">⏰ Routine Time!</h2>
        <p style="font-size: 32px; margin: 20px 0; font-weight: bold;">${routine.time}</p>
        <p style="font-size: 28px; margin: 20px 0;">${routine.activity}</p>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: #667eea;
            border: none;
            padding: 20px 40px;
            font-size: 24px;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 20px;
            font-weight: bold;
        ">✓ Got It!</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Speak the reminder loudly
    speak(`Routine reminder! It's time for: ${routine.activity}`, 'en-US');
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 30000);
}

async function checkWatchReminder() {
    await loadPatientData();
    
    if (patientData.watchChargingTime) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (patientData.watchChargingTime === currentTime) {
            showWatchReminder();
        }
    }
}

function showWatchReminder() {
    const reminder = document.getElementById('watchReminder');
    reminder.style.display = 'block';
    
    speak('Watch charging time! Please charge your watch now.', 'en-US');
    setTimeout(() => {
        speak('Meeru mee watch charge cheyandi.', 'te-IN');
    }, 3000);
    
    document.getElementById('acknowledgeWatchBtn').onclick = () => {
        reminder.style.display = 'none';
        speak('Thank you!', 'en-US');
    };
}
