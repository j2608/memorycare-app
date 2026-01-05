# MemoryCare Azure Integration Setup Guide

## Overview
This guide shows how to integrate Microsoft Azure AI services into the MemoryCare Alzheimer's assistant app for enhanced functionality.

## Azure Services Integrated

### 1. Azure AI Face Service
- **Purpose**: Advanced face recognition and identification
- **Features**: Detect faces, match with known people, identify unknown individuals
- **Benefits**: More accurate than browser-based face detection

### 2. Azure Speech Services
- **Purpose**: High-quality text-to-speech and speech-to-text
- **Features**: Natural-sounding voices in multiple languages, better pronunciation
- **Benefits**: More soothing and clear voice output for patients

### 3. Azure Maps
- **Purpose**: Enhanced location services and reverse geocoding
- **Features**: Convert coordinates to readable addresses, better navigation
- **Benefits**: More detailed location information for caregivers

### 4. Azure OpenAI (Optional)
- **Purpose**: Generate personalized memory stories
- **Features**: AI-powered story creation based on patient memories
- **Benefits**: Dynamic content generation for memory stimulation

## Setup Instructions

### Step 1: Create Azure Resources

1. **Go to Azure Portal**: https://portal.azure.com

2. **Create Resource Group**:
   - Name: `memorycare-rg`
   - Region: Choose your preferred region

3. **Create Azure AI Face Service**:
   - Search for "Face" in marketplace
   - Name: `memorycare-face`
   - Pricing tier: Free F0 (for testing)
   - Copy the **Key** and **Endpoint** from the resource

4. **Create Azure Speech Service**:
   - Search for "Speech" in marketplace
   - Name: `memorycare-speech`
   - Pricing tier: Free F0 (for testing)
   - Copy the **Key** and **Region**

5. **Create Azure Maps Account**:
   - Search for "Maps" in marketplace
   - Name: `memorycare-maps`
   - Pricing tier: Free (for testing)
   - Copy the **Primary Key**

6. **Optional: Azure OpenAI**:
   - Search for "Azure OpenAI" in marketplace
   - Deploy a GPT model (gpt-35-turbo)
   - Copy the **Key**, **Endpoint**, and **Deployment Name**

### Step 2: Configure Environment Variables

Update the `.env` file in your project root:

```env
# Azure Speech Services
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=your_speech_region_here

# Azure Face API
AZURE_FACE_KEY=your_face_key_here
AZURE_FACE_ENDPOINT=https://your-face-resource.cognitiveservices.azure.com/

# Azure Maps
AZURE_MAPS_KEY=your_maps_key_here

# Azure OpenAI (optional)
AZURE_OPENAI_KEY=your_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_gpt_deployment_name
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Application

```bash
npm start
```

## Features Enhanced by Azure Integration

### Voice Features
- **Before**: Browser-based speech synthesis (limited voices, quality varies)
- **After**: Azure neural voices (high quality, multiple languages, more natural)

### Face Recognition
- **Before**: Simple demo logic (random matching)
- **After**: Real AI-powered face detection and identification

### Location Services
- **Before**: Basic coordinates display
- **After**: Reverse geocoding to show actual addresses and landmarks

### Memory Stories (Optional)
- **Before**: Static content
- **After**: AI-generated personalized stories

## API Endpoints Added

### Speech Synthesis
```
POST /api/speech/synthesize
Body: { "text": "Hello", "language": "en-US", "voice": "en-US-AriaRUS" }
Returns: Audio/WAV file
```

### Face Detection
```
POST /api/face/detect
Body: { "imageData": "data:image/jpeg;base64,..." }
Returns: { "faces": [...] }
```

### Face Identification
```
POST /api/face/identify
Body: { "faceId": "uuid", "personGroupId": "known-people" }
Returns: { "results": [...] }
```

### Location Lookup
```
GET /api/maps/location/:lat/:lng
Returns: Address information from coordinates
```

### Story Generation (Optional)
```
POST /api/openai/generate-story
Body: { "prompt": "family memories", "context": "summer vacations" }
Returns: { "story": "Generated story text..." }
```

## Fallback Behavior

The app is designed to work even without Azure services configured:

- **Speech**: Falls back to browser TTS if Azure Speech fails
- **Face Recognition**: Falls back to demo logic if Azure Face API unavailable
- **Location**: Shows coordinates if Azure Maps fails
- **Stories**: Uses static content if Azure OpenAI not configured

## Security Considerations

- Never commit `.env` file to version control
- Use Azure Key Vault for production key management
- Implement proper authentication and authorization
- Regular key rotation
- Monitor API usage and costs

## Cost Optimization

- Use Free tiers for development/testing
- Implement caching for repeated requests
- Monitor usage in Azure portal
- Set up budget alerts

## Next Steps

1. **Test with Free Tiers**: Start with Azure Free accounts
2. **Person Group Setup**: For face recognition, create person groups in Azure Face API
3. **Voice Customization**: Choose appropriate voices for your target languages
4. **Monitoring**: Set up Azure Application Insights for performance monitoring

## Troubleshooting

### Common Issues:

1. **404 Errors**: Check if Azure resources are created and keys are correct
2. **Authentication Errors**: Verify keys and endpoints in `.env`
3. **Region Mismatch**: Ensure Speech service region matches your location
4. **Quota Exceeded**: Check Azure subscription limits and upgrade if needed

### Debug Mode:

The app includes extensive console logging. Open browser DevTools (F12) and check the Console tab for detailed information about Azure service calls and responses.

## Support

For Azure-specific issues:
- Azure Documentation: https://docs.microsoft.com/azure/
- Azure Support: https://azure.microsoft.com/support/
- Cognitive Services Forums: https://docs.microsoft.com/answers/topics/azure-cognitive-services.html