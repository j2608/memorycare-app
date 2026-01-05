// This file contains all the Firebase-enabled endpoint handlers
// Copy these to replace the old endpoints in app-server.js

// ============================================
// HOME LOCATION
// ============================================
app.post('/api/home-location', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      await sessionsRef().child(refCode).child('homeLocation').set(req.body);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Home location error:', error);
    res.status(500).json({ error: 'Failed to update home location' });
  }
});

// ============================================
// EMERGENCY CONTACTS
// ============================================
app.get('/api/contacts', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    res.json(session ? session.emergencyContacts : []);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.json([]);
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      const contactData = { ...req.body };
      delete contactData.refCode;
      const contact = { id: Date.now(), ...contactData };
      
      if (!session.emergencyContacts) session.emergencyContacts = [];
      session.emergencyContacts.push(contact);
      
      await sessionsRef().child(refCode).child('emergencyContacts').set(session.emergencyContacts);
      console.log('Emergency contact added:', contact.name);
      res.json({ success: true, contact: contact });
    } else {
      console.error('Session not found for contacts');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      session.emergencyContacts = session.emergencyContacts.filter(c => c.id != req.params.id);
      await sessionsRef().child(refCode).child('emergencyContacts').set(session.emergencyContacts);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ============================================
// PEOPLE DELETE
// ============================================
app.delete('/api/people/:id', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      session.knownPeople = session.knownPeople.filter(p => p.id != req.params.id);
      await sessionsRef().child(refCode).child('knownPeople').set(session.knownPeople);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Delete person error:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// ============================================
// PLACES
// ============================================
app.get('/api/places', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    res.json(session ? session.knownPlaces : []);
  } catch (error) {
    console.error('Get places error:', error);
    res.json([]);
  }
});

app.post('/api/places', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      const placeData = { ...req.body };
      delete placeData.refCode;
      const place = { id: Date.now(), ...placeData };
      
      if (!session.knownPlaces) session.knownPlaces = [];
      session.knownPlaces.push(place);
      
      await sessionsRef().child(refCode).child('knownPlaces').set(session.knownPlaces);
      console.log('Place added:', place.name);
      res.json({ success: true, place: place });
    } else {
      console.error('Session not found for places');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Add place error:', error);
    res.status(500).json({ error: 'Failed to add place' });
  }
});

app.delete('/api/places/:id', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      session.knownPlaces = session.knownPlaces.filter(p => p.id != req.params.id);
      await sessionsRef().child(refCode).child('knownPlaces').set(session.knownPlaces);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Delete place error:', error);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

// ============================================
// MEDICINES
// ============================================
app.get('/api/medicines', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    res.json(session ? session.medicines : []);
  } catch (error) {
    console.error('Get medicines error:', error);
    res.json([]);
  }
});

app.post('/api/medicines', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      const medicineData = { ...req.body };
      delete medicineData.refCode;
      const medicine = { id: Date.now(), taken: false, ...medicineData };
      
      if (!session.medicines) session.medicines = [];
      session.medicines.push(medicine);
      
      await sessionsRef().child(refCode).child('medicines').set(session.medicines);
      console.log('Medicine added:', medicine.name);
      res.json({ success: true, medicine: medicine });
    } else {
      console.error('Session not found for medicines');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

app.post('/api/medicines/:id/taken', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      const medicine = session.medicines.find(m => m.id == req.params.id);
      if (medicine) {
        medicine.taken = true;
        medicine.takenAt = new Date().toISOString();
        await sessionsRef().child(refCode).child('medicines').set(session.medicines);
      }
      res.json({ success: true, data: medicine });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Medicine taken error:', error);
    res.status(500).json({ error: 'Failed to mark medicine taken' });
  }
});

app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      session.medicines = session.medicines.filter(m => m.id != req.params.id);
      await sessionsRef().child(refCode).child('medicines').set(session.medicines);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

// ============================================
// APPOINTMENTS
// ============================================
app.get('/api/appointments', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    res.json(session ? session.appointments : []);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.json([]);
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const refCode = req.body.refCode || req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      const appointmentData = { ...req.body };
      delete appointmentData.refCode;
      const appointment = { id: Date.now(), ...appointmentData };
      
      if (!session.appointments) session.appointments = [];
      session.appointments.push(appointment);
      
      await sessionsRef().child(refCode).child('appointments').set(session.appointments);
      console.log('Appointment added:', appointment.title);
      res.json({ success: true, appointment: appointment });
    } else {
      console.error('Session not found for appointments');
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Add appointment error:', error);
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const refCode = req.query.refCode || currentReferenceCode;
    const session = await getSessionData(refCode);
    if (session) {
      session.appointments = session.appointments.filter(a => a.id != req.params.id);
      await sessionsRef().child(refCode).child('appointments').set(session.appointments);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});
