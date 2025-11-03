/// 🛡️ OWASP A03: Injection Prevention - Input Validation Middleware
/// Law: Validate and sanitize ALL user inputs before processing
import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware that checks express-validator results
 * Call this AFTER validation chain to handle errors
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
}

/// Common validation chains for reuse across routes
export const validators = {
  /**
   * Email validation (RFC 5322 compliant)
   */
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),

  /**
   * Strong password validation
   * Requires: 8+ chars, uppercase, lowercase, number, special char
   */
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must be 8+ characters with uppercase, lowercase, number, and special character'
    ),

  /**
   * Username validation (alphanumeric only)
   */
  username: body('username')
    .isAlphanumeric()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 alphanumeric characters'),

  /**
   * MongoDB ObjectId validation
   */
  mongoId: param('id').isMongoId().withMessage('Invalid ID format'),

  /**
   * UUID validation
   */
  uuid: param('id').isUUID().withMessage('Invalid UUID format'),

  /**
   * Pagination parameters
   */
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],

  /**
   * Safe filename validation (prevent path traversal)
   * Only allows alphanumeric, dash, underscore, and one extension
   */
  filename: body('filename')
    .matches(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/)
    .withMessage('Invalid filename format - alphanumeric with single extension only'),

  /**
   * Safe file path validation (prevent directory traversal)
   * Blocks: ../, ..\, /etc/, C:\, etc.
   */
  filepath: body('path')
    .not()
    .matches(/(\.\.[\/\\])|(\.\.$)|(^[\/\\])|(^[a-zA-Z]:\\)/)
    .withMessage('Invalid path - directory traversal detected'),

  /**
   * URL validation (allow-list approach for SSRF prevention)
   */
  url: body('url')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    })
    .withMessage('Valid HTTP/HTTPS URL required'),

  /**
   * Stripe product ID validation
   */
  stripeProductId: body('productId')
    .matches(/^prod_[a-zA-Z0-9]+$/)
    .withMessage('Invalid Stripe product ID'),

  /**
   * Stripe price ID validation
   */
  stripePriceId: body('priceId')
    .matches(/^price_[a-zA-Z0-9]+$/)
    .withMessage('Invalid Stripe price ID'),

  /**
   * Positive integer validation
   */
  positiveInt: (fieldName) =>
    body(fieldName).isInt({ min: 1 }).toInt().withMessage(`${fieldName} must be positive integer`),

  /**
   * Amount validation (currency in cents)
   */
  amount: body('amount')
    .isInt({ min: 100 })
    .toInt()
    .withMessage('Amount must be at least 100 cents ($1.00)'),

  /**
   * Safe JSON validation
   */
  json: body('data')
    .isJSON()
    .customSanitizer((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .withMessage('Valid JSON required'),

  /**
   * MCP server name validation
   */
  mcpServerName: body('serverName')
    .isIn(['filesystem', 'memory', 'git', 'github', 'brave-search', 'sequential-thinking', 'postgres', 'everything'])
    .withMessage('Invalid MCP server name'),

  /**
   * Ring Layer validation
   */
  ringLayer: body('ringLayer')
    .isIn([0, 1, 2])
    .toInt()
    .withMessage('Ring Layer must be 0, 1, or 2'),

  /**
   * Role validation
   */
  role: body('role')
    .isIn(['COMMANDER', 'SUPERVISOR', 'OPERATOR', 'OBSERVER'])
    .withMessage('Invalid agent role'),
};

/**
 * Sanitize input to prevent XSS
 * Use for text fields that may be displayed in HTML
 */
export function sanitizeInput(fieldName) {
  return body(fieldName)
    .trim()
    .escape()
    .stripLow()
    .withMessage(`${fieldName} contains invalid characters`);
}

/**
 * Custom validator for SSRF prevention
 * Blocks private IP ranges and localhost
 */
export function validatePublicURL(fieldName) {
  return body(fieldName).custom((value) => {
    const url = new URL(value);

    // Block localhost and loopback
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    if (blockedHosts.includes(url.hostname.toLowerCase())) {
      throw new Error('Private/internal URLs not allowed');
    }

    // Block private IP ranges
    const privateRanges = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./];
    if (privateRanges.some((range) => range.test(url.hostname))) {
      throw new Error('Private IP ranges not allowed');
    }

    return true;
  });
}
