# Premium Sanctuary Archives

## 👑 Welcome, Esteemed Subscriber

Your patronage has unlocked the inner sanctum of knowledge. Here lie the **forbidden archives**, accessible only to those who have proven their commitment through subscription.

---

## Exclusive Content

### Video Archives

Access the complete video library through `/video/watch/:videoId`. Each video is:

- Transcoded for optimal web playback
- Protected by JWT token verification
- Streamed with signed URLs (1-hour expiration)
- Enhanced with live avatar overlays

### Private Scriptures

Markdown documents containing advanced technical knowledge, philosophical treatises, and operational secrets of the sanctuary's architecture.

### Live Interactions

Premium subscribers can:

- Participate in real-time chat via WebSocket
- Trigger avatar actions synchronized across all viewers
- Receive priority notifications
- Access exclusive rooms/channels

---

## Your Subscription

**Status**: Active  
**Benefits**: Full access to all premium content  
**Renewal**: Automatic monthly billing through Stripe  
**Management**: Access `/stripe/subscription-status` to view or cancel

---

## Technical Implementation

As a premium member, you may be interested in how this sanctuary operates:

### Authentication Flow

1. User registers → Stripe Customer created
2. User subscribes → Stripe Subscription active
3. User accesses content → Middleware checks subscription status
4. JWT token issued for API access
5. Video access → Signed URL generated with 1-hour expiration

### Security Measures

- All API routes protected with authentication middleware
- Webhook signature verification for Stripe events
- Rate limiting (100 requests/15min per IP)
- HTTPS required in production
- Session cookies with httpOnly flag
- CORS restricted to sanctuary domain

### Video Streaming

```javascript
// FFmpeg transcoding pipeline
ffmpeg -i input.mp4
  -c:v libx264
  -preset fast
  -crf 23
  -c:a aac
  -b:a 128k
  -movflags +faststart
  output.mp4
```

### WebSocket Events

- `auth` - Authenticate with JWT token
- `chat` - Send/receive messages
- `avatar_action` - Trigger avatar animations
- `subscribe_room` - Join specific channels
- `video_event` - Notify of video play/pause

---

## Support

Need assistance? The aristocratic support channels are:

- **Technical Issues**: Check `/health` endpoint
- **Billing**: Stripe Dashboard or `/stripe/subscription-status`
- **Content**: Browse `/markdown/list` for available scriptures

---

## Privacy & Data

Your privacy is paramount:

- Payment data handled exclusively by Stripe (PCI Level 1)
- No credit card information stored on our servers
- Session data encrypted
- Video viewing logs kept for 30 days
- Right to data deletion upon request

---

_"Knowledge is the currency of the aristocracy"_

**Thank you for your patronage**
