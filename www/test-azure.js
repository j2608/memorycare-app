// Alternative APIs Test Script
// Run with: node test-azure.js

require('dotenv').config();
const axios = require('axios');

async function testServices() {
    console.log('🧪 Testing Alternative Services Integration...\n');

    // Test 1: Speech Synthesis
    console.log('1️⃣ Testing OpenAI Speech Services...');
    try {
        const speechResponse = await axios.post('http://localhost:3001/api/speech/synthesize', {
            text: 'Hello, this is a test of OpenAI Speech Services.',
            language: 'en',
            voice: 'alloy'
        }, {
            responseType: 'arraybuffer'
        });

        if (speechResponse.status === 200) {
            console.log('✅ Speech synthesis working!');
        }
    } catch (error) {
        console.log('❌ Speech synthesis failed:', error.response?.data?.error || error.message);
        console.log('Full error:', error);
    }

    // Test 2: Maps (using sample coordinates)
    console.log('\n2️⃣ Testing OpenStreetMap...');
    try {
        const mapsResponse = await axios.get('http://localhost:3001/api/maps/location/17.3850/78.4867');
        if (mapsResponse.status === 200) {
            console.log('✅ OpenStreetMap working!');
            console.log('   Location:', mapsResponse.data.addresses?.[0]?.display_name || 'Address found');
        }
    } catch (error) {
        console.log('❌ OpenStreetMap failed:', error.response?.data?.error || error.message);
        console.log('Full error:', error);
    }

    // Test 3: OpenAI (if configured)
    console.log('\n3️⃣ Testing OpenAI...');
    try {
        const openaiResponse = await axios.post('http://localhost:3001/api/openai/generate-story', {
            prompt: 'family dinner memories',
            context: 'happy family moments'
        });

        if (openaiResponse.status === 200) {
            console.log('✅ OpenAI working!');
            console.log('   Generated story preview:', openaiResponse.data.story.substring(0, 100) + '...');
        }
    } catch (error) {
        console.log('❌ OpenAI failed:', error.response?.data?.error || error.message);
        console.log('Full error:', error);
        if (error.response?.status === 500 && error.response?.data?.error?.includes('not configured')) {
            console.log('   Note: OpenAI is optional and not configured');
        }
    }

    console.log('\n🎉 Services test completed!');
    console.log('\n📝 Note: Face detection requires actual image data and cannot be tested via this script.');
    console.log('   Test face recognition through the web interface.');
}

// Run tests
testServices().catch(console.error);