# Firebase Hosting Deployment Guide

## Prerequisites ✅
- Firebase CLI installed globally ✓
- firebase.json configuration created ✓
- .firebaserc created ✓

## Steps to Deploy

### 1. Login to Firebase
```bash
firebase login
```
This will open your browser to authenticate with Google.

### 2. Create or Select Firebase Project

**Option A: Create New Project**
```bash
firebase projects:create
```
Follow the prompts to create a new project.

**Option B: Use Existing Project**
```bash
firebase use --add
```
Select your existing Firebase project from the list.

### 3. Update .firebaserc
After selecting/creating your project, update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 4. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 5. Access Your Live Site
After deployment completes, you'll see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

## Important Notes

### ⚠️ Backend Server Limitation
Firebase Hosting only serves static files (HTML, CSS, JS). Your Node.js backend (`app-server.js`) cannot run on Firebase Hosting.

### Options for Backend:

**Option 1: Firebase Functions (Recommended)**
Convert `app-server.js` to Firebase Cloud Functions:
```bash
firebase init functions
```
Then migrate your Express routes to Cloud Functions.

**Option 2: Keep Backend Separate**
- Deploy frontend to Firebase Hosting
- Deploy backend to:
  - Heroku
  - Railway
  - Render
  - Google Cloud Run
  - Azure App Service

**Option 3: Convert to Client-Side Only**
Use Firebase services:
- Firestore for database
- Firebase Auth for authentication
- Firebase Storage for file uploads

### Current Setup
The current deployment will host:
- ✅ landing.html (entry point)
- ✅ role-selection.html
- ✅ patient.html
- ✅ caregiver.html
- ✅ styles.css
- ✅ patient.js
- ✅ caregiver.js
- ✅ All static assets

❌ Backend API endpoints will NOT work (they need a server)

## Quick Deploy Commands

```bash
# Login (one time)
firebase login

# Deploy
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# View deployment logs
firebase hosting:channel:list

# Open hosting URL
firebase open hosting:site
```

## Testing Locally

```bash
# Serve locally before deploying
firebase serve

# Or with specific port
firebase serve --port 8080
```

## Troubleshooting

### Authentication Issues
```bash
firebase logout
firebase login
```

### Wrong Project
```bash
firebase use --add
```

### See Current Project
```bash
firebase projects:list
firebase use
```

## Next Steps

1. Run `firebase login`
2. Run `firebase use --add` to select/create project
3. Update `.firebaserc` with your project ID
4. Run `firebase deploy`
5. Visit your live site!

For backend functionality, consider migrating to Firebase Functions or deploying backend separately.
