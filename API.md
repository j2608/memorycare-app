# MemoryCare API Documentation

## Base URL
```
http://localhost:3000
```

---

## Endpoints

### General Data

#### Get All Application Data
```http
GET /api/data
```

**Response:**
```json
{
  "patientProfile": { ... },
  "dailyRoutine": [ ... ],
  "knownPeople": [ ... ],
  "knownPlaces": [ ... ],
  "medicines": [ ... ],
  "appointments": [ ... ],
  "watchChargingTime": "22:00",
  "sosAlerts": [ ... ],
  "lostAlerts": [ ... ],
  "missedMedicines": [ ... ]
}
```

---

### Patient Profile

#### Update Patient Profile
```http
POST /api/patient-profile
Content-Type: application/json

{
  "name": "John Doe",
  "age": "75",
  "condition": "Early stage Alzheimer's",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "+91 1234567890",
  "address": "123 Main Street, City"
}
```

---

### Daily Routine

#### Get Routine
```http
GET /api/routine
```

#### Add Routine Item
```http
POST /api/routine
Content-Type: application/json

{
  "time": "08:00",
  "activity": "Breakfast"
}
```

#### Delete Routine Item
```http
DELETE /api/routine/:id
```

---

### Known People

#### Get People
```http
GET /api/people
```

#### Add Person
```http
POST /api/people
Content-Type: application/json

{
  "name": "Sarah",
  "relation": "Daughter",
  "photo": "https://example.com/photo.jpg",
  "description": "Lives nearby, visits on weekends"
}
```

#### Delete Person
```http
DELETE /api/people/:id
```

---

### Known Places

#### Get Places
```http
GET /api/places
```

#### Add Place
```http
POST /api/places
Content-Type: application/json

{
  "name": "Home",
  "address": "123 Main Street",
  "description": "Primary residence"
}
```

#### Delete Place
```http
DELETE /api/places/:id
```

---

### Medicines

#### Get Medicines
```http
GET /api/medicines
```

#### Add Medicine
```http
POST /api/medicines
Content-Type: application/json

{
  "name": "Aspirin",
  "time": "09:00",
  "dosage": "1 tablet",
  "instructions": "Take after breakfast"
}
```

#### Mark Medicine as Taken
```http
POST /api/medicines/:id/taken
```

#### Delete Medicine
```http
DELETE /api/medicines/:id
```

---

### Appointments

#### Get Appointments
```http
GET /api/appointments
```

#### Add Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "doctor": "Dr. Smith",
  "date": "2025-01-15",
  "time": "10:00",
  "location": "City Hospital",
  "purpose": "Regular checkup"
}
```

#### Delete Appointment
```http
DELETE /api/appointments/:id
```

---

### Watch Charging

#### Get Charging Time
```http
GET /api/watch-charging
```

#### Set Charging Time
```http
POST /api/watch-charging
Content-Type: application/json

{
  "time": "22:00"
}
```

---

### Alerts

#### Send SOS Alert
```http
POST /api/sos
Content-Type: application/json

{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Get SOS Alerts
```http
GET /api/sos
```

#### Send Lost Alert
```http
POST /api/lost
Content-Type: application/json

{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Get Lost Alerts
```http
GET /api/lost
```

#### Report Missed Medicine
```http
POST /api/missed-medicine
Content-Type: application/json

{
  "medicineName": "Aspirin"
}
```

---

## Data Models

### Patient Profile
```typescript
{
  name: string
  age: string
  condition: string
  emergencyContact: string
  emergencyPhone: string
  address: string
}
```

### Routine Item
```typescript
{
  id: number
  time: string  // HH:mm format
  activity: string
}
```

### Person
```typescript
{
  id: number
  name: string
  relation: string
  photo?: string
  description?: string
}
```

### Place
```typescript
{
  id: number
  name: string
  address: string
  description?: string
}
```

### Medicine
```typescript
{
  id: number
  name: string
  time: string  // HH:mm format
  dosage: string
  instructions?: string
  taken: boolean
  takenAt?: string  // ISO timestamp
}
```

### Appointment
```typescript
{
  id: number
  doctor: string
  date: string  // YYYY-MM-DD format
  time: string  // HH:mm format
  location: string
  purpose?: string
}
```

### Alert
```typescript
{
  id: number
  timestamp: string  // ISO timestamp
  location: {
    latitude: number
    longitude: number
  } | string
  type: 'sos' | 'lost'
}
```

---

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Example error response:
```json
{
  "error": "Error message description"
}
```

---

## Notes

- All timestamps use ISO 8601 format
- Times use 24-hour format (HH:mm)
- IDs are auto-generated using `Date.now()`
- Data is stored in-memory (resets on server restart)
- CORS is enabled for all origins
