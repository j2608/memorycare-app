# 🚀 MEMORYCARE - COMPLETE USAGE GUIDE

---

## ✅ INSTALLATION COMPLETE!

Your MemoryCare application is now ready to use.

---

## 🌐 **How to Access**

### **Option 1: Using the Scripts (Easiest)**

**Windows:**
```bash
Double-click: start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

### **Option 2: Manual Start**

```bash
npm start
```

Then open: **http://localhost:3000**

---

## 📱 **Application URLs**

After starting the server:

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | http://localhost:3000 | Landing page - choose role |
| **Patient View** | http://localhost:3000/patient | Large-button interface for patient |
| **Caregiver Dashboard** | http://localhost:3000/caregiver | Management & monitoring dashboard |

---

## 👨‍⚕️ **CAREGIVER GUIDE**

### **First-Time Setup**

1. **Open Caregiver Dashboard**
   - Navigate to: http://localhost:3000/caregiver

2. **Set Up Patient Profile**
   - Click "👤 Patient Profile" tab
   - Fill in:
     - Patient name
     - Age
     - Condition details
     - Emergency contact info
     - Home address
   - Click "💾 Save Profile"

3. **Add Daily Routine**
   - Click "📅 Daily Routine" tab
   - Add time-based activities:
     - 08:00 - Breakfast
     - 12:00 - Lunch
     - 15:00 - Afternoon walk
     - 18:00 - Dinner
     - 21:00 - Bedtime
   - Patient can view and hear these

4. **Add Known People**
   - Click "👥 Known People" tab
   - Add family members and friends:
     - Name
     - Relation (Daughter, Son, Friend, etc.)
     - Description
   - Used for face recognition feature

5. **Add Important Places**
   - Click "📍 Known Places" tab
   - Add familiar locations:
     - Home
     - Park
     - Hospital
     - Favorite restaurant
   - Helps patient remember locations

6. **Schedule Medicines**
   - Click "💊 Medicines" tab
   - Add each medicine:
     - Medicine name
     - Time (24-hour format)
     - Dosage
     - Special instructions
   - Patient gets loud reminders at these times

7. **Add Doctor Appointments**
   - Click "🏥 Appointments" tab
   - Enter:
     - Doctor name
     - Date and time
     - Hospital/clinic location
     - Purpose of visit
   - Patient gets reminders 1 hour and 10 minutes before

8. **Set Watch Charging Time**
   - Click "⚙️ Settings" tab
   - Set daily charging reminder time
   - Patient gets loud voice reminder

---

### **Monitoring & Alerts**

The dashboard shows real-time alerts:

- **🆘 SOS Alerts** - Emergency button pressed
- **🗺️ Lost Alerts** - Patient activated "Help Me"
- **💊 Missed Medicines** - Medicine not taken on time

View alert history in Settings → Recent Alerts

---

## 👤 **PATIENT GUIDE**

### **Getting Started**

1. **Open Patient Interface**
   - Navigate to: http://localhost:3000/patient
   - Large buttons and simple design

2. **Grant Permissions**
   - Allow camera access (for face recognition)
   - Allow location access (for emergency features)
   - Allow notifications (for reminders)

---

### **Features & How to Use**

#### **1. 🆘 EMERGENCY SOS**
- Always visible in top-right corner
- **Press once** for emergency
- Automatically:
  - Captures your location
  - Alerts caregiver
  - Speaks confirmation

#### **2. 🗺️ HELP ME (Lost Guidance)**
- If you feel lost or confused
- **Press "HELP ME" button**
- Get loud voice guidance in Telugu + English
- Caregiver notified immediately
- Stay where you are, help is coming

#### **3. 📸 WHO IS THIS? (Face Recognition)**
- Point camera at person's face
- **Press "WHO IS THIS?" button**
- **Press "CAPTURE"** when face is centered
- App tells you:
  - Person's name
  - Their relation to you
- Unknown faces → caregiver alerted

#### **4. 📅 MY ROUTINE**
- View your daily schedule
- See what you should do and when
- **Press "🔊 READ TO ME"** to hear it aloud

#### **5. 💊 MY MEDICINES**
- See all your medicines
- Times and dosages
- **Automatic loud reminders** at medicine time
- **Press "✓ I TOOK IT"** after taking medicine

#### **6. 👥 PEOPLE I KNOW**
- Browse important people
- Names and relations
- **Press "🔊 READ TO ME"** to hear about them

#### **7. 🏠 IMPORTANT PLACES**
- View familiar locations
- Addresses and descriptions
- **Press "🔊 READ TO ME"** to hear about them

#### **8. Language Toggle**
- **Press "తెలుగు"** button to switch language
- Works for voice announcements

---

### **Automatic Reminders**

The app will automatically remind you:

- **💊 Medicine Time** - Loud alarm + voice reminder
- **⌚ Watch Charging** - Daily reminder at set time
- **🏥 Doctor Appointment** - 1 hour and 10 minutes before

---

## 🔊 **Voice Features**

All voice announcements use:
- **Clear, slow speech**
- **Loud volume**
- **Simple language**
- **Bilingual support** (English + Telugu)

---

## 🎯 **Best Practices**

### For Caregivers:
✅ Set up profile completely before giving to patient  
✅ Add at least 3-5 known people  
✅ Schedule all daily medicines  
✅ Update routine based on patient's actual schedule  
✅ Check alerts 2-3 times daily  
✅ Test all features with patient first time  

### For Patients:
✅ Keep device charged  
✅ Press SOS if you feel unsafe  
✅ Use "Help Me" if lost or confused  
✅ Take medicines when reminded  
✅ Don't worry - caregiver is always watching  

---

## 🛠️ **Troubleshooting**

### **Server won't start**
```bash
# Try different port
set PORT=3001
npm start
```

### **Voice not working**
- Check browser sound settings
- Ensure volume is up
- Try Chrome/Edge browser (best compatibility)

### **Camera not working**
- Grant camera permissions
- Only works on HTTPS or localhost
- Check if other app is using camera

### **Reminders not showing**
- Keep browser tab open
- Allow notifications
- Check system time is correct

### **Data disappeared**
- Data is in-memory (resets on server restart)
- For production, integrate database

---

## 📊 **Demo Scenario**

### **Perfect Demo Flow (5 minutes)**

**1. Introduction (30 sec)**
- Show landing page
- Explain two interfaces

**2. Caregiver Setup (2 min)**
- Add patient profile
- Add 2 medicines
- Add 1 known person
- Show how alerts work

**3. Patient Experience (2 min)**
- Show large buttons
- Activate SOS (demo)
- Use face recognition
- Show medicine reminder popup
- Demonstrate voice reading

**4. Closing (30 sec)**
- Show real-time alerts on caregiver side
- Emphasize safety + independence

---

## 🔐 **Security Notes**

Current version:
- No authentication (add for production)
- Data in-memory (use database for real deployment)
- No encryption (add HTTPS for production)

For production deployment:
- Add user login
- Encrypt sensitive data
- Use MongoDB/PostgreSQL
- Implement role-based access
- Add session management

---

## 🎓 **Technical Stack**

- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **Backend**: Node.js + Express
- **Storage**: In-memory JSON
- **APIs**: 
  - Speech Synthesis (voice)
  - Geolocation (location)
  - MediaDevices (camera)

**Why this stack?**
✅ No complex build process  
✅ Works on any browser  
✅ Fast to deploy  
✅ Easy to understand  
✅ Replit-compatible  

---

## 🚀 **Next Steps**

1. **Test all features** with family member
2. **Customize** to your needs
3. **Deploy** to Replit/Heroku
4. **Present** at hackathon
5. **Get feedback** from users
6. **Iterate** and improve

---

## 💙 **Final Words**

This application is designed with **compassion, dignity, and safety** at its core.

Every feature serves a real need for Alzheimer's patients and their caregivers.

**You're making a difference!** 🌟

---

**Questions? Issues?**
- Check README.md for detailed info
- Review API.md for technical details
- Test in Chrome/Edge for best experience

**Good luck with your hackathon!** 🏆
