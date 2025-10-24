#!/bin/bash

# Thyrosoft Backend Setup Script
echo "🚀 Setting up Thyrosoft Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
if [ -f "package-backend.json" ]; then
    npm install --package-lock-only package-backend.json
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  package-backend.json not found, skipping dependency installation"
fi

echo ""
echo "🎯 To start the backend server:"
echo "   npm run backend    (from this directory)"
echo "   or"
echo "   node server.js"
echo ""
echo "📍 Backend will run on: http://localhost:3001"
echo "🔗 Frontend should connect to: http://localhost:3001/api"
