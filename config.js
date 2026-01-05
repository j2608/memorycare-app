// Configuration for API endpoints
const API_CONFIG = {
    // Change this to your deployed backend URL
    BASE_URL: 'http://localhost:8080', // Default: localhost
    // BASE_URL: 'https://memorycare-backend.onrender.com', // Uncomment when deployed to Render
    // BASE_URL: 'https://your-app.railway.app', // Or your Railway URL
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
