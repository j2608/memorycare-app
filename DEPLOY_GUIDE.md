# Deploy Backend & Frontend - Complete Guide

## ✅ What We've Done So Far

1. **Frontend deployed to Firebase Hosting**
   - Live at: https://vnc-kavach-dashboard.web.app
   - All static files (HTML, CSS, JS) are hosted
   - ❌ Backend API not working yet

2. **Backend files ready for deployment**
   - `render.yaml` configured
   - `app-server.js` ready
   - Git repository initialized

## 🚀 Complete Deployment Steps

### Step 1: Deploy Backend to Render.com

1. **Create GitHub Repository**
   ```bash
   # On GitHub.com, create a new repository (e.g., "memorycare-app")
   
   # Then push your code:
   git remote add origin https://github.com/YOUR_USERNAME/memorycare-app.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to https://render.com
   - Click "Sign Up" and choose "GitHub"
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     * **Name**: memorycare-backend
     * **Environment**: Node
     * **Build Command**: `npm install`
     * **Start Command**: `node app-server.js`
     * **Plan**: Free
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment

3. **Get Your Backend URL**
   - Copy the URL (e.g., `https://memorycare-backend.onrender.com`)

### Step 2: Update Frontend to Use Backend

```bash
# Run the update script with your Render URL
node update-api-urls.js https://memorycare-backend.onrender.com
```

This will automatically update all API endpoints in:
- config.js
- patient.js  
- caregiver.js

### Step 3: Redeploy Frontend to Firebase

```bash
firebase deploy --only hosting
```

### Step 4: Test Your Live App

Visit: https://vnc-kavach-dashboard.web.app

Everything should now work!

## 🔧 Manual Update (Alternative)

If the script doesn't work, manually update these files:

**config.js:**
```javascript
const API_CONFIG = {
    BASE_URL: 'https://memorycare-backend.onrender.com'
};
```

**patient.js** - Find and replace:
- `fetch('/api/` → `fetch('https://memorycare-backend.onrender.com/api/`
- `fetch(\`/api/` → ``fetch(`https://memorycare-backend.onrender.com/api/``

**caregiver.js** - Same replacements as patient.js

## 📱 Alternative Backend Hosting Options

### Railway.app
1. Go to https://railway.app
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Auto-deploys!

### Heroku (Paid only now)
```bash
heroku create memorycare-backend
git push heroku main
```

### Google Cloud Run
```bash
gcloud run deploy memorycare-backend --source .
```

## ⚠️ Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Spins down after 15 mins of inactivity
- First request takes 30-60 seconds (cold start)
- Good for demos/testing

**Railway Free Tier:**
- $5/month free credit
- No sleep time
- Better for active use

### CORS Configuration

If you get CORS errors, ensure `app-server.js` has:
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
```

## 🎯 Quick Commands Reference

```bash
# Deploy backend changes (after pushing to GitHub, Render auto-deploys)
git add .
git commit -m "Update backend"
git push

# Update API endpoints
node update-api-urls.js https://your-backend-url.onrender.com

# Deploy frontend
firebase deploy --only hosting

# View logs (Render dashboard)
# Visit: https://dashboard.render.com

# Test locally
npm start  # Backend on localhost:8080
firebase serve  # Frontend on localhost:5000
```

## ✨ Final Architecture

```
Frontend (Firebase Hosting)
https://vnc-kavach-dashboard.web.app
         ↓
    API Calls
         ↓
Backend (Render.com)
https://memorycare-backend.onrender.com
```

Both are live and working together!
