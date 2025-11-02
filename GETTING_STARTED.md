# 🔥 BambiSleep Church - Setup Complete

Your Aristocratic Hellfire Sanctuary is ready for development!

## 📁 What Was Created

### Core Application (19 files)

```
bambisleep-church/
├── src/                          # Application source code
│   ├── server.js                # Express + WebSocket server
│   ├── middleware/
│   │   └── auth.js              # JWT & subscription verification
│   ├── routes/
│   │   ├── auth.js              # Registration, login, logout
│   │   ├── markdown.js          # Markdown rendering with paywall
│   │   ├── stripe.js            # Payment processing & webhooks
│   │   └── video.js             # FFmpeg video streaming
│   └── services/
│       └── websocket.js         # WebSocket server & message routing
│
├── views/                        # EJS templates
│   ├── layout.ejs               # Base template
│   ├── index.ejs                # Homepage with auth forms
│   ├── markdown.ejs             # Markdown content viewer
│   ├── video-player.ejs         # Video player with avatar overlay
│   ├── 404.ejs                  # Not found page
│   └── error.ejs                # Error page
│
├── public/                       # Static assets
│   ├── css/
│   │   ├── diablo.css           # Core Hellfire theme
│   │   ├── sanctuary.css        # Component styles
│   │   ├── markdown.css         # Markdown content styles
│   │   └── video-player.css     # Video player styles
│   └── js/
│       ├── websocket.js         # WebSocket client
│       ├── auth.js              # Authentication forms
│       └── video-player.js      # Video player logic
│
├── content/                      # Markdown content
│   ├── public/
│   │   └── welcome.md           # Public welcome page
│   └── private/
│       └── premium-welcome.md   # Premium subscriber content
│
├── videos/                       # Video files (empty - add your content)
│   └── .gitkeep
│
├── package.json                 # Dependencies & npm scripts
├── .env.example                 # Environment variable template
├── .gitignore                   # Git exclusions
├── README.md                    # Full documentation
├── CHECKLIST.md                 # Development checklist
├── Dockerfile                   # Docker container config
├── docker-compose.yml           # Docker orchestration
├── ecosystem.config.js          # PM2 process manager config
└── setup.sh                     # Quick setup script
```

## 🚀 Quick Start

### 1. Run Setup Script

```bash
cd /mnt/f/bambisleep-church
./setup.sh
```

This will:

- ✅ Check Node.js version (20+ required)
- ✅ Create `.env` from template
- ✅ Install all dependencies
- ✅ Check for FFmpeg
- ✅ Create videos directory

### 2. Configure Environment

```bash
# Edit .env file
nano .env

# Add these required values:
SESSION_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
VIDEO_SIGNING_KEY=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Start Development Server

```bash
npm run dev
```

Server starts at: **http://localhost:3000**

## 🎨 Features Included

### ✅ Express.js Web Server

- Latest Node.js 20 LTS
- ES Modules (`import/export`)
- Security middleware (helmet, cors, rate-limit)
- Session management
- Static file serving
- EJS templating

### ✅ Markdown Rendering

- `markdown-it` with plugins (attrs, anchor, TOC)
- Public content at `/markdown/public/:filename`
- Private content at `/markdown/private/:filename` (requires subscription)
- Directory traversal protection

### ✅ WebSocket Real-Time Features

- Bidirectional communication
- Authentication via JWT
- Room subscriptions
- Chat messaging
- Avatar actions
- Auto-reconnect with exponential backoff
- Keepalive ping/pong

### ✅ Stripe Payment Integration

- Subscription checkout flow
- Payment intent creation
- Webhook handling with signature verification
- Subscription status checks
- Cancellation support
- Customer creation on registration

### ✅ FFmpeg Video Streaming

- Signed URL generation (1-hour expiration)
- Range request support (video seeking)
- Subscription verification
- Avatar overlay positioning
- Metadata extraction
- Video player with controls

### ✅ Authentication System

- User registration with bcrypt password hashing
- JWT token-based auth
- Session management
- Login/logout endpoints
- Stripe customer creation

### ✅ Diablo 1 Hellfire Aesthetic

- Gothic typography
- Hellfire color palette (red, orange, gold)
- Flame text animations
- Stone gradient backgrounds
- Premium badges
- Responsive design

## 📚 Documentation

- **README.md** - Full project documentation with API reference
- **CHECKLIST.md** - Development checklist with testing steps
- **copilot-instructions.md** - Comprehensive MCP + Stripe integration guide

## 🔐 Security Features

- ✅ Helmet.js (secure HTTP headers)
- ✅ CORS with credentials
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Stripe webhook signature verification
- ✅ Signed video URLs with expiration
- ✅ Directory traversal protection
- ✅ Environment variable secrets

## 🧪 Testing Checklist

### Authentication

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Markdown

```bash
# Public content (no auth required)
curl http://localhost:3000/markdown/public/welcome

