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
let currentRefCode = localStorage.getItem('memorycare_refCode') || localStorage.getItem('currentRefCode') || null;

// Alert sound function - Multiple fallback methods
function playAlertSound() {
    console.log('🔊 ATTEMPTING TO PLAY ALERT SOUND...');
    
    // Method 1: Create beep with Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Play second beep
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 880;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.5, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.3);
        }, 400);
        
        console.log('✅ Alert sound played successfully');
    } catch(error) {
        console.error('❌ Sound error:', error);
        
        // Method 2: Fallback to speech synthesis beep
        try {
            const utterance = new SpeechSynthesisUtterance('beep beep');
            utterance.rate = 2;
            utterance.pitch = 2;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
            console.log('✅ Fallback beep played');
        } catch(e) {
            console.error('❌ Fallback sound also failed:', e);
        }
    }
}

// Test alert system (for debugging)
function testAlertSystem() {
    console.log('🧪 TESTING ALERT SYSTEM...');
    
    // Test sound
    playAlertSound();
    
    // Test medicine alert
    setTimeout(() => {
        showCustomAlert({
            title: 'Test Alert',
            message: 'This is a test alert with sound!',
            icon: '🔔',
            type: 'info',
            buttons: [{text: 'OK', action: null}]
        });
        speak('This is a test alert. If you can hear this and see the alert, the system is working correctly.');
    }, 1000);
    
    console.log('✅ Test alert triggered');
}

// Custom Professional Alert System
function showCustomAlert(options) {
    const {
        title = 'Alert',
        message = '',
        icon = '🔔',
        type = 'info',
        buttons = [{text: 'OK', action: null}],
        autoClose = false,
        duration = 5000
    } = options;

    const colors = {
        success: {bg: '#4CAF50', text: '#fff'},
        warning: {bg: '#ff9800', text: '#fff'},
        error: {bg: '#f44336', text: '#fff'},
        info: {bg: '#2196F3', text: '#fff'}
    };

    const color = colors[type] || colors.info;

    const modal = document.createElement('div');
    modal.className = 'custom-alert-overlay';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        z-index: 999999;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 25px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: slideUp 0.4s ease;
        border-top: 8px solid ${color.bg};
    `;

    alertBox.innerHTML = `
        <div style="font-size: 100px; margin: 20px 0; animation: bounce 0.6s ease;">${icon}</div>
        <h2 style="color: ${color.bg}; margin: 20px 0; font-size: 32px; font-weight: bold;">${title}</h2>
        <p style="font-size: 20px; color: #333; margin: 25px 0; line-height: 1.6;">${message}</p>
        <div class="alert-buttons" style="margin-top: 30px;"></div>
    `;

    const buttonsContainer = alertBox.querySelector('.alert-buttons');
    buttons.forEach((btn, index) => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.cssText = `
            width: ${buttons.length === 1 ? '100%' : '48%'};
            padding: 20px;
            background: ${index === 0 ? color.bg : '#757575'};
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        button.onmouseover = () => button.style.transform = 'scale(1.05)';
        button.onmouseout = () => button.style.transform = 'scale(1)';
        button.onclick = () => {
            if (btn.action) btn.action();
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };
        buttonsContainer.appendChild(button);
    });

    modal.appendChild(alertBox);
    document.body.appendChild(modal);

    if (autoClose) {
        setTimeout(() => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }, duration);
    }

    // Add CSS animations
    if (!document.getElementById('custom-alert-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-alert-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
}

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
    console.log('🔊 SPEAK CALLED:', text);
    
    try {
        // Cancel any ongoing speech first
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // CRITICAL: Resume speech synthesis (needed for background/paused state)
        window.speechSynthesis.resume();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode || languageCodes[currentLanguage] || 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Success callback
        utterance.onstart = () => {
            console.log('✅ Speech started:', text);
        };
        
        utterance.onend = () => {
            console.log('✅ Speech completed');
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event);

            const err = event?.error;
            // If we canceled speech to speak something else, browsers report this as "interrupted".
            // Retrying on that creates an infinite retry loop.
            if (err === 'interrupted' || err === 'canceled') return;
            if (utterance.__retryAttempted) return;
            utterance.__retryAttempted = true;

            // Retry once for non-interrupt failures
            setTimeout(() => {
                console.log('🔄 Retrying speech...');
                window.speechSynthesis.cancel();
                window.speechSynthesis.resume();
                window.speechSynthesis.speak(utterance);
            }, 500);
        };
        
        // Speak the utterance
        window.speechSynthesis.speak(utterance);
        
        console.log('✅ Speech queued successfully');
        
    } catch (error) {
        console.error('❌ Speech failed:', error);
    }
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
        
        // Setup real-time sync to auto-update when caregiver makes changes
        if (typeof setupRealtimeSync !== 'undefined') {
            console.log('👂 Setting up real-time data sync...');
            setupRealtimeSync(`memorycare_${currentRefCode}`, (newData) => {
                console.log('🔄 Data updated in real-time!');
                try {
                    patientData = JSON.parse(newData);
                    console.log('✅ Patient data refreshed');
                    console.log('📋 Daily routines:', patientData.dailyRoutine?.length || 0);
                    console.log('👥 Known people:', patientData.knownPeople?.length || 0);
                    console.log('💊 Medicines:', patientData.medicines?.length || 0);
                    
                    updateWelcomeMessage();
                    
                    // Show notification
                    speak('Your information has been updated.');
                } catch (e) {
                    console.error('Failed to parse updated data:', e);
                }
            });
        }
        
        // Start checking for medicine and watch reminders
        startReminderChecks();
        
        // Welcome message
        setTimeout(() => {
            const name = patientData.patientProfile?.name || 'there';
            speak(`Hello ${name}, I'm here to help you.`);
        }, 1000);
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

// Patient login with reference code - FIXED FOR MOBILE
async function patientLogin() {
    console.log('🔐 Login attempt...');
    const codeInput = document.getElementById('patientRefCodeInput');
    const messageDiv = document.getElementById('patientLoginMessage');
    
    if (!codeInput) {
        console.error('❌ Reference code input not found');
        return;
    }
    
    const code = codeInput.value.trim().toUpperCase();
    console.log('📝 Entered code:', code);
    
    if (code.length !== 6) {
        if (messageDiv) {
            messageDiv.innerHTML = '<div style="background: #ff9800; color: white; padding: 15px; border-radius: 8px; font-size: 18px;">⚠️ Please enter a valid 6-character code</div>';
        }
        speak('Please enter a valid code');
        return;
    }
    
    const sessionKey = `memorycare_${code}`;

    // Check localStorage first
    let sessionData = localStorage.getItem(sessionKey);

    // If not on this device, check Firebase via cross-browser sync
    if (!sessionData && typeof getItemWithSync !== 'undefined') {
        console.log('☁️ Session not in localStorage, checking Firebase...');
        try {
            sessionData = await getItemWithSync(sessionKey);
        } catch (e) {
            console.warn('⚠️ Firebase lookup failed:', e?.message || e);
        }
    }

    if (sessionData) {
        console.log('✅ Session found');

        // Validate payload is JSON (the stored patient session object)
        try {
            const parsed = JSON.parse(sessionData);
            if (!parsed || typeof parsed !== 'object') throw new Error('Invalid session data');
            // Ensure local copy exists for offline use
            localStorage.setItem(sessionKey, sessionData);
        } catch (e) {
            console.warn('⚠️ Session data invalid or corrupted:', e?.message || e);
            if (messageDiv) {
                messageDiv.innerHTML = '<div style="background: #f44336; color: white; padding: 15px; border-radius: 8px; font-size: 18px;">❌ Invalid reference code. Please check with your caregiver.</div>';
            }
            speak('Invalid code. Please check with your caregiver.');
            return;
        }

        currentRefCode = code;
        localStorage.setItem('memorycare_refCode', currentRefCode);
        localStorage.setItem('currentRefCode', currentRefCode);
        
        // Show success message
        if (messageDiv) {
            messageDiv.innerHTML = '<div style="background: #4CAF50; color: white; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold;">✅ Access Granted!<br><small>Loading your dashboard...</small></div>';
        }
        speak('Access granted. Loading your information.');
        
        // Close modal IMMEDIATELY and show dashboard
        closeLoginAndShowDashboard();
        
    } else {
        console.log('❌ Session not found');
        if (messageDiv) {
            messageDiv.innerHTML = '<div style="background: #f44336; color: white; padding: 15px; border-radius: 8px; font-size: 18px;">❌ Invalid reference code. Please check with your caregiver.</div>';
        }
        speak('Invalid code. Please check with your caregiver.');
    }
}

