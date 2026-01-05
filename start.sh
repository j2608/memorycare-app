#!/bin/bash

# ============================================
# MEMORYCARE - QUICK START SCRIPT
# One-click setup for the application
# ============================================

echo "🧠 MemoryCare - Alzheimer's Assistive Application"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✓ Dependencies installed successfully!"
echo ""

# Start the server
echo "🚀 Starting MemoryCare application..."
echo ""
echo "🌐 Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "👤 Patient Interface: http://localhost:3000/patient"
echo "👨‍⚕️ Caregiver Dashboard: http://localhost:3000/caregiver"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

npm start
