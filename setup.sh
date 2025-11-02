#!/bin/bash

# BambiSleep Church - Quick Setup Script

echo "🔥 BambiSleep Church - Hellfire Sanctuary Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Error: Node.js 20+ required. Current version: $(node -v)"
  echo "   Please upgrade: https://nodejs.org/"
  exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ npm version: $(npm -v)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp .env.example .env
  echo "✓ .env created"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env and add your Stripe keys!"
  echo "   Get them from: https://dashboard.stripe.com/apikeys"
  echo ""
else
  echo "✓ .env file exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Dependencies installed successfully"
else
  echo ""
  echo "❌ npm install failed"
  exit 1
fi

# Check for FFmpeg
if command -v ffmpeg &> /dev/null; then
  echo "✓ FFmpeg installed: $(ffmpeg -version | head -n1)"
else
  echo "⚠️  FFmpeg not found - video streaming will not work"
  echo "   Install: sudo apt install ffmpeg"
fi

# Create videos directory if it doesn't exist
mkdir -p videos

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Stripe API keys"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Read README.md for detailed documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
