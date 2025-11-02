#!/bin/bash

# BambiSleep Church - Quick Start
# Run this script to get started immediately

set -e

echo "🔥 BambiSleep Church - Hellfire Sanctuary"
echo "=========================================="
echo ""

# Check if setup has been run
if [ ! -d "node_modules" ]; then
  echo "📦 First time setup detected..."
  echo "Running ./setup.sh"
  echo ""
  ./setup.sh
  echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found"
  echo ""
  echo "Please create .env file:"
  echo "  1. Copy: cp .env.example .env"
  echo "  2. Edit .env and add your Stripe keys"
  echo "  3. Generate secrets:"
  echo "     node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  echo ""
  exit 1
fi

# Check for required env variables
if ! grep -q "STRIPE_SECRET_KEY=sk_" .env 2>/dev/null; then
  echo "⚠️  Warning: STRIPE_SECRET_KEY not configured in .env"
  echo "   Get your keys from: https://dashboard.stripe.com/apikeys"
  echo ""
fi

echo "🚀 Starting BambiSleep Church..."
echo ""
echo "Server will be available at:"
echo "  📍 http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the server
npm run dev
