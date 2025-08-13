#!/bin/bash

echo "🌸 Setting up Bloomhabit development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
    echo "   Please install Docker or set up PostgreSQL manually and update your .env file."
else
    echo "✅ Docker is available"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🌱 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "🏗️  Installing backend dependencies..."
cd backend && npm install && cd ..

echo "✅ Dependencies installed successfully!"

# Start database if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Starting PostgreSQL database..."
    docker-compose up -d postgres

    echo "⏳ Waiting for database to be ready..."
    sleep 10

    echo "✅ Database should be ready at localhost:5432"
else
    echo "⚠️  Please ensure PostgreSQL is running and update your .env file accordingly."
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start both frontend and backend"
echo "3. Frontend will be available at: http://localhost:3000"
echo "4. Backend will be available at: http://localhost:3001"
echo "5. API docs will be available at: http://localhost:3001/api"
echo ""
echo "Happy coding! 🌸"
