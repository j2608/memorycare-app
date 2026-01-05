# Backend Deployment Guide - Render.com

## Quick Deploy to Render (Free Tier)

### Step 1: Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/memorycare-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [https://render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: memorycare-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node app-server.js`
   - **Plan**: Free
6. Click "Create Web Service"

### Step 3: Get Your Backend URL

After deployment completes, you'll get a URL like:
```
https://memorycare-backend.onrender.com
```

### Step 4: Update Frontend API Calls

Update the API base URL in your frontend files to point to your Render backend.

---

## Alternative: Deploy Backend to Railway

1. Go to [https://railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Get your URL from the deployment

---

## After Backend Deployment

Once your backend is deployed, update the frontend files to use the new backend URL and redeploy to Firebase:

```bash
firebase deploy --only hosting
```

Your app will then be fully functional with:
- Frontend: Firebase Hosting
- Backend: Render/Railway
