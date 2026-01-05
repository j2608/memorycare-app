# 🔧 TROUBLESHOOTING GUIDE - MemoryCare App

## Issue: "Code is not coming and daily routine is not opening"

### Quick Fix Steps:

## 1. **First, Test the Server**

Open your browser and go to: **http://localhost:8080/test-login.html**

This will help you test if the server is working properly.

### Test Steps:
1. Click **"Create Session"** button
2. You should see a 6-character code (e.g., "A3F9K2")
3. If you see the code → Server is working! ✅
4. If you get an error → Server issue (see below)

---

## 2. **Clear Your Browser Storage**

### Option A: Use the test page
1. Go to http://localhost:8080/test-login.html
2. Click **"Clear Storage & Reload"**

### Option B: Manual clear
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page (F5)

---

## 3. **Check the Browser Console for Errors**

1. Open caregiver.html
2. Press **F12** to open Developer Tools  
3. Click **Console** tab
4. Look for errors (red text)

### What you should see (normal):
```
=== Caregiver Dashboard Initializing ===
Current Reference Code: null
No reference code found. Showing setup modal...
✅ Modal found, displaying...
Modal elements: {createBtn: true, loginBtn: true, refCodeInput: true}
Setup modal ready
```

### If you see errors:
- Take a screenshot
- Check if the error mentions "fetch" → Server not running
- Check if error mentions "not found" → Missing HTML element

---

## 4. **Start Fresh**

### Step-by-step Clean Start:

1. **Stop the server** (Ctrl+C in terminal)

2. **Clear browser data**:
   - Press F12
   - Console tab
   - Type: `localStorage.clear()`
   - Close browser completely

3. **Restart server**:
   ```bash
   cd c:\Users\jpsan\OneDrive\Desktop\hackathon1
   node app-server.js
   ```
   
4. **Wait for**:
   ```
   Memory Care App running at http://localhost:8080
   ```

5. **Open browser** (new window):
   - Go to: http://localhost:8080/test-login.html
   - Click "Create Session"
   - Note the code

6. **Open caregiver dashboard**:
   - Go to: http://localhost:8080/caregiver.html
   - Should show login modal
   - Click "Create New Patient Session" OR enter the code from step 5

---

## 5. **Common Problems & Solutions**

### Problem: Modal shows but buttons don't work
**Solution:**
1. Press F12 → Console
2. Check for JavaScript errors
3. Try clicking slowly (wait 2 seconds between clicks)
4. Refresh page and try again

### Problem: Code created but page doesn't reload
**Solution:**
1. Manually refresh the page (F5)
2. Check if code is in header (green box)
3. Try clicking on tabs

### Problem: Tabs don't open
**Solution:**
1. Make sure you see the green code in header
2. Press F12 → Console
3. Look for "Dashboard Ready" message
4. If not there, refresh page

### Problem: "Failed to fetch" error
**Solution:**
- Server not running!
- Start server: `node app-server.js`
- Check it says "Server started successfully"

### Problem: Everything works but no data shows
**Solution:**
- You need to ADD data first!
- Go to "Patient Profile" tab
- Fill in the form
- Click "Save Profile"
- Then add routines, medicines, etc.

---

## 6. **Testing Reference Code System**

### Test with Two Browsers:

**Browser 1 (Caregiver)**:
1. Open http://localhost:8080/test-login.html
2. Create session
3. Copy the code (e.g., "A3F9K2")

**Browser 2 (Patient)**:
1. Open http://localhost:8080/patient.html
2. Enter the code from Browser 1
3. Click Login

**Expected**: Patient should login successfully

---

## 7. **Verify Server is Working**

### Quick API Test:

1. Open http://localhost:8080/test-login.html
2. Click "Create Session"
3. Should see: `✅ Success! Reference Code: XXXXXX`

If you see this, server is 100% working!

---

## 8. **Debug Mode - See What's Happening**

1. Open caregiver.html
2. Press F12
3. Go to Console tab
4. Refresh page
5. You'll see detailed logs showing:
   - If modal was found
   - If buttons are working
   - When code is created
   - When page reloads

---

## 9. **Manual Override (Emergency)**

If nothing works, force a code:

1. Press F12 → Console
2. Type:
   ```javascript
   localStorage.setItem('currentRefCode', 'TEST123')
   location.reload()
   ```
3. This bypasses login and uses a test code

---

## 10. **Still Not Working?**

### Check These:

✅ Is server running? Look for "Memory Care App running" message
✅ Is port 8080 available? Try different port in app-server.js
✅ Are you on http://localhost:8080? Not http://127.0.0.1?
✅ Did you refresh the page after creating code?
✅ Is JavaScript enabled in browser?
✅ Are you using Chrome, Edge, or Firefox? (Safari may have issues)

### Get Detailed Info:

1. Open test page: http://localhost:8080/test-login.html
2. Open Console (F12)
3. Click "Create Session"
4. Screenshot the console output
5. Screenshot the result on page

---

## Expected Behavior:

### First Visit (No Code):
1. See login modal
2. Click "Create New Patient Session"
3. See green success message with code
4. Wait 3 seconds
5. Page reloads
6. See green code in header
7. Can click tabs

### Subsequent Visits (Has Code):
1. Page loads
2. See green code in header immediately
3. Can click tabs
4. No modal shows

---

## Need More Help?

1. Check console for "=== Dashboard Ready ===" message
2. If you don't see it, something failed during initialization
3. Look for error messages in RED in console
4. Most issues are solved by:
   - Clearing localStorage
   - Restarting server
   - Using fresh browser window

---

## Quick Command Reference:

```bash
# Start server
node app-server.js

# In browser console:
localStorage.clear()          # Clear storage
location.reload()            # Refresh page
localStorage.getItem('currentRefCode')  # Check current code
```

Good luck! 🎉
