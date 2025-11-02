# BambiSleep Church - Development Checklist

## Initial Setup ✅ (Completed)

- [x] Project structure created
- [x] Dependencies configured in package.json
- [x] Express server with WebSocket support
- [x] Stripe payment integration
- [x] FFmpeg video streaming routes
- [x] Markdown rendering with paywall
- [x] Authentication system (JWT + sessions)
- [x] Diablo 1 Hellfire themed UI
- [x] Client-side JavaScript (WebSocket, auth, video player)
- [x] Sample content (public + private markdown)
- [x] Documentation (README.md)

## Environment Configuration 🔧 (Required Next)

- [ ] Copy `.env.example` to `.env`
- [ ] Add `STRIPE_SECRET_KEY` (from Stripe Dashboard)
- [ ] Add `STRIPE_PUBLISHABLE_KEY` (from Stripe Dashboard)
- [ ] Generate `SESSION_SECRET` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Generate `JWT_SECRET` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Set `VIDEO_SIGNING_KEY` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

## Dependencies Installation 📦

- [ ] Run `npm install` (or use `./setup.sh`)
- [ ] Verify FFmpeg is installed: `ffmpeg -version`
  - Linux: `sudo apt install ffmpeg`
  - Mac: `brew install ffmpeg`
  - Windows: `choco install ffmpeg`

## Stripe Configuration 💳

- [ ] Create Stripe account (if not exists)
- [ ] Create a Product in Stripe Dashboard
- [ ] Create a recurring Price for the product (e.g., $9.99/month)
- [ ] Copy Price ID (starts with `price_`) for checkout sessions
- [ ] Set up webhook endpoint: `https://yourdomain.com/stripe/webhook`
- [ ] Add webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:3000/stripe/webhook`

## Content Preparation 📝

- [ ] Add markdown files to `content/public/` (accessible to all)
- [ ] Add markdown files to `content/private/` (subscribers only)
- [ ] Add video files to `videos/` directory
- [ ] Consider transcoding videos for web:
  ```bash
  ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 \
         -c:a aac -b:a 128k -movflags +faststart output.mp4
  ```

## Testing Checklist 🧪

### Authentication Flow

- [ ] Register a new user (POST /auth/register)
- [ ] Login with credentials (POST /auth/login)
- [ ] Verify JWT token is returned
- [ ] Check session persists on refresh
- [ ] Test logout (POST /auth/logout)

### Markdown Rendering

- [ ] Access public markdown: GET /markdown/public/welcome
- [ ] Try accessing private without subscription (should get 403)
- [ ] List all markdown files: GET /markdown/list

### Stripe Payment Flow

- [ ] Create checkout session: POST /stripe/create-checkout-session
- [ ] Complete payment with test card: 4242 4242 4242 4242
- [ ] Verify webhook receives `checkout.session.completed`
- [ ] Check subscription status: GET /stripe/subscription-status
- [ ] Access private markdown after subscription
- [ ] Test subscription cancellation: POST /stripe/cancel-subscription

### Video Streaming

- [ ] Request video access: GET /video/access/:videoId (requires subscription)
- [ ] Verify signed token is returned
- [ ] Stream video: GET /video/stream/:videoId?token=...
- [ ] Test video player page: GET /video/watch/:videoId
- [ ] Verify avatar overlay renders
- [ ] Test video without subscription (should show paywall)

### WebSocket Features

- [ ] Open browser console
- [ ] Verify WebSocket connection established
- [ ] Authenticate via WebSocket (send auth message)
- [ ] Test ping/pong keepalive
- [ ] Send chat message and verify broadcast
- [ ] Test avatar_action message type
- [ ] Verify reconnection on disconnect

## Security Hardening 🔒

- [ ] Enable HTTPS in production (use Let's Encrypt)
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Update `SESSION_SECRET` to strong random value
- [ ] Verify helmet CSP headers are active
- [ ] Test rate limiting (try 100+ requests in 15 min)
- [ ] Review Stripe webhook signature verification
- [ ] Implement database instead of in-memory users
- [ ] Add input validation for all forms
- [ ] Set up CORS whitelist for production domains

## Database Migration 🗄️

Current implementation uses in-memory storage. For production:

- [ ] Choose database (PostgreSQL recommended)
- [ ] Install ORM (Prisma or TypeORM)
- [ ] Create users table:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Create sessions table (for express-session)
- [ ] Migrate auth.js to use database queries
- [ ] Add indexes on email and stripe_customer_id

## Deployment Preparation 🚀

### Option 1: PM2 (Node.js Process Manager)

- [ ] Install PM2: `npm install -g pm2`
- [ ] Create ecosystem.config.js:
  ```javascript
  module.exports = {
    apps: [
      {
        name: "bambisleep-church",
        script: "./src/server.js",
        instances: "max",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
          PORT: 3000,
        },
      },
    ],
  };
  ```
- [ ] Start: `pm2 start ecosystem.config.js`
- [ ] Set up auto-restart: `pm2 startup`

### Option 2: Docker

- [ ] Build image: `docker build -t bambisleep-church .`
- [ ] Run container: `docker run -d -p 3000:3000 --env-file .env bambisleep-church`
- [ ] Set up docker-compose with nginx reverse proxy
- [ ] Configure SSL certificates

### Nginx Reverse Proxy

- [ ] Install nginx
- [ ] Configure site:
  ```nginx
  server {
    listen 80;
    server_name bambisleep.church;

    location / {
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
  ```
- [ ] Enable WebSocket proxying
- [ ] Set up SSL with certbot

## Monitoring Setup 📊

- [ ] Set up application logging (winston or pino)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Monitor Stripe webhooks in dashboard
- [ ] Set up server metrics (Prometheus + Grafana)
- [ ] Configure alerting for critical errors

## Performance Optimization ⚡

- [ ] Enable gzip compression (already configured)
- [ ] Implement Redis for session storage
- [ ] Add caching headers for static assets
- [ ] Optimize video transcoding pipeline
- [ ] Implement CDN for video delivery
- [ ] Add database query caching
- [ ] Set up HLS adaptive streaming for videos

## Legal & Compliance 📋

- [ ] Write Privacy Policy (GDPR compliance)
- [ ] Write Terms of Service
- [ ] Add Cookie Consent banner
- [ ] Configure Stripe webhooks for PCI compliance
- [ ] Set up automated backups
- [ ] Document data retention policies

## Nice-to-Have Features ✨

- [ ] User profile pages
- [ ] Password reset via email
- [ ] Email notifications (subscription confirmations)
- [ ] Admin dashboard for content management
- [ ] Search functionality for markdown content
- [ ] Video playlist creation
- [ ] User comments on videos/markdown
- [ ] Social login (OAuth with Google/GitHub)
- [ ] Multi-language support (i18n)
- [ ] Dark/light theme toggle (currently only dark)

## Current Status

**Phase**: Initial Setup Complete ✅
**Next Action**: Run `./setup.sh` and configure `.env` file
**Blockers**: None - ready for environment configuration

---

## Quick Commands Reference

```bash
# Development
npm run dev          # Start with auto-reload
npm start            # Production mode

# Testing Stripe webhooks locally
stripe listen --forward-to localhost:3000/stripe/webhook
stripe trigger payment_intent.succeeded

# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Database migrations (when implemented)
npx prisma migrate dev
npx prisma studio

# PM2 management
pm2 start ecosystem.config.js
pm2 logs
pm2 restart all
pm2 stop all

# Docker
docker build -t bambisleep-church .
docker run -p 3000:3000 --env-file .env bambisleep-church
```

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
