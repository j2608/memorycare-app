# 🏃 How to Use Google Fit Integration

## 📍 Where to Find the Google Fit Toggle

### Step 1: Login as Caregiver
1. Open the app
2. Select "Caregiver" role
3. Enter your reference code OR create a new session

### Step 2: Navigate to Settings
1. Look at the bottom navigation tabs
2. Click on **⚙️ Settings** tab (last tab on the right)
3. Scroll down to find the section titled **"🏃 Google Fit Integration"**

### Step 3: Enable Google Fit
```
┌─────────────────────────────────────┐
│  ⚙️ Settings Tab                    │
├─────────────────────────────────────┤
│                                     │
│  [Other Settings Above...]          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏃 Google Fit Integration   │   │
│  ├─────────────────────────────┤   │
│  │                             │   │
│  │  [ ] Enable Google Fit  ◄── │   │
│  │      Click this checkbox!   │   │
│  │                             │   │
│  │  📊 Health Data (appears    │   │
│  │      when enabled)          │   │
│  │                             │   │
│  │  ┌──────────┬──────────┐   │   │
│  │  │ 👣 Steps │ ❤️ Heart │   │   │
│  │  │  12,547  │  72 bpm  │   │   │
│  │  ├──────────┼──────────┤   │   │
│  │  │ 🔥 Cal   │ 😴 Sleep │   │   │
│  │  │  1,842   │  7.2 hrs │   │   │
│  │  └──────────┴──────────┘   │   │
│  │                             │   │
│  │  Last sync: 10:45 AM        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent Alerts                      │
│  [...]                              │
└─────────────────────────────────────┘
```

## ✅ How to Verify It's Working

### 1. Check the Toggle is ON
- The checkbox should be **checked/ticked** ✓
- If it's OFF, click it once to turn it ON

### 2. Watch for Permission Request
When you first enable Google Fit:
- Your phone will ask for permission to access fitness data
- Click **"Allow"** or **"Grant Permission"**
- This only happens once

### 3. Check Health Data Appears
Once enabled, you should see:
- **👣 Steps**: Shows a number (e.g., 12,547)
- **❤️ Heart Rate**: Shows BPM (e.g., 72 bpm)
- **🔥 Calories**: Shows calories burned (e.g., 1,842)
- **😴 Sleep**: Shows hours of sleep (e.g., 7.2 hrs)

### 4. Check Last Sync Time
- Look for **"Last sync: [TIME]"** at the bottom
- The time should update every 5 minutes
- Example: "Last sync: 10:45 AM"

### 5. If You See "--" or "N/A"
This means:
- Google Fit hasn't synced data yet (wait a few seconds)
- Google Fit app doesn't have data (make sure Google Fit app is installed)
- Permissions were denied (disable and re-enable the toggle)

## 🔔 How to Verify Triggers Are Working

### Health Triggers Activate Automatically When:

1. **Low Step Count** (Trigger 13)
   - If steps < 5000 per day
   - You'll see an alert in "Recent Alerts" section
   - Notification: "Patient has low activity today"

2. **Abnormal Heart Rate** (Trigger 14)
   - If heart rate > 100 bpm or < 50 bpm
   - Alert appears with current heart rate
   - Notification: "Abnormal heart rate detected"

3. **Insufficient Sleep** (Trigger 15)
   - If sleep < 6 hours
   - Alert shows sleep duration
   - Notification: "Patient didn't get enough sleep"

4. **Low Calorie Burn** (Trigger 16)
   - If calories burned < daily goal
   - Alert with calorie count
   - Notification: "Low physical activity"

### Where to See Trigger Alerts

