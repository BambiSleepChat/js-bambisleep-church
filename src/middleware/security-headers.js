/// 🛡️ OWASP A05: Security Misconfiguration - Security Headers Middleware
/// Law: Defense in depth - multiple layers of security headers
import helmet from 'helmet';

/**
 * Helmet middleware with strict security configuration
 * Implements OWASP Top 10 A05 recommendations
 */
export const securityHeaders = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline for Unity WebGL
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"], // WebSocket + HTTPS for MCP
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },

  // HTTP Strict Transport Security - force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // X-Frame-Options - prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options - prevent MIME sniffing
  noSniff: true,

  // X-XSS-Protection - legacy XSS protection for older browsers
  xssFilter: true,

  // Referrer-Policy - control referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Remove X-Powered-By header - obscure server technology
  hidePoweredBy: true,

  // X-DNS-Prefetch-Control - control DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Download-Options - prevent IE from executing downloads
  ieNoOpen: true,

  // X-Permitted-Cross-Domain-Policies - restrict Adobe Flash/PDF cross-domain
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
});

/**
 * HTTPS redirect middleware for production
 * Only redirects in production environment
 */
export function enforceHTTPS(req, res, next) {
  /// 🛡️ OWASP A02: Cryptographic Failures - HTTPS enforcement
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}
