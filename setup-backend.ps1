# Thyrosoft Backend Setup Script for Windows
Write-Host "🚀 Setting up Thyrosoft Backend Server..." -ForegroundColor Green

# Check if Node.js is installed
$nodeVersion = & node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
$npmVersion = & npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are installed" -ForegroundColor Green

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
if (Test-Path "package-backend.json") {
    npm install
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  package-backend.json not found, skipping dependency installation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 To start the backend server:" -ForegroundColor Cyan
Write-Host "   npm run backend    (from this directory)" -ForegroundColor White
Write-Host "   or" -ForegroundColor White
Write-Host "   node server.js" -ForegroundColor White
Write-Host ""
Write-Host "📍 Backend will run on: http://localhost:3001" -ForegroundColor Green
Write-Host "🔗 Frontend should connect to: http://localhost:3001/api" -ForegroundColor Green
