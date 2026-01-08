#!/usr/bin/env node

/**
 * Update API endpoints to use deployed backend URL
 * Run with: node update-api-urls.js <your-backend-url>
 * Example: node update-api-urls.js https://memorycare-backend.onrender.com
 */

const fs = require('fs');
const path = require('path');

const backendUrl = process.argv[2] || 'http://localhost:8080';

console.log(`\n🔄 Updating API endpoints to: ${backendUrl}\n`);

// Files to update
const files = [
    { path: './config.js', isConfig: true },
    { path: './patient.js', isConfig: false },
    { path: './caregiver.js', isConfig: false }
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file.path, 'utf8');
        
        if (file.isConfig) {
            // Update config.js
            content = content.replace(
                /BASE_URL:\s*['"][^'"]*['"]/,
                `BASE_URL: '${backendUrl}'`
            );
        } else {
            // Replace all /api/ endpoints with full URL
            content = content.replace(
                /fetch\s*\(\s*['"`]\/api\//g,
                `fetch(\`${backendUrl}/api/`
            );
            content = content.replace(
                /fetch\s*\(\s*['"]\/api\//g,
                `fetch('${backendUrl}/api/`
            );
        }
        
        fs.writeFileSync(file.path, content);
        console.log(`✅ Updated: ${file.path}`);
    } catch (error) {
        console.error(`❌ Error updating ${file.path}:`, error.message);
    }
});

console.log(`\n✨ Done! API endpoints now point to: ${backendUrl}\n`);
console.log(`Next steps:`);
console.log(`1. Test locally: npm start`);
console.log(`2. Deploy to Firebase: firebase deploy --only hosting`);
console.log(`3. Visit: https://vnc-kavach-dashboard.web.app\n`);
