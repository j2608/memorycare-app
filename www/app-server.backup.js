require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const axios = require('axios');
const admin = require('firebase-admin');
const fs = require('fs');

console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);

// Initialize Firebase Admin
let db;
try {
  const serviceAccount = require('./firebase-config.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://YOUR-PROJECT.firebaseio.com"
  });
  db = admin.database();
  console.log('✅ Firebase connected successfully!');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('📝 Please follow FIREBASE_SETUP.md to configure Firebase');
  pFirebase database reference
const sessionsRef = () => db.ref('sessions');

// Function to generate unique reference code
function generateReferenceCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Function to create new patient session (Firebase)
async function createPatientSession() {
  const refCode = generateReferenceCode();
  const sessionData = {
    referenceCode: refCode,
    createdAt: new Date().toISOString(),
    patientProfile: {},
    dailyRoutine: [],
    knownPeople: [],
    knownPlaces: [],
    medicines: [],
    appointments: [],
    watchChargingTime: '22:00',
    sosAlerts: [],
    lostAlerts: [],
    missedMedicines: [],
    securityAlerts: [],
    emergencyContacts: [],
    homeLocation: null
  };
  
  await sessionsRef().child(refCode).set(sessionData);
  return refCode;
}

// Helper function to get session from Firebase
async function getSessionData(refCode) {
  if (!refCode) return null;
  const snapshot = await sessionsRef().child(refCode).once('value');
  return snapshot.val()= generateReferenceCode();
  patientSessions[refCode] = {
    referenceCode: refCode,
    createdAt: new Date().toISOSasync (req, res) => {
  try {
    const refCode = await createPatientSession();
    res.json({ success: true, referenceCode: refCode });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).jsoasync (req, res) => {
  try {
    const { referenceCode } = req.body;
    const sessionData = await getSessionData(referenceCode);
    
    if (sessionData) {
      currentReferenceCode = referenceCode;
      res.json({ success: true, data: sessionData });
    } else {
      res.status(404).json({ success: false, error: 'Invalid reference code' });
    }
  } catch (error) {async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const sessionData = await getSessionData(refCode);
    
    if (sessionData) {
      res.json(sessionData);
    } else {
      // Return empty session if no code
      res.json({
        patientProfile: {},
        dailyRoutine: [],
        knownPeople: [],
        knownPlaces: [],
        medicines: [],
        appointments: [],
        watchChargingTime: '22:00',
        sosAlerts: [],
        lostAlerts: [],
        missedMedicines: [],
        securityAlerts: [],
        emergencyContacts: [],
        homeLocation: null
      });
    } (async for Firebase)
async function getSession(req) {
  const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
  console.log('🔍 getSession - refCode:', refCode);
  return await getSessionData(refCode) get reference code
app.post('/api/create-session', (req, res) => {
  const refCode = createPatientSession();
  res.json({ success: true, referenceCode: refCode });
});

// Login with reference code
app.post('/api/login', (req, res) => {
  const { referenceCode } = req.body;
  if (patientSessions[referenceCode]) {
    currentReferenceCode = referenceCode;
    res.json({ success: true, data: patientSessions[referenceCode] });
  } else {
    res.status(404).json({ success: false, error: 'Invalid reference code' });
  }
});

// Get all data (requires reference code)
app.get('/api/data', (req, res) => {
  const refCode = req.query.refCode || currentReferenceCode;
  if (refCode && patientSessions[refCode]) {
    res.json(patientSessions[refCode]);
  } else {
    // Return empty session if no code
    res.json({
      patientProfile: {},
      dailyRoutine: [],
      knownPeople: [],
      knownPlaces: [],
      medicines: [],
      appointments: [],
      watchChargingTime: '22:00',
      sosAlerts: [],
      lostAlerts: [],
      missedMedicines: [],
      securityAlerts: [],
      emergencyContacts: [],
      homeLocation: null
    });
  }
});

// Helper function to get session
function getSession(req) {
  const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
  console.log('🔍 getSession - refCode:', refCode, '| Available sessions:', Object.keys(patientSessions));
  return patientSessions[refCode];
}

// Home Location
app.post('/api/home-location', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.homeLocation = req.body;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Emergency Contacts management
app.get('/api/contacts', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.emergencyContacts : []);
});

app.post('/api/contacts', (req, res) => {
  const session = getSession(req);
  if (session) {
    const contactData = { ...req.body };
    delete contactData.refCode; // Remove refCode from stored data
    const contact = { id: Date.now(), ...contactData };
    session.emergencyContacts.push(contact);
    console.log('Emergency contact added:', contact.name);
    res.json({ success: true, contact: contact });
  } else {
    console.error('Session not found for contacts');
    res.status(404).json({ error: 'Session not found' });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.emergencyContacts = session.emergencyContacts.filter(c => c.id != req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Update patient profile
app.post('/api/patient-profile', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    
    if (session) {
      const profileData = { ...req.body };
      delete profileData.refCode;
      session.patientProfile = { ...session.patientProfile, ...profileData };
      
      await sessionsRef().child(refCode).child('patientProfile').set(session.patientProfile);
      console.log('Profile updated:', session.patientProfile);
      res.json({ success: true, profile: session.patientProfile });
    } else {
      console.error('Session not found for profile');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Daily routine management
app.get('/api/routine', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    res.json(session ? session.dailyRoutine : []);
  } catch (error) {
    console.error('Get routine error:', error);
    res.json([]);
  }
});

app.post('/api/routine', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    
    if (session) {
      const routine = { id: Date.now(), ...req.body };
      delete routine.refCode;
      
      if (!session.dailyRoutine) session.dailyRoutine = [];
      session.dailyRoutine.push(routine);
      
      await sessionsRef().child(refCode).child('dailyRoutine').set(session.dailyRoutine);
      console.log('Routine added:', routine);
      res.json({ success: true, routine: routine });
    } else {
      console.error('Session not found for routine');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Add routine error:', error);
    res.status(500).json({ error: 'Failed to add routine' });
  }
});

app.delete('/api/routine/:id', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    
    if (session) {
      session.dailyRoutine = session.dailyRoutine.filter(r => r.id != req.params.id);
      await sessionsRef().child(refCode).child('dailyRoutine').set(session.dailyRoutine);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Delete routine error:', error);
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

// Known people management
app.get('/api/people', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    res.json(session ? session.knownPeople : []);
  } catch (error) {
    console.error('Get people error:', error);
    res.json([]);
  }
});

app.post('/api/people', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    
    if (session) {
      const personData = { ...req.body };
      delete personData.refCode;
      const person = { id: Date.now(), ...personData };
      
      if (!session.knownPeople) session.knownPeople = [];
      session.knownPeople.push(person);
      
      await sessionsRef().child(refCode).child('knownPeople').set(session.knownPeople);
      console.log('Person added:', person.name);
      res.json({ success: true, person: person });
    } else {
      console.error('Session not found for people');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Add person error:', error);
    res.status(500).json({ error: 'Failed to add person' });
  }
});

app.delete('/api/people/:id', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.knownPeople = session.knownPeople.filter(p => p.id != req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Known places management
app.get('/api/places', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.knownPlaces : []);
});

app.post('/api/places', (req, res) => {
  const session = getSession(req);
  if (session) {
    const placeData = { ...req.body };
    delete placeData.refCode; // Remove refCode from stored data
    const place = { id: Date.now(), ...placeData };
    session.knownPlaces.push(place);
    console.log('Place added:', place.name);
    res.json({ success: true, place: place });
  } else {
    console.error('Session not found for places');
    res.status(404).json({ error: 'Session not found' });
  }
});

app.delete('/api/places/:id', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.knownPlaces = session.knownPlaces.filter(p => p.id != req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Medicine management
app.get('/api/medicines', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.medicines : []);
});

app.post('/api/medicines', (req, res) => {
  const session = getSession(req);
  if (session) {
    const medicineData = { ...req.body };
    delete medicineData.refCode; // Remove refCode from stored data
    const medicine = { id: Date.now(), taken: false, ...medicineData };
    session.medicines.push(medicine);
    console.log('Medicine added:', medicine.name);
    res.json({ success: true, medicine: medicine });
  } else {
    console.error('Session not found for medicines');
    res.status(404).json({ error: 'Session not found' });
  }
});

app.post('/api/medicines/:id/taken', (req, res) => {
  const session = getSession(req);
  if (session) {
    const medicine = session.medicines.find(m => m.id == req.params.id);
    if (medicine) {
      medicine.taken = true;
      medicine.takenAt = new Date().toISOString();
    }
    res.json({ success: true, data: medicine });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.delete('/api/medicines/:id', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.medicines = session.medicines.filter(m => m.id != req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Appointments management
app.get('/api/appointments', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.appointments : []);
});

app.post('/api/appointments', (req, res) => {
  const session = getSession(req);
  if (session) {
    const appointmentData = { ...req.body };
    delete appointmentData.refCode; // Remove refCode from stored data
    const appointment = { id: Date.now(), ...appointmentData };
    session.appointments.push(appointment);
    console.log('Appointment added:', appointment.title);
    res.json({ success: true, appointment: appointment });
  } else {
    console.error('Session not found for appointments');
    res.status(404).json({ error: 'Session not found' });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.appointments = session.appointments.filter(a => a.id != req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Watch charging time
app.post('/api/watch-charging', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.watchChargingTime = req.body.time;
    res.json({ success: true, time: session.watchChargingTime });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.get('/api/watch-charging', (req, res) => {
  const session = getSession(req);
  res.json({ time: session ? session.watchChargingTime : '22:00' });
});

// SOS alert
app.post('/api/sos', (req, res) => {
  const session = getSession(req);
  const alert = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    location: req.body.location,
    type: 'sos'
  };
  if (session) {
    session.sosAlerts.push(alert);
  }
  res.json({ success: true, data: alert });
});

app.get('/api/sos', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.sosAlerts : []);
});

// Mock Face API - Detect faces (since Azure not available)
app.post('/api/face/detect', async (req, res) => {
  try {
    // Mock response: always detect one face
    const mockFace = {
      faceId: 'mock-face-id-' + Date.now(),
      faceRectangle: { top: 100, left: 100, width: 200, height: 200 }
    };

    res.json({ faces: [mockFace] });
  } catch (error) {
    console.error('Face detection error:', error);
    res.status(500).json({ error: 'Face detection failed' });
  }
});

// Mock Face API - Identify person (since Azure not available)
app.post('/api/face/identify', async (req, res) => {
  try {
    // Mock response: identify as known person
    const mockResult = {
      faceId: req.body.faceId,
      candidates: [{
        personId: 'known-person-1',
        confidence: 0.8
      }]
    };

    res.json({ results: [mockResult] });
  } catch (error) {
    console.error('Face identification error:', error);
    res.status(500).json({ error: 'Face identification failed' });
  }
});

// OpenAI - Text to Speech
app.post('/api/speech/synthesize', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    const { text, language = 'en', voice = 'alloy' } = req.body;

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length
    });
    res.send(response.data);
  } catch (error) {
    console.error('Speech synthesis error:', error);
    res.status(500).json({ error: 'Speech synthesis failed' });
  }
});

// OpenStreetMap Nominatim - Get location info
app.get('/api/maps/location/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: 'json',
          lat: lat,
          lon: lng,
          zoom: 18,
          addressdetails: 1
        }
      }
    );

    res.json({ addresses: [response.data] });
  } catch (error) {
    console.error('Maps API error:', error);
    res.status(500).json({ error: 'Location lookup failed' });
  }
});

// OpenAI - Generate memory stories
app.post('/api/openai/generate-story', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate assistant helping create memory stories for Alzheimer\'s patients. Keep responses warm, simple, and focused on positive memories.'
          },
          {
            role: 'user',
            content: `Create a simple, warm memory story based on: ${prompt}. Context: ${context || 'family memories'}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ story: response.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Story generation failed' });
  }
});

// Lost alert
app.post('/api/lost', (req, res) => {
  const session = getSession(req);
  const alert = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    location: req.body.location,
    type: 'lost'
  };
  if (session) {
    session.lostAlerts.push(alert);
  }
  res.json({ success: true, data: alert });
});

// Unknown Person Alert
app.post('/api/unknown-person', (req, res) => {
  const session = getSession(req);
  const alert = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    location: req.body.location,
    type: 'unknown_person'
  };
  if (session) {
    if (!session.securityAlerts) session.securityAlerts = [];
    session.securityAlerts.push(alert);
  }
  res.json({ success: true, data: alert });
});

app.get('/api/lost', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.lostAlerts : []);
});

// Get Security Alerts
app.get('/api/security-alerts', (req, res) => {
  const session = getSession(req);
  res.json(session ? (session.securityAlerts || []) : []);
});

// Live location sharing
app.post('/api/live-location', (req, res) => {
  const session = getSession(req);
  const liveLocation = {
    id: Date.now(),
    timestamp: req.body.location.timestamp,
    location: {
      latitude: req.body.location.latitude,
      longitude: req.body.location.longitude
    },
    live: true
  };
  
  if (session) {
    session.lostAlerts.push(liveLocation);
  }
  res.json({ success: true, data: liveLocation });
});

// Voice recording for people
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/people-voice', upload.single('voiceRecording'), (req, res) => {
  const session = getSession(req);
  const personId = req.body.personId;
  const voiceFile = req.file;
  
  if (voiceFile && personId && session) {
    const person = session.knownPeople.find(p => p.id == personId);
    if (person) {
      person.voiceRecording = `/uploads/${voiceFile.filename}`;
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Person not found' });
    }
  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Missed medicine alert
app.post('/api/missed-medicine', (req, res) => {
  const session = getSession(req);
  const alert = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    medicineName: req.body.medicineName
  };
  if (session) {
    session.missedMedicines.push(alert);
  }
  res.json({ success: true, data: alert });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/landing.html');
});

app.get('/patient', (req, res) => {
  res.sendFile(__dirname + '/patient.html');
});

app.get('/caregiver', (req, res) => {
  res.sendFile(__dirname + '/caregiver.html');
});

app.get('/role-selection', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

console.log('About to listen on port:', port);

app.listen(port, '127.0.0.1', (err) => {
  if (err) {
    console.error('Listen error:', err);
    return;
  }
  console.log(`Memory Care App running at http://localhost:${port}`);
  console.log('Server started successfully');
  console.log('Listening on port:', port);
});

// Keep the event loop alive (removed for debugging)
// setInterval(() => {
//   // Do nothing, just keep alive
// }, 1000);