**On Caregiver Dashboard:**
```
┌─────────────────────────────────────┐
│  🔔 Active Alerts Section           │
│  (appears at top of dashboard)      │
├─────────────────────────────────────┤
│                                     │
│  ⚠️ LOW ACTIVITY ALERT              │
│  Patient has walked only 3,245      │
│  steps today (Goal: 5,000)          │
│  Time: 2:30 PM                      │
│  ─────────────────────────────      │
│                                     │
│  ❤️ HEART RATE ALERT                │
│  Abnormal heart rate: 105 bpm       │
│  Time: 1:15 PM                      │
│  ─────────────────────────────      │
│                                     │
└─────────────────────────────────────┘
```

**Voice Notifications to Patient:**
- Patient will hear spoken alerts
- Example: "Your activity is low today. Try to walk more."
- Example: "Your heart rate is elevated. Please rest."

## 🎯 Testing the System

### Quick Test (5 minutes):

1. **Enable the Toggle**
   - Go to Settings → Google Fit Integration
   - Turn ON the toggle
   - Grant permissions when asked

2. **Wait for Initial Sync**
   - Watch the health data cards
   - Numbers should appear in 10-30 seconds
   - Last sync time will update

3. **Refresh the Data**
   - Wait 5 minutes OR
   - Disable and re-enable the toggle
   - Data will refresh immediately

4. **Check for Alerts**
   - Scroll to top of dashboard
   - Look for "Active Alerts" section
   - If health data is concerning, alerts will appear

### What Success Looks Like:

✅ **Toggle is ON** (checkbox is checked)  
✅ **Health data shows numbers** (not "--")  
✅ **Last sync time is recent** (within 5 minutes)  
✅ **Alerts appear** (if health metrics are abnormal)  
✅ **Data updates automatically** (every 5 minutes)  

### If Something's Not Working:

#### No Health Data Showing?
1. Make sure Google Fit app is installed on phone
2. Open Google Fit app and check if it has data
3. Grant all permissions when prompted
4. Try disabling and re-enabling the toggle

#### Triggers Not Alerting?
1. Check if health data is actually abnormal
   - Steps should be < 5000 for low activity alert
   - Heart rate should be outside 50-100 range
2. Alerts refresh every 30 seconds
3. Check "Recent Alerts" at bottom of Settings tab

#### Toggle Won't Turn ON?
1. Check internet connection
2. Restart the app
3. Check browser console for errors (if using web version)

## 🔍 Advanced Verification

### Using Browser Console (For Web Testing):

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for these messages:

```
✅ Google Fit integration enabled
🏃 Initializing Google Fit data...
✅ Google Fit data updates started
✅ Health data display updated
🔍 Checking health triggers...
```

### Using APK (On Phone):

1. Install the APK on Android device
2. Make sure Google Fit app is installed
3. Open the Memory Care app
4. Login as caregiver
5. Go to Settings
6. Enable Google Fit toggle
7. Grant permissions
8. Watch health data appear

## 📊 Data Sync Schedule

- **Initial sync**: Immediately when you enable the toggle
- **Automatic updates**: Every 5 minutes
- **Manual refresh**: Disable and re-enable the toggle
- **Trigger checks**: Every 30 seconds

## 🎓 Summary

| Feature | How to Verify |
|---------|---------------|
| **Toggle Location** | Settings tab → Google Fit Integration section |
| **Toggle Status** | Checkbox should be checked ✓ |
| **Data Display** | Numbers appear in 4 health cards |
| **Last Sync** | Time shown at bottom, updates every 5 min |
| **Triggers Active** | Alerts appear in Active Alerts section |
| **Voice Alerts** | Patient hears spoken notifications |
| **Permissions** | Granted when first enabling toggle |

## 🚀 Quick Checklist

Before testing:
- [ ] APK installed on Android phone
- [ ] Google Fit app installed
- [ ] Logged in as caregiver
- [ ] Settings tab opened
- [ ] Google Fit section visible

To verify it works:
- [ ] Toggle is ON
- [ ] Health data shows numbers (not "--")
- [ ] Last sync time is recent
- [ ] Data updates every 5 minutes
- [ ] Alerts appear (if metrics abnormal)

---

**Everything is set up and ready! The Google Fit integration is fully functional with all triggers working.** 🎉
