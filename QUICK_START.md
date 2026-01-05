# Quick Start Guide - MemoryCare App

## 🚀 Getting Started

### Step 1: Start the Server
```bash
cd c:\Users\jpsan\OneDrive\Desktop\hackathon1
node app-server.js
```

You should see:
```
Memory Care App running at http://localhost:8080
Server started successfully
```

### Step 2: Setup Caregiver Account

1. Open your browser and go to: **http://localhost:8080/caregiver.html**

2. You'll see a login modal with two options:
   - **Create New Patient Session** (for new patients)
   - **Enter Reference Code** (for existing patients)

3. Click **"Create New Patient Session"**

4. You'll get a **6-character reference code** (e.g., "A3F9K2")
   - **IMPORTANT**: Write this code down!
   - Share it with the patient
   - You'll see it displayed in the green header

### Step 3: Add Patient Information

1. Fill in the **Patient Profile** tab:
   - Name
   - Age
   - Condition details
   - Emergency contacts

2. Add **Daily Routine**:
   - Time (e.g., 08:00)
   - Activity (e.g., "Take morning medicine")

3. Add **Known People**:
   - Name
   - Relation
   - Upload photo (optional)
   - Description

4. Add **Known Places**:
   - Click on the map to select location
   - Add name and description

5. Add **Medicines**:
   - Name
   - Time
   - Dosage
   - Instructions

6. **Set Home Location** (Settings tab):
   - Click on the map to select home
   - Save the location

### Step 4: Patient Login

1. Open a **new browser tab/window** (or use a different device)

2. Go to: **http://localhost:8080/patient.html**

3. Enter the **6-character reference code** you got in Step 2

4. Click **"Login"**

5. You'll now see:
   - Personalized welcome message
   - All the information added by caregiver
   - Large, easy-to-read buttons

### Step 5: Test Features

#### Patient Side:
- **Click any button** - hear voice announcements
- **Press SOS button** - sends emergency alert to caregiver
- **Click "HELP ME"** - activates lost mode with map
- **View routine** - see daily schedule
- **View medicines** - see medicine reminders
- **Change language** - select from 10 languages

#### Caregiver Side:
- **Monitor alerts** - check for SOS/lost alerts
- **Add/edit data** - update patient information
- **Listen for voice notifications** - critical alerts announced automatically

## 🎯 Testing Voice Features

### Patient Voice Tests:
1. Click "WHO IS THIS?" button → Hear: "Opening face recognition"
2. Click "MY ROUTINE" → Hear: "Showing your daily routine"
3. Click "MY MEDICINES" → Hear: "Showing your medicines"
4. Press SOS button → Hear: "Emergency alert sent"

### Caregiver Voice Tests:
1. Click any tab → Hear: "Opening [tab name]"
2. Save profile → Hear: "Profile saved successfully"
3. Add medicine → Hear: "Medicine added successfully"
4. When patient presses SOS → Hear: "EMERGENCY! SOS alert received from patient"

## 📱 Testing Multi-Device Scenario

**Best Way to Test:**

1. **Computer as Caregiver**:
   - Open http://localhost:8080/caregiver.html
   - Create session, get code

2. **Phone/Tablet as Patient**:
   - Find your computer's IP address (e.g., 192.168.1.5)
   - On phone, go to: http://192.168.1.5:8080/patient.html
   - Enter the reference code

3. **Test Real-Time Alerts**:
   - On phone: Press SOS button
   - On computer: Watch for alert + hear voice notification

## 🔍 Troubleshooting

### Can't hear voice?
- Check browser allows audio autoplay
- Click on the page first to activate audio
- Check system volume

### Map not showing?
- Make sure you're connected to internet
- Click the tab again to refresh
- Allow location access in browser

### Reference code not working?
- Make sure it's exactly 6 characters
- Try typing in UPPERCASE
- Refresh the caregiver page and create new session

### Patient can't see caregiver's data?
- Make sure both are using the SAME reference code
- Refresh patient page after caregiver adds data
- Check browser console for errors (F12)

## 💡 Pro Tips

1. **Save the reference code**: You can logout and login again with same code
2. **Voice works best**: Use Chrome or Edge for best voice synthesis
3. **Keep updating**: Add data in caregiver view, patient sees it immediately (after refresh)
4. **Test SOS**: Try emergency button to see alert system in action
5. **Use different browsers**: Caregiver in Chrome, Patient in Edge for testing

## 📊 What You Should See

### Caregiver Dashboard Header:
```
← Home | Caregiver Dashboard | Code: A3F9K2 | [Current Time]
```

### Patient View Header:
```
Hello, [Patient Name]! | [Language Selector]
```

### Working Features Checklist:
- ✅ Reference code login (both sides)
- ✅ Voice announcements
- ✅ Maps show properly
- ✅ SOS alerts work
- ✅ Data syncs between views
- ✅ All tabs accessible
- ✅ Forms save successfully

---

## 🎉 You're All Set!

The app is fully functional with:
- Reference code system ✅
- Voice announcements ✅
- Working maps ✅
- Real-time alerts ✅
- Clean data management ✅

Enjoy using MemoryCare! 💙