# Private content (requires subscription)
curl http://localhost:3000/markdown/private/premium-welcome \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Stripe (requires configuration)

```bash
# Test with Stripe CLI
stripe listen --forward-to localhost:3000/stripe/webhook
stripe trigger payment_intent.succeeded

# Check subscription status
curl http://localhost:3000/stripe/subscription-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐳 Deployment Options

### Option 1: PM2 (Simple)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs
```

### Option 2: Docker

```bash
docker-compose up -d
docker-compose logs -f
```

### Option 3: Manual

```bash
NODE_ENV=production npm start
```

## ⚠️ Important Next Steps

1. **Configure Stripe** (see CHECKLIST.md)

   - Create product and price in Stripe Dashboard
   - Set up webhook endpoint
   - Add webhook secret to `.env`

2. **Add Content**

   - Place `.md` files in `content/public/` and `content/private/`
   - Add video files to `videos/` directory
   - Consider transcoding videos for web (see README.md)

3. **Database Migration** (for production)

   - Current: In-memory user storage
   - Recommended: PostgreSQL with Prisma ORM
   - See CHECKLIST.md for migration guide

4. **SSL/HTTPS Setup** (for production)
   - Use Let's Encrypt with certbot
   - Configure nginx reverse proxy
   - Update Stripe webhook URL

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

### FFmpeg Not Found

```bash
# Install FFmpeg
sudo apt install ffmpeg

# Verify
ffmpeg -version
```

### Stripe Webhooks Not Working

```bash
# Test locally with Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/stripe/webhook

# In another terminal, trigger test event
stripe trigger payment_intent.succeeded
```

### WebSocket Connection Failed

- Check browser console for errors
- Verify server is running
- Check firewall rules
- Ensure CSP allows WebSocket connections

## 📖 Learning Resources

- **Express.js**: https://expressjs.com/
- **markdown-it**: https://github.com/markdown-it/markdown-it
- **Stripe API**: https://stripe.com/docs/api
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- **FFmpeg**: https://ffmpeg.org/documentation.html
- **JWT**: https://jwt.io/introduction

## 🎯 What's Next?

Follow the checklist in **CHECKLIST.md** for:

- Environment configuration
- Stripe setup
- Content creation
- Testing all features
- Database migration
- Deployment preparation

## 💡 Pro Tips

1. **Use Stripe Test Mode** first (keys starting with `sk_test_` and `pk_test_`)
2. **Test webhooks locally** with Stripe CLI before deploying
3. **Transcode videos** for web before uploading (see README.md for FFmpeg commands)
4. **Monitor logs** during development: `npm run dev` shows detailed output
5. **Check `/health` endpoint** to verify server is running: http://localhost:3000/health

---

## 🔥 Ready to Start?

```bash
cd /mnt/f/bambisleep-church
./setup.sh
npm run dev
```

Then open **http://localhost:3000** in your browser.

Welcome to your Aristocratic Hellfire Sanctuary! 👑

---

**Version**: 1.0.0  
**Created**: January 2025  
**Node.js**: 20+ (LTS)  
**License**: Private/Proprietary
