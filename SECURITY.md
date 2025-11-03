# BambiSleep™ Church - Attack Surface Management & Security Monitoring

**Version:** 1.0.0  
**Last Updated:** 2025-11-03  
**Status:** Production-Ready

---

## 🛡️ Overview

This document outlines the attack surface management and security monitoring practices implemented for the BambiSleep™ Church platform, following OWASP ASM Top 10 guidelines and industry best practices.

---

## 📋 OWASP ASM Top 10 Coverage

### 1. ✅ Unmanaged & Unknown External Assets

**Implementation**:
- All assets cataloged in `.vscode/settings.json` (8 MCP servers)
- Docker compose manifest for production deployment
- Environment variable documentation in `.env.example`

**Monitoring**:
```prometheus
# Track external API calls
http_requests_total{route=~"/stripe/.*|/video/.*"}
```

### 2. ✅ Exposed APIs & Unprotected Endpoints

**Protection Measures**:
- JWT authentication on all protected routes (`requireAuth()` middleware)
- Stripe subscription verification (`requireSubscription()` middleware)
- Video access tokens with 1-hour expiration
- Rate limiting: 100 requests per 15 minutes per IP

**Monitoring**:
```prometheus
# Track unauthorized access attempts
security_events_total{event_type="unauthorized_access"}
```

### 3. ✅ Public Code & Credential Exposure

**Mitigation**:
- No hardcoded credentials (all use environment variables)
- `.gitignore` excludes `.env`, `node_modules`, `logs/`
- JWT secrets required via `JWT_SECRET` env var
- Stripe keys required via `STRIPE_SECRET_KEY` env var

**Best Practices**:
- Use `process.env` for all sensitive configuration
- Rotate secrets regularly (documented in `TELEMETRY.md`)
- Never commit `.env` files to repository

### 4. ⚠️ Fake Domains & Impersonation

**Current Status**: Not implemented (future consideration)

**Recommendations**:
- Monitor for typosquatting domains (e.g., `bambis1eep.church`)
- Implement DMARC, SPF, and DKIM for email authentication
- Register common misspelling variants
- Monitor brand mentions and fake apps

### 5. ✅ Third-Party SaaS & Shadow IT

**Inventory**:
- Stripe (payment processing) - documented
- GitHub (version control) - documented  
- MCP servers (development tools) - documented in `.vscode/MCP_CONFIG_NOTES.md`
- MongoDB (database) - configured but not yet active

**Monitoring**:
```prometheus
# Track third-party API failures
http_requests_total{route="/stripe/*",status_code=~"5.."}
```

### 6. ✅ Cloud & SaaS Misconfigurations

**Security Measures**:
- Helmet CSP (Content Security Policy) enforced
- CORS restricted to production domain or localhost
- Session cookies: `httpOnly`, `secure` in production
- Rate limiting on all API endpoints
- Express security headers (X-Frame-Options, etc.)

