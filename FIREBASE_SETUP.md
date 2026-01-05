# Firebase Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: **memorycare-app** (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Realtime Database
1. In your Firebase project, click "Realtime Database" in left menu
2. Click "Create Database"
3. Choose location: **United States** (or closest to you)
4. Start in **Test mode** (we'll secure it later)
5. Click "Enable"

### Step 3: Get Service Account Key
1. Click the ⚙️ gear icon → "Project settings"
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" - a JSON file will download
5. **IMPORTANT:** Save this file as `firebase-config.json` in your project folder

### Step 4: Update .env File
1. In Firebase console, copy your database URL (looks like: `https://YOUR-PROJECT.firebaseio.com`)
2. Open `.env` file (create if doesn't exist)
3. Add this line:
   ```
   FIREBASE_DATABASE_URL=https://YOUR-PROJECT.firebaseio.com
   ```

### Step 5: Restart Server
```bash
node app-server.js
```

## Security Rules (After Testing)

Once everything works, update database rules:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## That's it! 🎉

Your data will now persist even after server restarts!