// Close login modal and show patient dashboard
async function closeLoginAndShowDashboard() {
    console.log('🚪 Closing login modal and showing dashboard...');
    
    // Close modal IMMEDIATELY
    const modal = document.getElementById('patientLoginModal');
    if (modal) {
        modal.style.display = 'none !important';
        modal.style.visibility = 'hidden';
        modal.remove();
        console.log('✅ Modal closed');
    }
    
    // Load patient data IMMEDIATELY
    await loadPatientData();
    console.log('✅ Patient data loaded');
    
    // Setup all event listeners IMMEDIATELY
    setupEventListeners();
    console.log('✅ Event listeners attached');
    
    // Start time display
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
    
    // Start reminder checks
    startReminderChecks();
    console.log('✅ Reminder checks started');
    
    // Initialize indoor location tracking
    if (typeof indoorLocation !== 'undefined' && indoorLocation.init) {
        indoorLocation.init();
        console.log('✅ Indoor location tracking started');
    }
    
    // Welcome message
    setTimeout(() => {
        const name = patientData.patientProfile?.name || 'there';
        speak(`Hello ${name}, I'm here to help you.`);
    }, 500);
    
    console.log('✅ Patient dashboard fully initialized');
}

// Load all patient data from localStorage
async function loadPatientData() {
    if (!currentRefCode) {
        console.warn('⚠️ Cannot load data - no reference code');
        return;
    }
    
    try {
        console.log('📥 Loading patient data for:', currentRefCode);
        
        // ALWAYS check Firebase first for latest data
        let savedData = null;
        
        if (typeof getItemWithSync !== 'undefined') {
            console.log('☁️ Checking Firebase for latest data...');
            savedData = await getItemWithSync(`memorycare_${currentRefCode}`);
        }
        
        // Fallback to localStorage if Firebase fails
        if (!savedData) {
            console.log('📱 Trying localStorage...');
            savedData = localStorage.getItem(`memorycare_${currentRefCode}`);
        }
        
        if (savedData) {
            patientData = JSON.parse(savedData);
            console.log('✅ Patient data loaded:', patientData);
            console.log('📋 Daily routines:', patientData.dailyRoutine?.length || 0);
            console.log('👥 Known people:', patientData.knownPeople?.length || 0);
            console.log('💊 Medicines:', patientData.medicines?.length || 0);
            
            updateWelcomeMessage();
            
            // Reminder checks already started in DOMContentLoaded, no need to restart
        } else {
            console.warn('⚠️ No data found for this reference code');
        }
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

function updateWelcomeMessage() {
    const name = patientData.patientProfile?.name || 'Friend';
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.textContent = `Hello, ${name}!`;
    }
}

// REMOVED OLD FUNCTION - Using startReminderChecks() instead

// REMOVED OLD FUNCTION - Using checkRoutineReminders() instead

// REMOVED OLD FUNCTION - Using enhanced showRoutineReminder below

// REMOVED OLD FUNCTION - Using checkMedicineReminders() instead

// Show medicine reminder alert
function showMedicineReminder(medicine) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; text-align: center; animation: pulse 1s infinite;">
            <div style="font-size: 100px; margin: 20px 0;">💊</div>
            <h1 style="color: #4CAF50; margin: 20px 0; font-size: 32px;">Medicine Time!</h1>
            <div style="background: #f5f5f5; padding: 30px; border-radius: 15px; margin: 20px 0;">
                <h2 style="color: #333; font-size: 28px; margin-bottom: 15px;">${medicine.name}</h2>
                <p style="font-size: 24px; color: #666; margin: 10px 0;">Dosage: ${medicine.dosage}</p>
                ${medicine.instructions ? `<p style="font-size: 18px; color: #888; margin-top: 15px;">${medicine.instructions}</p>` : ''}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                style="width: 100%; padding: 25px; background: #4CAF50; color: white; border: none; border-radius: 15px; font-size: 24px; font-weight: bold; cursor: pointer;">
                ✓ I Took My Medicine
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Speak reminder
    speak(`Medicine time! Please take ${medicine.name}. ${medicine.dosage}.`);
    
    // Play alert sound
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGSz7OmqWRQJT7Pk8KhWFAM7kd');
        audio.play();
    } catch(e) {}
}

// Check watch charging time
function checkWatchChargingTime() {
    if (!patientData.watchChargingTime) return;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (patientData.watchChargingTime === currentTime) {
        showWatchChargingReminder();
    }
}

// Show watch charging reminder
function showWatchChargingReminder() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; text-align: center;">
            <div style="font-size: 100px; margin: 20px 0;">🔋</div>
            <h1 style="color: #ff9800; margin: 20px 0; font-size: 32px;">Charge Your Watch!</h1>
            <p style="font-size: 24px; color: #666; margin: 20px 0;">
                It's time to charge your smartwatch so it's ready for tomorrow.
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                style="width: 100%; padding: 25px; background: #ff9800; color: white; border: none; border-radius: 15px; font-size: 24px; font-weight: bold; cursor: pointer;">
                ✓ I'll Charge It Now
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    speak('Please charge your watch now.');
}

