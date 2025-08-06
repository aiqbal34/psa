#!/bin/bash

# UCDPakiPSA Polling Website Setup Script
echo "🗳️  Setting up UCDPakiPSA Polling Website..."
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

# Create environment files from examples
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from example"
    echo "🔧 Please update backend/.env with your database credentials"
else
    echo "ℹ️  backend/.env already exists"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/env.local.example frontend/.env.local
    echo "✅ Created frontend/.env.local from example"
else
    echo "ℹ️  frontend/.env.local already exists"
fi

# Create basic favicon if it doesn't exist
if [ ! -f "frontend/public/favicon.ico" ]; then
    echo "🎨 Creating basic favicon..."
    # This creates a simple 16x16 transparent favicon
    echo "Creating favicon.ico..."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your PostgreSQL database URL"
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Development URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For deployment instructions, see DEPLOYMENT.md"
echo ""
echo "🚀 Happy polling!"