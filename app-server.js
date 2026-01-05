require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const axios = require('axios');

console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);

// Increase limit for base64 images/videos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory data storage - stores multiple patient sessions by reference code
let patientSessions = {};

// Function to generate unique reference code
function generateReferenceCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Function to create new patient session
function createPatientSession() {
  const refCode = generateReferenceCode();
  patientSessions[refCode] = {
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
  return refCode;
}

// Legacy appData for backward compatibility
let currentReferenceCode = null;

console.log('Using alternative APIs: OpenAI, OpenStreetMap');

// Helper function to get session
function getSession(req) {
  const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
  return patientSessions[refCode];
}

// Create new patient session and get reference code
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

// Get all data
app.get('/api/data', (req, res) => {
  const refCode = req.query.refCode || currentReferenceCode;
  if (refCode && patientSessions[refCode]) {
    res.json(patientSessions[refCode]);
  } else {
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

// Emergency Contacts
app.get('/api/contacts', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.emergencyContacts : []);
});

app.post('/api/contacts', (req, res) => {
  const session = getSession(req);
  if (session) {
    const contactData = { ...req.body };
    delete contactData.refCode;
    const contact = { id: Date.now(), ...contactData };
    session.emergencyContacts.push(contact);
    res.json({ success: true, contact: contact });
  } else {
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

// Patient Profile
app.post('/api/patient-profile', (req, res) => {
  const session = getSession(req);
  if (session) {
    const profileData = { ...req.body };
    delete profileData.refCode;
    session.patientProfile = { ...session.patientProfile, ...profileData };
    res.json({ success: true, profile: session.patientProfile });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Daily Routine
app.get('/api/routine', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.dailyRoutine : []);
});

app.post('/api/routine', (req, res) => {
  const session = getSession(req);
  if (session) {
    const routine = { id: Date.now(), ...req.body };
    delete routine.refCode;
    session.dailyRoutine.push(routine);
    res.json({ success: true, routine: routine });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.delete('/api/routine/:id', (req, res) => {
  const session = getSession(req);
  if (session) {
    session.dailyRoutine = session.dailyRoutine.filter(r => r.id != req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Known People
app.get('/api/people', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.knownPeople : []);
});

app.post('/api/people', (req, res) => {
  const session = getSession(req);
  if (session) {
    const personData = { ...req.body };
    delete personData.refCode;
    const person = { id: Date.now(), ...personData };
    session.knownPeople.push(person);
    res.json({ success: true, person: person });
  } else {
    res.status(404).json({ error: 'Session not found' });
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

// Known Places
app.get('/api/places', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.knownPlaces : []);
});

app.post('/api/places', (req, res) => {
  const session = getSession(req);
  if (session) {
    const placeData = { ...req.body };
    delete placeData.refCode;
    const place = { id: Date.now(), ...placeData };
    session.knownPlaces.push(place);
    res.json({ success: true, place: place });
  } else {
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

// Medicines
app.get('/api/medicines', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.medicines : []);
});

app.post('/api/medicines', (req, res) => {
  const session = getSession(req);
  if (session) {
    const medicineData = { ...req.body };
    delete medicineData.refCode;
    const medicine = { id: Date.now(), taken: false, ...medicineData };
    session.medicines.push(medicine);
    res.json({ success: true, medicine: medicine });
  } else {
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

// Appointments
app.get('/api/appointments', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.appointments : []);
});

app.post('/api/appointments', (req, res) => {
  const session = getSession(req);
  if (session) {
    const appointmentData = { ...req.body };
    delete appointmentData.refCode;
    const appointment = { id: Date.now(), ...appointmentData };
    session.appointments.push(appointment);
    res.json({ success: true, appointment: appointment });
  } else {
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

// Watch Charging
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

// SOS Alert
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

// Mock Face API
app.post('/api/face/detect', async (req, res) => {
  try {
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

app.post('/api/face/identify', async (req, res) => {
  try {
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

// OpenAI Text to Speech
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

// OpenStreetMap Location
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

// OpenAI Story Generation
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

// Lost Alert
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

app.get('/api/lost', (req, res) => {
  const session = getSession(req);
  res.json(session ? session.lostAlerts : []);
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

app.get('/api/security-alerts', (req, res) => {
  const session = getSession(req);
  res.json(session ? (session.securityAlerts || []) : []);
});

// Live Location
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

// Voice Recording
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

// Missed Medicine Alert
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

// Static Routes
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

// Start Server
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Listen error:', err);
    return;
  }
  console.log(`✅ Memory Care App running on port ${port}`);
  console.log('Server started successfully');
});
