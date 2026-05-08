#!/bin/bash

echo "🚀 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗 Building project..."
npm run build

echo "🔁 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete."