// Setup all event listeners - MOBILE OPTIMIZED
function setupEventListeners() {
    console.log('📱 Setting up mobile-optimized event listeners...');
    
    // Language selector
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            updateLanguageTexts();
            speak('Language changed');
        });
    }
    
    // SOS Emergency button
    const sosBtn = document.getElementById('sosButton');
    if (sosBtn) {
        const handleSOSClick = () => {
            console.log('🆘 SOS ACTIVATED');
            playAlertSound();
            handleSOS();
        };
        sosBtn.addEventListener('click', handleSOSClick);
        sosBtn.addEventListener('touchend', handleSOSClick);
    }
    
    // Action buttons with mobile support
    const actionButtons = {
        'helpButton': handleHelp,
        'bathroomButton': handleBathroom,
        'faceButton': openFaceRecognition,
        'routineButton': showRoutine,
        'medicineButton': showMedicines,
        'peopleButton': showPeople,
        'placesButton': showPlaces
    };
    
    Object.entries(actionButtons).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) {
            // Remove existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add both click and touch support
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🔥 ${id} clicked`);
                handler();
            });
            
            newBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                console.log(`🔥 ${id} touched`);
                handler();
            }, { passive: false });
            
            // Visual feedback
            newBtn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            newBtn.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            }, { passive: true });
            
            console.log(`✅ Button ${id} configured for mobile`);
        } else {
            console.warn(`⚠️ Button ${id} not found`);
        }
    });
    
    // Setup modal close buttons
    const modalCloseButtons = [
        'closeRoutineModal',
        'closeMedicineModal',
        'closePeopleModal',
        'closePlacesModal',
        'closeFaceModal'
    ];
    
    modalCloseButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const modalId = btnId.replace('close', '').replace('Modal', 'Modal');
            btn.addEventListener('click', () => closeModal(modalId.charAt(0).toLowerCase() + modalId.slice(1)));
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                closeModal(modalId.charAt(0).toLowerCase() + modalId.slice(1));
            });
            console.log(`✅ Modal close button ${btnId} configured`);
        }
    });

    // Face recognition capture button
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        const handleCapture = (e) => {
            e.preventDefault();
            console.log('📸 CAPTURE BUTTON CLICKED!');
            captureFace();
        };
        captureBtn.addEventListener('click', handleCapture, { passive: false });
        captureBtn.addEventListener('touchend', handleCapture, { passive: false });
        console.log('✅ Capture button configured');
    } else {
        console.warn('⚠️ Capture button not found');
    }
    
    console.log('✅ All event listeners configured for mobile');
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
                
                showCustomAlert({
                    title: 'EMERGENCY ALERT SENT!',
                    message: 'Your caregiver has been notified.\nYour location has been shared.\nHelp is on the way!',
                    icon: '🆘',
                    type: 'error',
                    buttons: [{text: 'OK, Waiting for Help', action: null}]
                });
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
            showCustomAlert({
                title: 'EMERGENCY ALERT SENT!',
                message: 'Your caregiver has been notified. Help is on the way!',
                icon: '🆘',
                type: 'error',
                buttons: [{text: 'OK', action: null}]
            });
        });
    }
}

// Lost/Help Mode with Location Alert
async function handleBathroom() {
    speak('Bathroom assistance needed');
    
    // Get location and send bathroom alert
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Save bathroom alert to localStorage
            const alertData = {
                type: 'bathroom',
                timestamp: new Date().toISOString(),
                location: { latitude: lat, longitude: lng },
                message: 'Patient needs bathroom assistance'
            };
            
            // Load existing data
            const sessionData = localStorage.getItem(`memorycare_${currentRefCode}`);
            if (sessionData) {
                const data = JSON.parse(sessionData);
                if (!data.bathroomAlerts) data.bathroomAlerts = [];
                data.bathroomAlerts.push(alertData);
                localStorage.setItem(`memorycare_${currentRefCode}`, JSON.stringify(data));
                console.log('✅ Bathroom alert saved to session data');
            }
            
            // Also save to caregiver alerts for immediate notification
            const caregiverAlerts = JSON.parse(localStorage.getItem('memorycare_caregiver_alerts') || '[]');
            caregiverAlerts.unshift({
                type: 'bathroom',
                timestamp: new Date().toISOString(),
                location: { latitude: lat, longitude: lng },
                message: 'Patient needs bathroom assistance',
                patientName: patientData?.patientProfile?.name || 'Patient'
            });
            localStorage.setItem('memorycare_caregiver_alerts', JSON.stringify(caregiverAlerts.slice(0, 100)));
            console.log('✅ Bathroom alert sent to caregiver');
            
            // Show confirmation
            showCustomAlert({
                title: '🚻 Bathroom Alert Sent',
                message: 'Your caregiver has been notified that you need bathroom assistance.',
                icon: '✅',
                type: 'success',
                buttons: [{text: 'OK', action: null}]
            });
            
        }, (error) => {
            console.error('Location error:', error);
            // Send alert without location
            const caregiverAlerts = JSON.parse(localStorage.getItem('memorycare_caregiver_alerts') || '[]');
            caregiverAlerts.unshift({
                type: 'bathroom',
                timestamp: new Date().toISOString(),
                message: 'Patient needs bathroom assistance (location unavailable)',
                patientName: patientData?.patientProfile?.name || 'Patient'
            });
            localStorage.setItem('memorycare_caregiver_alerts', JSON.stringify(caregiverAlerts.slice(0, 100)));
            
            showCustomAlert({
                title: '🚻 Bathroom Alert Sent',
                message: 'Your caregiver has been notified that you need bathroom assistance.',
                icon: '✅',
                type: 'success',
                buttons: [{text: 'OK', action: null}]
            });
        });
    } else {
        // Send alert without location
        const caregiverAlerts = JSON.parse(localStorage.getItem('memorycare_caregiver_alerts') || '[]');
        caregiverAlerts.unshift({
            type: 'bathroom',
            timestamp: new Date().toISOString(),
            message: 'Patient needs bathroom assistance (location unavailable)',
            patientName: patientData?.patientProfile?.name || 'Patient'
        });
        localStorage.setItem('memorycare_caregiver_alerts', JSON.stringify(caregiverAlerts.slice(0, 100)));
        
        showCustomAlert({
            title: '🚻 Bathroom Alert Sent',
            message: 'Your caregiver has been notified that you need bathroom assistance.',
            icon: '✅',
            type: 'success',
            buttons: [{text: 'OK', action: null}]
        });
    }
}

async function handleHelp() {
    speak(getText('lost-msg'));
    
    // Get location and show alert
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Save alert to localStorage
            const alertData = {
                type: 'lost',
                timestamp: new Date().toISOString(),
                location: { latitude: lat, longitude: lng },
                message: 'Patient pressed HELP button - needs assistance'
            };
            
            // Load existing data
            const sessionData = localStorage.getItem(`memorycare_${currentRefCode}`);
            if (sessionData) {
                const data = JSON.parse(sessionData);
                if (!data.lostAlerts) data.lostAlerts = [];
                data.lostAlerts.push(alertData);
                localStorage.setItem(`memorycare_${currentRefCode}`, JSON.stringify(data));
                console.log('✅ Location alert saved to session data');
            }
            
            // Also save to caregiver alerts for immediate notification
            const caregiverAlerts = JSON.parse(localStorage.getItem('memorycare_caregiver_alerts') || '[]');
            caregiverAlerts.unshift({
                type: 'lost',
                timestamp: new Date().toISOString(),
                location: { latitude: lat, longitude: lng },
                message: 'Patient needs help!',
                patientName: patientData?.patientProfile?.name || 'Patient'
            });
            localStorage.setItem('memorycare_caregiver_alerts', JSON.stringify(caregiverAlerts.slice(0, 100)));
            console.log('✅ Alert sent to caregiver');
            
            // Show alert with map option
            showLocationAlert(lat, lng);
            
        }, (error) => {
            console.error('Location error:', error);
            showCustomAlert({
                title: 'Location Access Needed',
                message: 'Please enable location services in your browser settings to share your location with your caregiver.',
                icon: '⚠️',
                type: 'warning',
                buttons: [{text: 'OK', action: null}]
            });
            speak('Unable to get location. Please enable location services.');
        });
    } else {
        showCustomAlert({
            title: 'Location Unavailable',
            message: 'Location services are not available on this device. Your caregiver has been notified without location.',
            icon: '❌',
            type: 'warning',
            buttons: [{text: 'OK', action: null}]
        });
        speak('Location services not available');
    }
}

// Show location alert with map option
function showLocationAlert(lat, lng) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 99999;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 20px; max-width: 500px; width: 90%; text-align: center;">
            <div style="font-size: 80px; margin: 20px 0;">🗺️</div>
            <h2 style="color: #ff9800; margin: 20px 0;">Location Sent!</h2>
            <p style="font-size: 18px; color: #333; margin: 20px 0;">
                Your caregiver has been notified of your location.
            </p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; font-family: monospace;">
                <strong>📍 Your Location:</strong><br>
                <div style="margin-top: 10px; font-size: 16px;">
                    Latitude: ${lat.toFixed(6)}<br>
                    Longitude: ${lng.toFixed(6)}
                </div>
            </div>
            
            <button onclick="window.open('https://www.google.com/maps?q=${lat},${lng}', '_blank')" 
                style="width: 100%; padding: 20px; background: #4285F4; color: white; border: none; border-radius: 15px; font-size: 18px; font-weight: bold; cursor: pointer; margin: 10px 0;">
                🗺️ Open in Google Maps
            </button>
            
            <button onclick="this.parentElement.parentElement.remove()" 
                style="width: 100%; padding: 20px; background: #4CAF50; color: white; border: none; border-radius: 15px; font-size: 18px; font-weight: bold; cursor: pointer; margin: 10px 0;">
                ✓ OK, Help is Coming
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-speak
    speak(`Your location has been sent. Latitude ${lat.toFixed(2)}, Longitude ${lng.toFixed(2)}. Help is on the way.`);
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

function waitForVideoReady(video, timeoutMs = 2500) {
    return new Promise((resolve, reject) => {
        if (!video) return reject(new Error('Video element missing'));
        if (video.videoWidth && video.videoHeight) return resolve(true);

        const onReady = () => {
            cleanup();
            resolve(true);
        };
        const onError = () => {
            cleanup();
            reject(new Error('Video failed to load'));
        };
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Timed out waiting for video'));
        }, timeoutMs);

        const cleanup = () => {
            clearTimeout(timer);
            video.removeEventListener('loadedmetadata', onReady);
            video.removeEventListener('canplay', onReady);
            video.removeEventListener('error', onError);
        };

        video.addEventListener('loadedmetadata', onReady);
        video.addEventListener('canplay', onReady);
        video.addEventListener('error', onError);
    });
}

async function openFaceRecognition() {
    openModal('faceModal');
    
    try {
        const video = document.getElementById('faceVideo');
        if (!video) {
            console.error('Video element not found');
            showCustomAlert({
                title: 'Camera Error',
                message: 'Video element is missing. Please reload the page.',
                icon: '❌',
                type: 'error',
                buttons: [{text: 'OK', action: null}]
            });
            return;
        }
        
        // Mobile autoplay safety
        video.muted = true;
        video.setAttribute('playsinline', '');

        // Request camera with fallbacks (some Android WebViews don't like facingMode constraints)
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
        } catch (e1) {
            console.warn('⚠️ Primary camera constraints failed, retrying with simpler constraints...', e1);
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        
        video.srcObject = videoStream;
        
        // Wait for video to be ready
        await video.play();
        try {
            await waitForVideoReady(video);
        } catch (e2) {
            console.warn('⚠️ Video not fully ready yet:', e2);
        }
        
        console.log('✅ Camera started successfully');
        speak('Point the camera at the person you want to recognize', 'en-US');
    } catch (error) {
        showCustomAlert({
            title: 'Camera Access Needed',
            message: 'Please allow camera access in your browser settings to use face recognition.',
            icon: '📸',
            type: 'warning',
            buttons: [{text: 'OK', action: null}]
        });
        console.error('Camera error:', error);
    }
}

function captureFace() {
    console.log('📸 CAPTURE BUTTON CLICKED');
    const video = document.getElementById('faceVideo');
    const canvas = document.getElementById('faceCanvas');
    
    if (!video || !canvas) {
        console.error('❌ Video or canvas element not found');
        console.log('Video element:', video);
        console.log('Canvas element:', canvas);
        showCustomAlert({
            title: 'Camera Not Ready',
            message: 'Camera elements are loading. Please try again in a moment.',
            icon: '⏳',
            type: 'warning',
            buttons: [{text: 'OK', action: null}]
        });
        return;
    }
    
    if (!video.videoWidth || !video.videoHeight) {
        console.warn('⚠️ Video not ready yet, waiting briefly...');
        waitForVideoReady(video).then(() => captureFace()).catch(() => {
            console.error('❌ Video not ready. Width:', video.videoWidth, 'Height:', video.videoHeight);
            console.log('Video readyState:', video.readyState);
            console.log('Video srcObject:', video.srcObject);
            showCustomAlert({
                title: 'Camera Loading',
                message: 'Camera is starting up. Please wait a moment and try again.',
                icon: '📹',
                type: 'warning',
                buttons: [{text: 'OK', action: null}]
            });
        });
        return;
    }
    
    // Show processing alert
    showCustomAlert({
        title: 'Analyzing Face...',
        message: 'Please wait while I recognize this person.',
        icon: '🔍',
        type: 'info',
        autoClose: true,
        duration: 2000
    });
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    console.log('📸 Face captured, analyzing...');
    speak('Analyzing face... Please wait.');
    
    // Stop video stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    // Simulate AI processing
    setTimeout(() => {
        loadPatientData();
        
        console.log('👥 Checking for known people...');
        console.log('Patient data:', patientData);
        console.log('Known people:', patientData.knownPeople);
        console.log('Known people count:', patientData.knownPeople?.length);
        
        if (patientData.knownPeople && patientData.knownPeople.length > 0) {
            // Match with known person (randomly for demo)
            const randomPerson = patientData.knownPeople[Math.floor(Math.random() * patientData.knownPeople.length)];
            
            console.log('✅ Person recognized:', randomPerson.name);
            speak(`I recognize this person! This is ${randomPerson.name}, your ${randomPerson.relation}.`);
            
            // Close face modal
            closeModal('faceModal');
            
            // Launch story mode directly after recognition
            setTimeout(() => {
                playAIStoryMode(randomPerson);
            }, 800);
        } else {
            console.error('❌ No known people in database!');
            console.log('Please add people in caregiver.html first');
            speak('I do not recognize this person. Please be careful.');
            showCustomAlert({
                title: 'Person Not Recognized',
                message: 'This person is not in your trusted contacts database. Please be careful and verify their identity.',
                icon: '⚠️',
                type: 'warning',
                buttons: [
                    {text: 'Call Caregiver', action: () => handleSOS()},
                    {text: 'OK', action: null}
                ]
            });
            closeModal('faceModal');
        }
    }, 2000);
}

// AI-Powered Immersive Story Mode - Auto-play all memories
function playAIStoryMode(person) {
    console.log('═══════════════════════════════════════════════');
    console.log('🎬 AI STORY MODE FUNCTION CALLED!');
    console.log('═══════════════════════════════════════════════');
    console.log('Person object:', person);
    console.log('Person name:', person?.name);
    console.log('Person relation:', person?.relation);
    console.log('Person photo:', person?.photo);
    console.log('Person voice note:', person?.voiceNote);
    console.log('Person timeline:', person?.timeline);
    console.log('═══════════════════════════════════════════════');
    
    // Create fullscreen immersive overlay
    const storyScreen = document.createElement('div');
    storyScreen.id = 'aiStoryScreen';
    storyScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999999;
        overflow-y: auto;
        animation: fadeIn 1s ease;
    `;
    
    // Generate AI story content
    const memories = person.timeline || [];
    const description = person.description || `This is ${person.name}, your beloved ${person.relation}. You share many wonderful memories together.`;
    
    console.log('📊 Timeline contents:');
    console.log('Total memories:', memories.length);
    memories.forEach((m, i) => {
        console.log(`  Memory ${i + 1}:`, {
            type: m.type,
            typeOf: typeof m.type,
            isNull: m.type === null,
            isUndefined: m.type === undefined,
            hasMedia: !!m.media,
            mediaLength: m.media?.length || 0,
            mediaStart: m.media?.substring(0, 50),
            caption: m.caption
        });
    });
    
    // Check for audio specifically
    const audioCheck = memories.filter(m => {
        console.log('Checking memory type:', m.type, 'equals audio?', m.type === 'audio');
        return m.type === 'audio';
    });
    console.log('Audio filter result:', audioCheck.length);
    
    // Build story HTML - ALL IN ONE PLACE
    let storyHTML = `
        <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 40px 20px;">
            
            <!-- Header Section with Large Circle for Photo/Video Playback -->
            <div style="text-align: center; animation: slideDown 1s ease; margin-bottom: 30px; position: relative;">
                <!-- LARGE Circle for Photo and Video Playback -->
                <div id="mediaCircle" style="position: relative; width: 450px; height: 450px; margin: 0 auto 20px; border-radius: 50%; overflow: hidden; border: 10px solid white; box-shadow: 0 10px 60px rgba(0,0,0,0.4); animation: float 3s ease-in-out infinite;">
                    ${person.photo ? 
                        `<img id="circleContent" src="${person.photo}" alt="${person.name}" style="width: 100%; height: 100%; object-fit: cover;">` 
                        : 
                        `<div id="circleContent" style="width: 100%; height: 100%; background: white; display: flex; align-items: center; justify-content: center; font-size: 200px;">👤</div>`
                    }
                </div>
                
                <h1 style="color: white; font-size: 64px; margin: 20px 0;
                    text-shadow: 0 4px 12px rgba(0,0,0,0.4); font-weight: bold;
                    animation: glow 2s ease-in-out infinite;">✨ ${person.name}</h1>
                
                <p style="color: rgba(255,255,255,0.95); font-size: 36px; margin: 15px 0;
                    text-shadow: 0 2px 8px rgba(0,0,0,0.3);">Your ${person.relation}</p>
                
                <!-- Current Playing Status -->
                <div id="currentPlayingStatus" style="margin-top: 20px; color: white; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); min-height: 30px;">
                    📷 Looking at ${person.name}
                </div>
            </div>
            
            <!-- About Section -->
            <div style="background: white; padding: 40px; border-radius: 25px; max-width: 900px;
                width: 90%; margin: 20px 0; box-shadow: 0 15px 50px rgba(0,0,0,0.4);
                animation: slideUp 0.8s ease;">
                <div style="font-size: 48px; text-align: center; margin-bottom: 20px;">📖</div>
                <h2 style="color: #667eea; font-size: 32px; text-align: center; margin-bottom: 20px;">
                    About ${person.name}</h2>
                <p id="storyDescription" style="font-size: 24px; line-height: 1.8; color: #333; text-align: center; margin: 20px 0;">
                    ${description}
                </p>
                <div id="playingIndicator" style="text-align: center; margin-top: 20px; font-size: 20px; color: #667eea; font-weight: bold;">
                    🔊 Playing Story...
                </div>
            </div>
            
            <!-- All Memories in One Section -->
            ${memories.length > 0 ? `
                <div style="width: 90%; max-width: 900px; margin: 20px 0;">
                    <h2 style="color: white; font-size: 48px; text-align: center; margin-bottom: 30px;
                        text-shadow: 0 4px 12px rgba(0,0,0,0.4);">💫 Precious Memories</h2>
                    
                    ${memories.map((moment, index) => {
                        const bgColors = [
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                        ];
                        
                        return `
                            <div id="memory-${index}" style="background: white; padding: 35px; border-radius: 25px; margin: 25px 0;
                                box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: slideUp 1s ease ${index * 0.15}s both;">
                                <div style="background: ${bgColors[index % bgColors.length]}; padding: 15px;
                                    border-radius: 15px; display: inline-block; margin-bottom: 20px;">
                                    <span style="color: white; font-size: 28px; font-weight: bold;">
                                        ${moment.type === 'video' ? '🎥' : '📷'} Memory ${index + 1}
                                    </span>
                                </div>
                                
                                ${moment.caption ? 
                                    `<p id="memory-caption-${index}" style="font-size: 22px; line-height: 1.7; color: #333; margin: 25px 0;
                                        padding: 20px; background: #f8f9fa; border-left: 5px solid #667eea;
                                        border-radius: 10px;">${moment.caption}</p>
                                    <div id="memory-playing-${index}" style="text-align: center; margin-top: 15px; font-size: 18px; color: #667eea; display: none;">
                                        🔊 Playing this memory...
                                    </div>` 
                                    : ''
                                }
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
            
            <!-- Close Button -->
            <button onclick="document.getElementById('aiStoryScreen').remove(); window.speechSynthesis.cancel();" 
                style="background: white; color: #667eea; border: none; padding: 25px 60px;
                font-size: 28px; border-radius: 20px; cursor: pointer; margin: 40px 0 60px;
                font-weight: bold; box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
                ✓ I Remember Now
            </button>
        </div>
    `;
    
    storyScreen.innerHTML = storyHTML;
    
    // Add animations
    if (!document.getElementById('story-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'story-animations';
        styleSheet.textContent = `
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
            @keyframes glow { 0%, 100% { text-shadow: 0 4px 12px rgba(0,0,0,0.4); } 50% { text-shadow: 0 4px 30px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.4); } }
            @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(storyScreen);
    
    console.log('🎬 Story screen added to body');
    console.log('📊 Person data:', {
        name: person.name,
        hasVoiceNote: !!person.voiceNote,
        voiceNoteURL: person.voiceNote,
        hasTimeline: !!person.timeline,
        timelineLength: person.timeline?.length || 0,
        timeline: person.timeline
    });
    
    // AUTO-PLAY SEQUENCE WITH CIRCLE VIDEO PLAYBACK
    let currentDelay = 2000; // Start after 2 seconds
    
    // 1. Play introduction
    setTimeout(() => {
        console.log('🗣️ Speaking introduction...');
        speak(`This is ${person.name}, your ${person.relation}.`);
    }, currentDelay);
    currentDelay += 4000;
    
    // 2. Play audio files from timeline - INSIDE THE CIRCLE
    const audioMoments = person.timeline?.filter(m => m.type === 'audio') || [];
    console.log('🎵 Audio moments found:', audioMoments.length);
    if (audioMoments.length > 0) {
        console.log('First audio moment:', {
            type: audioMoments[0].type,
            hasMedia: !!audioMoments[0].media,
            mediaPreview: audioMoments[0].media?.substring(0, 50) + '...',
            caption: audioMoments[0].caption
        });
    }
    if (audioMoments.length > 0) {
        const audioMoment = audioMoments[0]; // Play first audio
        console.log('✅ Audio file detected in timeline! Will play at delay:', currentDelay);
        setTimeout(() => {
            console.log('🎙️ NOW PLAYING VOICE NOTE...');
            const statusDiv = document.getElementById('currentPlayingStatus');
            const mediaCircle = document.getElementById('mediaCircle');
            
            console.log('Status div found:', !!statusDiv);
            console.log('Media circle found:', !!mediaCircle);
            
            if (statusDiv) statusDiv.textContent = '🎙️ Playing Voice Message...';
            
            // Show audio visualizer in circle while playing voice note
            if (mediaCircle) {
                console.log('🔄 Replacing circle content with audio player...');
                console.log('Audio URL:', audioMoment.media);
                mediaCircle.innerHTML = `
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="font-size: 120px; animation: pulse 1s infinite;">🎙️</div>
                        <div style="color: white; font-size: 32px; font-weight: bold; margin-top: 20px; text-align: center;">Playing Voice Message</div>
                        <audio id="voiceNotePlayer" autoplay controls style="width: 80%; margin-top: 30px;">
                            <source src="${audioMoment.media}" type="audio/ogg">
                            <source src="${audioMoment.media}" type="audio/mpeg">
                            <source src="${audioMoment.media}" type="audio/wav">
                            <source src="${audioMoment.media}" type="audio/webm">
                            <source src="${audioMoment.media}" type="audio/mp3">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                `;
                
                const audioPlayer = document.getElementById('voiceNotePlayer');
                console.log('Audio player element found:', !!audioPlayer);
                
                if (audioPlayer) {
                    console.log('🔊 Attempting to play audio:', audioMoment.media?.substring(0, 100));
                    console.log('Audio element ready state:', audioPlayer.readyState);
                    console.log('Audio element network state:', audioPlayer.networkState);
                    
                    // Try to load first
                    audioPlayer.load();
                    
                    audioPlayer.play().then(() => {
                        console.log('✅ AUDIO PLAYING SUCCESSFULLY!');
                    }).catch(e => {
                        console.error('❌ Audio play error:', e);
                        console.error('Error name:', e.name);
                        console.error('Error message:', e.message);
                    });
                    
                    audioPlayer.onended = () => {
                        console.log('Voice note ended, restoring photo');
                        const statusDiv = document.getElementById('currentPlayingStatus');
                        if (statusDiv) statusDiv.textContent = '📖 About ' + person.name;
                        
                        // Restore person's photo
                        if (mediaCircle && person.photo) {
                            mediaCircle.innerHTML = `<img id="circleContent" src="${person.photo}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        }
                    };
                    
                    audioPlayer.onerror = (e) => {
                        console.error('❌ Audio error event:', e);
                        console.error('Audio error code:', audioPlayer.error?.code);
                        console.error('Audio error message:', audioPlayer.error?.message);
                        console.error('Audio src:', audioPlayer.src);
                        console.error('Audio current src:', audioPlayer.currentSrc);
                    };
                    
                    audioPlayer.onloadstart = () => console.log('📥 Audio loading started...');
                    audioPlayer.onloadeddata = () => console.log('✅ Audio data loaded!');
                    audioPlayer.oncanplay = () => console.log('✅ Audio can play!');
                    audioPlayer.onplaying = () => console.log('▶️ Audio is playing!');
                    audioPlayer.onpause = () => console.log('⏸️ Audio paused');
                    audioPlayer.onstalled = () => console.error('⚠️ Audio stalled');
                } else {
                    console.error('❌ Could not create audio player element!');
                }
            } else {
                console.error('❌ Media circle not found!');
            }
            
            console.log('🎙️ Voice note setup complete');
        }, currentDelay);
        currentDelay += 35000; // Wait for voice note (assume ~30 seconds + buffer)
    } else {
        console.log('⚠️ No audio files found in timeline');
    }
    
    // 3. Play description
    setTimeout(() => {
        const indicator = document.getElementById('playingIndicator');
        const statusDiv = document.getElementById('currentPlayingStatus');
        if (statusDiv) statusDiv.textContent = '📖 Reading About ' + person.name;
        if (indicator) indicator.style.display = 'block';
        autoPlayText(description, () => {
            if (indicator) indicator.style.display = 'none';
        });
    }, currentDelay);
    currentDelay += estimateSpeechDuration(description) + 2000;
    
    // 4. Play each memory VIDEO/PHOTO in the circle and narrate caption (excluding audio files)
    const visualMemories = memories.filter(m => m.type !== 'audio'); // Don't play audio again
    console.log('📺 Visual memories to play:', visualMemories.length);
    visualMemories.forEach((m, i) => {
        console.log(`  ${i + 1}. Type: ${m.type}, Has media: ${!!m.media}`);
    });
    
    if (visualMemories.length > 0) {
        setTimeout(() => {
            speak(`Now let me show you the precious memories you share.`);
        }, currentDelay);
        currentDelay += 5000;
        
        visualMemories.forEach((moment, index) => {
            console.log(`⏰ Scheduling memory ${index + 1} at delay: ${currentDelay}ms`);
            setTimeout(() => {
                console.log(`▶️ NOW PLAYING memory ${index + 1}:`, moment.type);
                const circleContent = document.getElementById('circleContent');
                const mediaCircle = document.getElementById('mediaCircle');
                const statusDiv = document.getElementById('currentPlayingStatus');
                const memoryElement = document.getElementById(`memory-${index}`);
                const playingIndicator = document.getElementById(`memory-playing-${index}`);
                
                // Highlight memory text (removed scrollIntoView to prevent page jumping)
                if (memoryElement) {
                    memoryElement.style.border = '3px solid #667eea';
                }
                
                // Show playing indicator
                if (playingIndicator) playingIndicator.style.display = 'block';
                
                // Update status
                if (statusDiv) statusDiv.textContent = `${moment.type === 'video' ? '🎥' : '📷'} Memory ${index + 1}`;
                
                // PLAY VIDEO OR SHOW PHOTO IN THE CIRCLE
                if (moment.type === 'video' && moment.media) {
                    console.log(`🎥 Playing video ${index + 1} in circle`);
                    console.log('Video URL:', moment.media);
                    
                    // Replace circle content with video
                    if (mediaCircle) {
                        mediaCircle.innerHTML = `
                            <video id="circleVideo${index}" autoplay muted playsinline controls style="width: 100%; height: 100%; object-fit: cover; background: black;" src="${moment.media}">
                                Your browser does not support the video tag.
                            </video>
                        `;
                        
                        const video = document.getElementById(`circleVideo${index}`);
                        if (video) {
                            console.log('✅ Video element created, attempting to play...');
                            video.muted = true;
                            video.play().then(() => {
                                console.log('✅ Video playing successfully in circle!');
                            }).catch(err => {
                                console.error('❌ Video play error:', err);
                            });
                            
                            // When video ends, restore photo
                            video.onended = () => {
                                console.log('Video ended, restoring photo');
                                if (mediaCircle && person.photo) {
                                    mediaCircle.innerHTML = `<img id="circleContent" src="${person.photo}" style="width: 100%; height: 100%; object-fit: cover;">`;
                                }
                            };
                            
                            // Also restore on error
                            video.onerror = (e) => {
                                console.error('❌ Video error:', e);
                                if (mediaCircle && person.photo) {
                                    mediaCircle.innerHTML = `<img id="circleContent" src="${person.photo}" style="width: 100%; height: 100%; object-fit: cover;">`;
                                }
                            };
                        } else {
                            console.error('❌ Could not find video element');
                        }
                    } else {
                        console.error('❌ mediaCircle not found');
                    }
                } else if ((moment.type === 'photo' || moment.type === 'image') && moment.media) {
                    console.log(`📷 Showing photo ${index + 1} in circle`);
                    console.log('Photo URL:', moment.media);
                    
                    // Replace entire circle content with photo
                    if (mediaCircle) {
                        mediaCircle.innerHTML = `<img id="circleContent" src="${moment.media}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        console.log('✅ Photo displayed in circle');
                    }
                    
                    // Return to person's photo after 8 seconds
                    setTimeout(() => {
                        if (mediaCircle && person.photo) {
                            mediaCircle.innerHTML = `<img id="circleContent" src="${person.photo}" style="width: 100%; height: 100%; object-fit: cover;">`;
                            console.log('✅ Restored person photo');
                        }
                    }, 8000);
                }
                
                // Play caption narration
                if (moment.caption) {
                    autoPlayText(`Memory ${index + 1}. ${moment.caption}`, () => {
                        if (playingIndicator) playingIndicator.style.display = 'none';
                        if (memoryElement) memoryElement.style.border = 'none';
                    });
                }
            }, currentDelay);
            
            // Calculate delay for next memory
            const videoDuration = moment.type === 'video' ? 15000 : 8000; // Assume 15s for video, 8s for photo
            const captionDuration = moment.caption ? estimateSpeechDuration(moment.caption) : 0;
            currentDelay += videoDuration + captionDuration + 3000; // Add pause between memories
        });
    }
    
    // Animate background colors
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];
    let colorIndex = 0;
    const colorInterval = setInterval(() => {
        if (document.getElementById('aiStoryScreen')) {
            colorIndex = (colorIndex + 1) % gradients.length;
            storyScreen.style.background = gradients[colorIndex];
        } else {
            clearInterval(colorInterval);
        }
    }, 5000);
}

// Helper to estimate speech duration (rough calculation)
function estimateSpeechDuration(text) {
    // Average speaking rate: ~150 words per minute = 2.5 words per second
    const wordCount = text.split(' ').length;
    const duration = (wordCount / 2.5) * 1000; // Convert to milliseconds
    return Math.max(duration, 2000); // Minimum 2 seconds
}

// Helper for auto-playing text with callback
function autoPlayText(text, onComplete) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slightly slower for elderly
        utterance.pitch = 1;
        utterance.volume = 1;
        
        if (onComplete) {
            utterance.onend = onComplete;
        }
        
        window.speechSynthesis.speak(utterance);
    } else if (onComplete) {
        setTimeout(onComplete, estimateSpeechDuration(text));
    }
}

// Helper for text-to-speech
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
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
        </style>
        <div style="text-align: center; max-width: 900px; padding: 40px; animation: storyPulse 4s infinite;">
            <h1 style="color: white; font-size: 56px; margin-bottom: 30px; text-shadow: 0 4px 8px rgba(0,0,0,0.5);">
                ✨ ${person.name}
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 36px; margin-bottom: 40px;">
                ${person.relation}
            </p>
            
            ${person.photo ? `
                <img src="${person.photo}" style="
                    max-width: 400px;
                    max-height: 400px;
                    border-radius: 20px;
                    margin: 30px auto;
                    display: block;
                    animation: storyGlow 3s infinite;
                    border: 5px solid white;
                ">` : ''}
            
            ${person.description ? `
                <p style="color: white; font-size: 28px; line-height: 1.6; margin: 30px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    ${person.description}
                </p>` : ''}
            
            <div id="storyMediaContainer" style="margin: 40px 0;"></div>
            
            <button onclick="document.getElementById('storyModeOverlay').remove()" style="
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
    
    // Play voice recording if available
    const mediaContainer = document.getElementById('storyMediaContainer');
    
    // Play voice note uploaded by caregiver
    if (person.voiceNote) {
        console.log('🎵 Playing voice note...');
        mediaContainer.innerHTML += `
            <audio controls autoplay style="
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                display: block;
                border-radius: 10px;
            ">
                <source src="${person.voiceNote}" type="audio/mpeg">
            </audio>
        `;
    }
    
    // Play timeline media (photos and videos)
    if (person.timeline && person.timeline.length > 0) {
        console.log('📖 Playing timeline memories...');
        person.timeline.forEach((moment, index) => {
            if (moment.type === 'video') {
                console.log(`🎥 Playing video ${index + 1}...`);
                mediaContainer.innerHTML += `
                    <div style="margin: 30px 0;">
                        ${moment.caption ? `<p style="color: white; font-size: 24px; margin-bottom: 15px;">${moment.caption}</p>` : ''}
                        <video controls ${index === 0 ? 'autoplay' : ''} style="
                            max-width: 700px;
                            width: 100%;
                            margin: 10px auto;
                            display: block;
                            border-radius: 15px;
                            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                        ">
                            <source src="${moment.media}" type="video/mp4">
                        </video>
                    </div>
                `;
            } else if (moment.type === 'photo') {
                console.log(`📷 Showing photo ${index + 1}...`);
                mediaContainer.innerHTML += `
                    <div style="margin: 30px 0;">
                        ${moment.caption ? `<p style="color: white; font-size: 24px; margin-bottom: 15px;">${moment.caption}</p>` : ''}
                        <img src="${moment.media}" style="
                            max-width: 600px;
                            width: 100%;
                            border-radius: 15px;
                            margin: 10px auto;
                            display: block;
                            animation: storyGlow 3s infinite;
                            border: 4px solid white;
                        ">
                    </div>
                `;
            }
        });
    }
    
    // Speak the story in selected language
    const storyText = `This is ${person.name}, your ${person.relation}. ${person.description || ''}`;
    setTimeout(() => {
        speak(storyText, languageCodes[currentLanguage]);
    }, 1000);
    
    // Repeat voice every 15 seconds for memory reinforcement
    const repeatInterval = setInterval(() => {
        if (document.getElementById('storyModeOverlay')) {
            speak(`${person.name}, your ${person.relation}`, languageCodes[currentLanguage]);
        } else {
            clearInterval(repeatInterval);
        }
    }, 15000);
}

// Show Routine
async function showRoutine() {
    await loadPatientData(); // Reload fresh data
    
    console.log('📅 showRoutine() - Patient data:', patientData);
    console.log('📅 showRoutine() - Daily routine:', patientData.dailyRoutine);
    console.log('📅 showRoutine() - Routine count:', patientData.dailyRoutine?.length || 0);
    
    openModal('routineModal');
    
    const display = document.getElementById('routineDisplay');
    
    if (patientData.dailyRoutine && patientData.dailyRoutine.length > 0) {
        display.innerHTML = patientData.dailyRoutine
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(item => `
                <div class="info-item" style="background: white; padding: 20px; margin: 15px 0; border-radius: 15px; border-left: 5px solid #4CAF50;">
                    <div class="info-item-title" style="font-size: 24px; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">⏰ ${item.time}</div>
                    <div class="info-item-detail" style="font-size: 20px; color: #333;">${item.activity}</div>
                </div>
            `).join('');
    } else {
        display.innerHTML = '<p class="large-text" style="text-align: center; padding: 40px; font-size: 20px; color: #666;">No routine set yet. Ask your caregiver to add activities.</p>';
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
        speak(text);
    }
}

// Show Medicines
async function showMedicines() {
    await loadPatientData(); // Reload fresh data
    
    console.log('💊 showMedicines() - Patient data:', patientData);
    console.log('💊 showMedicines() - Medicines:', patientData.medicines);
    console.log('💊 showMedicines() - Medicines count:', patientData.medicines?.length || 0);
    
    openModal('medicineModal');
    
    const display = document.getElementById('medicineDisplay');
    
    if (patientData.medicines && patientData.medicines.length > 0) {
        display.innerHTML = patientData.medicines
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(med => `
                <div class="medicine-card ${med.taken ? 'taken' : ''}" style="background: white; padding: 25px; margin: 15px 0; border-radius: 15px; border-left: 5px solid #4CAF50;">
                    <div class="medicine-name" style="font-size: 26px; font-weight: bold; color: #333; margin-bottom: 10px;">💊 ${med.name}</div>
                    <div class="medicine-time" style="font-size: 22px; color: #4CAF50; margin-bottom: 8px;">⏰ ${med.time}</div>
                    <div class="medicine-dosage" style="font-size: 20px; color: #666; margin-bottom: 8px;">${med.dosage}</div>
                    ${med.instructions ? `<div class="medicine-instructions" style="font-size: 18px; color: #888; margin-top: 10px;">${med.instructions}</div>` : ''}
                    ${med.taken ? '<div style="color: green; font-size: 20px; margin-top: 10px;">✓ Taken</div>' : ''}
                </div>
            `).join('');
    } else {
        display.innerHTML = '<p class="large-text" style="text-align: center; padding: 40px; font-size: 20px; color: #666;">No medicines scheduled.</p>';
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

// Show People with Memory Timeline Story Mode
async function showPeople() {
    await loadPatientData(); // Reload fresh data
    
    console.log('👥 showPeople() - Patient data:', patientData);
    console.log('👥 showPeople() - Known people:', patientData.knownPeople);
    console.log('👥 showPeople() - Known people count:', patientData.knownPeople?.length || 0);
    
    openModal('peopleModal');
    
    const display = document.getElementById('peopleDisplay');
    
    if (patientData.knownPeople && patientData.knownPeople.length > 0) {
        console.log('✅ Displaying', patientData.knownPeople.length, 'people');
        display.innerHTML = patientData.knownPeople.map(person => `
            <div class="info-item" style="background: white; padding: 25px; margin: 15px 0; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer;" onclick="showPersonStory(${person.id})">
                ${person.photo ? `
                    <img src="${person.photo}" alt="${person.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto 15px auto; border: 4px solid #4CAF50;">
                ` : ''}
                <div class="info-item-title" style="font-size: 28px; font-weight: bold; color: #333; text-align: center; margin-bottom: 10px;">👤 ${person.name}</div>
                <div class="info-item-detail" style="font-size: 22px; color: #666; text-align: center;"><strong>Relation:</strong> ${person.relation}</div>
                ${person.description ? `<div class="info-item-detail" style="font-size: 18px; color: #888; text-align: center; margin-top: 10px;">${person.description}</div>` : ''}
                ${person.timeline && person.timeline.length > 0 ? `<div style="text-align: center; margin-top: 15px; color: #4CAF50; font-size: 18px;">📖 ${person.timeline.length} Memory Moments - Tap to View</div>` : ''}
            </div>
        `).join('');
    } else {
        display.innerHTML = '<p class="large-text" style="text-align: center; padding: 40px; font-size: 20px; color: #666;">No people added yet.</p>';
    }
}

// Show person's story with timeline
function showPersonStory(personId) {
    const person = patientData.knownPeople.find(p => p.id === personId);
    if (!person) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 999999;
        overflow-y: auto;
        padding: 20px;
    `;
    
    let timelineHTML = '';
    if (person.timeline && person.timeline.length > 0) {
        timelineHTML = person.timeline.map((moment, index) => `
            <div style="background: white; padding: 30px; border-radius: 20px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="font-size: 24px; font-weight: bold; color: #4CAF50; margin-bottom: 15px;">📖 Memory ${index + 1}</div>
                ${moment.media ? 
                    (moment.type === 'video' ? 
                        `<video src="${moment.media}" controls style="width: 100%; border-radius: 15px; margin-bottom: 20px;"></video>` : 
                        `<img src="${moment.media}" style="width: 100%; border-radius: 15px; margin-bottom: 20px;">`
                    ) : ''
                }
                ${moment.caption ? `<p style="font-size: 20px; color: #333; line-height: 1.6;">${moment.caption}</p>` : ''}
                <button onclick="speakText('${moment.caption ? moment.caption.replace(/'/g, "\\'") : 'Memory moment'}')" 
                    style="width: 100%; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 10px; font-size: 18px; margin-top: 15px; cursor: pointer;">
                    🔊 Read This to Me
                </button>
            </div>
        `).join('');
    }
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 25px; max-width: 600px; width: 100%; margin: auto; padding: 30px; position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" 
                style="position: absolute; top: 20px; right: 20px; background: #f44336; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 30px; cursor: pointer; line-height: 1;">×</button>
            
            ${person.photo ? `
                <img src="${person.photo}" alt="${person.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; display: block; margin: 20px auto; border: 5px solid #4CAF50;">
            ` : ''}
            
            <h1 style="text-align: center; color: #333; font-size: 36px; margin: 20px 0;">${person.name}</h1>
            <p style="text-align: center; font-size: 24px; color: #666; margin-bottom: 20px;">${person.relation}</p>
            
            ${person.description ? `
                <div style="background: #f5f5f5; padding: 25px; border-radius: 15px; margin: 20px 0;">
                    <p style="font-size: 20px; color: #333; line-height: 1.6;">${person.description}</p>
                </div>
            ` : ''}
            
            ${timelineHTML ? `
                <h2 style="color: #4CAF50; font-size: 28px; margin: 30px 0 20px 0; text-align: center;">📖 Our Memories Together</h2>
                ${timelineHTML}
            ` : '<p style="text-align: center; color: #888; font-size: 18px; margin: 30px 0;">No memories added yet.</p>'}
            
            <button onclick="speakText('This is ${person.name}. ${person.relation}. ${person.description || ''}')" 
                style="width: 100%; padding: 20px; background: #4CAF50; color: white; border: none; border-radius: 15px; font-size: 22px; font-weight: bold; cursor: pointer; margin-top: 20px;">
                🔊 Tell Me About ${person.name}
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Helper function to speak text
function speakText(text) {
    speak(text);
}

function speakPeople() {
    if (patientData.knownPeople && patientData.knownPeople.length > 0) {
        let text = 'People you know: ';
        patientData.knownPeople.forEach(person => {
            text += `${person.name}, your ${person.relation}. `;
        });
        speak(text);
    }
}

// Show Places
async function showPlaces() {
    await loadPatientData(); // Reload fresh data
    openModal('placesModal');
    
    const display = document.getElementById('placesDisplay');
    
    if (patientData.knownPlaces && patientData.knownPlaces.length > 0) {
        display.innerHTML = patientData.knownPlaces.map(place => `
            <div class="info-item" style="background: white; padding: 25px; margin: 15px 0; border-radius: 15px; border-left: 5px solid #2196F3;">
                <div class="info-item-title" style="font-size: 26px; font-weight: bold; color: #2196F3; margin-bottom: 10px;">📍 ${place.name}</div>
                <div class="info-item-detail" style="font-size: 20px; color: #666; margin-bottom: 8px;"><strong>Address:</strong> ${place.address}</div>
                ${place.description ? `<div class="info-item-detail" style="font-size: 18px; color: #888; margin-top: 10px;">${place.description}</div>` : ''}
                ${place.lat && place.lng ? `
                    <button onclick="window.open('https://www.google.com/maps?q=${place.lat},${place.lng}', '_blank')" 
                        style="width: 100%; padding: 15px; background: #4285F4; color: white; border: none; border-radius: 10px; font-size: 18px; margin-top: 15px; cursor: pointer;">
                        🗺️ Open in Maps
                    </button>
                ` : ''}
            </div>
        `).join('');
    } else {
        display.innerHTML = '<p class="large-text" style="text-align: center; padding: 40px; font-size: 20px; color: #666;">No places added yet.</p>';
    }
}

function speakPlaces() {
    if (patientData.knownPlaces && patientData.knownPlaces.length > 0) {
        let text = 'Important places: ';
        patientData.knownPlaces.forEach(place => {
            text += `${place.name}, located at ${place.address}. `;
        });
        speak(text);
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
    console.log('⏰ STARTING REMINDER CHECKS...');
    
    // Check every 30 seconds for more accuracy
    medicineCheckInterval = setInterval(checkMedicineReminders, 30000);
    watchCheckInterval = setInterval(checkWatchReminder, 60000);
    setInterval(checkRoutineReminders, 30000);
    
    console.log('✅ Reminder intervals set up');
    
    // Check immediately after 2 seconds
    setTimeout(() => {
        console.log('🔍 Running initial reminder checks...');
        checkMedicineReminders();
        checkWatchReminder();
        checkRoutineReminders();
    }, 2000);
}

// Track last alert time to prevent duplicates
let lastMedicineAlertTime = '';

async function checkMedicineReminders() {
    await loadPatientData();
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log(`🔍 Checking medicine reminders at ${currentTime}`);
    
    if (patientData.medicines && patientData.medicines.length > 0) {
        console.log(`📋 Found ${patientData.medicines.length} medicines to check:`);
        patientData.medicines.forEach(medicine => {
            console.log(`  - ${medicine.name} scheduled at ${medicine.time}`);
            const alertKey = `${medicine.id}_${currentTime}`;
            if (medicine.time === currentTime && lastMedicineAlertTime !== alertKey) {
                console.log(`🎯 MATCH! Showing alert for ${medicine.name}`);
                lastMedicineAlertTime = alertKey;
                showMedicineReminder(medicine);
            }
        });
    } else {
        console.log('ℹ️ No medicines scheduled');
    }
}

function showMedicineReminder(medicine) {
    console.log('🔔 SHOWING MEDICINE REMINDER:', medicine.name);
    
    // Play alert sound FIRST
    playAlertSound();
    
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
    
    const medicineId = medicine.id || Date.now();
    
    alertDiv.innerHTML = `
        <h2 style="font-size: 56px; margin: 0 0 20px 0;">💊 Medicine Time!</h2>
        <p style="font-size: 36px; margin: 20px 0; font-weight: bold;">${medicine.name}</p>
        <p style="font-size: 28px; margin: 20px 0;">${medicine.dosage}</p>
        <p style="font-size: 24px; margin: 20px 0;">⏰ ${medicine.time}</p>
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
            <button id="takeMedBtn_${medicineId}" style="
                background: white;
                color: #f5576c;
                border: none;
                padding: 20px 40px;
                font-size: 24px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
            ">✓ Taken</button>
            <button id="snoozeMedBtn_${medicineId}" style="
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
    speak(`Medicine time! Please take your medicine: ${medicine.name}, ${medicine.dosage}`);
    setTimeout(() => speak(`${medicine.name}, ${medicine.dosage}`), 3000);
    
    // Play sound again after 2 seconds
    setTimeout(() => playAlertSound(), 2000);
    
    // Setup buttons with safe element checking
    setTimeout(() => {
        const takenBtn = document.getElementById(`takeMedBtn_${medicineId}`);
        const snoozeBtn = document.getElementById(`snoozeMedBtn_${medicineId}`);
        
        if (takenBtn) {
            takenBtn.onclick = async () => {
                if (medicine.id) await markMedicineTaken(medicine.id);
                alertDiv.remove();
                speak('Good job! Medicine marked as taken');
            };
        }
        
        if (snoozeBtn) {
            snoozeBtn.onclick = () => {
                alertDiv.remove();
                speak('I will remind you again in 10 minutes');
                setTimeout(() => showMedicineReminder(medicine), 10 * 60 * 1000);
            };
        }
    }, 100);
}

// Track last routine alert time
let lastRoutineAlertTime = '';

async function checkRoutineReminders() {
    await loadPatientData();
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log(`🔍 Checking routine reminders at ${currentTime}`);
    
    if (patientData.dailyRoutine && patientData.dailyRoutine.length > 0) {
        console.log(`📋 Found ${patientData.dailyRoutine.length} routines to check:`);
        patientData.dailyRoutine.forEach((routine, index) => {
            console.log(`  - ${routine.activity} scheduled at ${routine.time}`);
            const alertKey = `${index}_${currentTime}`;
            if (routine.time === currentTime && lastRoutineAlertTime !== alertKey) {
                console.log(`🎯 MATCH! Showing alert for ${routine.activity}`);
                lastRoutineAlertTime = alertKey;
                showRoutineReminder(routine);
            }
        });
    } else {
        console.log('ℹ️ No routines scheduled');
    }
}

function showRoutineReminder(routine) {
    console.log('🔔 SHOWING ROUTINE REMINDER:', routine.activity);
    
    // Play alert sound multiple times
    playAlertSound();
    setTimeout(() => playAlertSound(), 800);
    setTimeout(() => playAlertSound(), 1600);
    
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
    if (reminder) {
        reminder.style.display = 'block';
    }
    
    speak('Watch charging time! Please charge your watch now.', 'en-US');
    setTimeout(() => {
        speak('Meeru mee watch charge cheyandi.', 'te-IN');
    }, 3000);
    
    const acknowledgeBtn = document.getElementById('acknowledgeWatchBtn');
    if (acknowledgeBtn) {
        acknowledgeBtn.onclick = () => {
            if (reminder) {
                reminder.style.display = 'none';
            }
            speak('Thank you!', 'en-US');
        };
    }
}