**Environment-Specific Security**:
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  httpOnly: true,  // No client-side JavaScript access
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
}
```

### 7. ✅ Exposed Debug & Test Environments

**Protection**:
- Production mode hides error stack traces
- Debug logs only in development (`NODE_ENV=development`)
- No test/staging routes in production build
- Health check endpoint returns minimal info

**Conditional Behavior**:
```javascript
error: process.env.NODE_ENV === 'production' ? {} : err
```

### 8. ⚠️ Insecure DNS Configurations

**Current Status**: Not applicable (localhost development)

**Production Recommendations**:
- Configure DNS CAA records
- Enable DNSSEC
- Monitor for dangling DNS records
- Implement subdomain takeover prevention

### 9. ✅ Unauthenticated Internet-Facing Resources

**Authenticated Endpoints**:
- `/markdown/private/*` - requires subscription
- `/video/stream/*` - requires signed token
- `/stripe/create-checkout-session` - requires auth
- WebSocket authentication - requires JWT

**Public Endpoints** (intentionally):
- `/` - homepage
- `/auth/register` - user registration
- `/auth/login` - user login
- `/markdown/public/*` - free content
- `/health` - health check
- `/metrics` - Prometheus metrics (restrict in production!)

**⚠️ CRITICAL**: Restrict `/metrics` endpoint in production using IP whitelist or authentication.

### 10. ✅ Lack of Continuous Monitoring

**Monitoring Implementation**:
- OpenTelemetry distributed tracing
- Prometheus metrics collection (9464/metrics)
- Winston structured logging (`logs/*.log`)
- Security event tracking (`security_events_total`)
- Real-time suspicious activity detection

---

## 🔍 Security Monitoring Patterns

### Suspicious Activity Detection

The `securityMonitoringMiddleware` automatically detects:

```javascript
const suspiciousPatterns = [
  /\.\.\//,          // Directory traversal
  /<script/i,        // XSS attempts
  /union.*select/i,  // SQL injection
  /eval\(/i,         // Code injection
  /cmd=/i,           // Command injection
];
```

**Metrics**:
```prometheus
security_events_total{event_type="suspicious_request",severity="high"}
suspicious_activity_total{activity_type="injection_attempt",source="<ip>"}
```

### Authentication Security

**Failed Login Protection**:
- Track failed attempts: `auth_attempts_total{type="login",status="failed"}`
- Log suspicious patterns (brute force, credential stuffing)
- Rate limit authentication endpoints

**Session Security**:
- Track active sessions: `auth_sessions_active`
- 24-hour session expiration
- Secure cookies in production
- JWT token validation on WebSocket connections

### Payment Security

**Stripe Webhook Verification**:
```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body, 
  sig, 
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Metrics**:
```prometheus
stripe_webhooks_total{event_type="*",status="signature_failed"}
```

---

## 🚨 Incident Response

### Security Event Severity Levels

**Critical** (immediate action required):
- Multiple injection attempts from same IP
- Successful unauthorized access
- Payment fraud detected
- Service outage

**High** (investigate within 1 hour):
- Repeated failed authentication attempts
- Suspicious activity patterns
- Rate limit violations

**Medium** (investigate within 24 hours):
- Single injection attempt
- Unusual access patterns
- Configuration drift

**Low** (log and monitor):
- Invalid input validation
- Expected errors (404, etc.)

### Alert Rules (Prometheus)

```yaml
groups:
  - name: security_alerts
    rules:
      - alert: HighSecurityEventRate
        expr: rate(security_events_total{severity="high"}[5m]) > 10
        for: 5m
        annotations:
          summary: "High rate of security events detected"

      - alert: SuspiciousInjectionAttempts
        expr: increase(suspicious_activity_total{activity_type="injection_attempt"}[15m]) > 5
        for: 1m
        annotations:
          summary: "Multiple injection attempts from {{ $labels.source }}"

      - alert: UnauthorizedAccessSpike
        expr: increase(security_events_total{event_type="unauthorized_access"}[5m]) > 20
        for: 5m
        annotations:
          summary: "Spike in unauthorized access attempts"
```

---

## 🔐 Security Best Practices

### 1. Secrets Management

**Current Implementation**:
```bash
# .env (NEVER commit to git)
SESSION_SECRET=<cryptographically-random-64-char-string>
JWT_SECRET=<cryptographically-random-64-char-string>
STRIPE_SECRET_KEY=sk_live_***
VIDEO_SIGNING_KEY=<random-key>
```

**Best Practices**:
- Use `openssl rand -hex 32` to generate secrets
- Rotate secrets every 90 days
- Use different secrets for dev/staging/production
- Consider vault solutions (HashiCorp Vault, AWS Secrets Manager)

### 2. Input Validation

**Always Validate**:
- File upload paths (prevent directory traversal)
- URL parameters (prevent injection)
- Request bodies (schema validation)
- Email addresses (format and domain)

**Example**:
```javascript
// Prevent directory traversal
if (filename.includes('..') || filename.includes('/')) {
  trackSecurityEvent('directory_traversal_attempt', 'high', { filename });
  return res.status(400).json({ error: 'Invalid filename' });
}
```

### 3. Rate Limiting

**Current Configuration**:
- 100 requests per 15 minutes per IP
- Applied to all `/api/*` routes

**Production Recommendations**:
- Stricter limits for authentication endpoints (10/15min)
- Per-user rate limits (after authentication)
- Progressive delays for repeated violations
- CAPTCHA after threshold

### 4. Logging Security

**What to Log**:
- All authentication attempts (success/failure)
- Security events (injection attempts, etc.)
- Payment transactions
- Configuration changes
- Failed authorization checks

**What NOT to Log**:
- Passwords (even hashed)
- Credit card numbers
- Session tokens
- API keys

---

## 📊 Security Metrics Dashboard

### Key Metrics to Monitor

```promql
# Authentication Security
rate(auth_attempts_total{status="failed"}[5m])
auth_sessions_active

# Injection Attempts
increase(suspicious_activity_total[1h])

# Rate Limit Violations
increase(rate_limit_hits_total[15m])

# Payment Security
stripe_webhooks_total{status="signature_failed"}

# Error Rates
rate(http_requests_total{status_code=~"5.."}[5m])
```

---

## 🧪 Security Testing

### Recommended Tools

1. **OWASP ZAP** - Web application security scanner
2. **Burp Suite** - Manual penetration testing
3. **npm audit** - Dependency vulnerability scanning
4. **Snyk** - Continuous dependency monitoring
5. **SonarQube** - Code security analysis

### Manual Security Checklist

- [ ] Test authentication bypass attempts
- [ ] Test directory traversal (`../../../etc/passwd`)
- [ ] Test XSS injection in all input fields
- [ ] Test SQL injection in database queries (when implemented)
- [ ] Test rate limit enforcement
- [ ] Test session fixation/hijacking
- [ ] Test CSRF protection (if implementing state-changing forms)
- [ ] Review CSP headers effectiveness
- [ ] Test WebSocket authentication
- [ ] Test video token expiration

---

## 🔄 Security Update Procedures

### Dependency Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Review and apply manually
npm audit fix --force
```

### Security Patch Deployment

1. **Review** security advisories (GitHub, npm, Stripe)
2. **Test** patches in development environment
3. **Monitor** telemetry during rollout
4. **Track** deployment as DORA metric:
   ```javascript
   trackDeployment('production', 'success', leadTimeSeconds);
   ```
5. **Verify** no increase in error rates or security events

---

## 📞 Incident Response Contacts

**Internal**:
- Security Team: `security@bambisleep.church`
- DevOps Team: `devops@bambisleep.church`

**External**:
- Stripe Security: <https://stripe.com/docs/security>
- GitHub Security: <https://github.com/security>
- OWASP Resources: <https://owasp.org/>

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Attack Surface Management](https://owasp.org/www-project-attack-surface-management/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Stripe Security](https://stripe.com/docs/security)

---

*Organization*: BambiSleepChat  
*Repository*: <https://github.com/BambiSleepChat/bambisleep-church>  
*License*: MIT with BambiSleepChat attribution required
