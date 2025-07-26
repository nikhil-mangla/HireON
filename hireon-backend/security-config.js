/**
 * Security Configuration for HireOn Backend
 * This file contains all security-related configurations and utilities
 */

const crypto = require('crypto');

// Security Configuration Object
const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: {
      trial: '2d',
      monthly: '30d',
      annual: '365d',
      free: '30d'
    },
    algorithm: 'HS256'
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:5180'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
  },

  // File Upload Security
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    uploadDir: 'uploads/',
    filenameSanitization: true
  },

  // Input Validation Rules
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    email: {
      maxLength: 254,
      requireValidFormat: true
    },
    name: {
      minLength: 2,
      maxLength: 50,
      allowSpecialChars: false
    },
    amount: {
      min: 1,
      max: 100000, // 1 lakh INR
      currency: 'INR'
    }
  },

  // Subscription Configuration
  subscription: {
    trial: {
      duration: parseInt(process.env.TRIAL_DURATION_DAYS) || 2,
      price: 99,
      maxUses: 1
    },
    monthly: {
      duration: parseInt(process.env.MONTHLY_DURATION_DAYS) || 30,
      price: 999
    },
    annual: {
      duration: parseInt(process.env.ANNUAL_DURATION_DAYS) || 365,
      price: 9999
    }
  },

  // Security Headers Configuration
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://oauth2.googleapis.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // Environment-specific configurations
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  }
};

// Security Utility Functions
const securityUtils = {
  // Password validation
  validatePassword: (password) => {
    const { password: rules } = securityConfig.validation;
    
    if (password.length < rules.minLength) {
      return { valid: false, error: `Password must be at least ${rules.minLength} characters long` };
    }
    
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    
    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    
    if (rules.requireNumbers && !/\d/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    
    if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
  },

  // Email validation
  validateEmail: (email) => {
    const { email: rules } = securityConfig.validation;
    
    if (email.length > rules.maxLength) {
      return { valid: false, error: `Email must be less than ${rules.maxLength} characters` };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (rules.requireValidFormat && !emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true };
  },

  // Amount validation
  validateAmount: (amount, currency = 'INR') => {
    const { amount: rules } = securityConfig.validation;
    
    if (amount < rules.min || amount > rules.max) {
      return { 
        valid: false, 
        error: `Amount must be between ${rules.min} and ${rules.max} ${rules.currency}` 
      };
    }
    
    return { valid: true };
  },

  // Filename sanitization
  sanitizeFilename: (filename) => {
    if (!securityConfig.fileUpload.filenameSanitization) {
      return filename;
    }
    
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  },

  // Generate secure random string
  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Validate file type
  validateFileType: (mimetype) => {
    return securityConfig.fileUpload.allowedTypes.includes(mimetype);
  },

  // Validate file size
  validateFileSize: (size) => {
    return size <= securityConfig.fileUpload.maxSize;
  },

  // Check if email domain is allowed
  validateEmailDomain: (email) => {
    if (!process.env.ALLOWED_EMAIL_DOMAINS) {
      return { valid: true };
    }
    
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS.split(',');
    const userDomain = email.split('@')[1];
    
    if (!allowedDomains.includes(userDomain)) {
      return { 
        valid: false, 
        error: `Email domain ${userDomain} is not authorized` 
      };
    }
    
    return { valid: true };
  },

  // Subscription validation
  validateSubscriptionPlan: (plan) => {
    const allowedPlans = Object.keys(securityConfig.subscription);
    return allowedPlans.includes(plan);
  },

  // Currency validation
  validateCurrency: (currency) => {
    const allowedCurrencies = ['INR', 'USD', 'EUR'];
    return allowedCurrencies.includes(currency);
  },

  // Log security events
  logSecurityEvent: (event, details, level = 'info') => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      level,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };
    
    // In production, you might want to send this to a security monitoring service
    console.log(`[SECURITY ${level.toUpperCase()}] ${timestamp}: ${event}`, logEntry);
  }
};

// Export configuration and utilities
module.exports = {
  config: securityConfig,
  utils: securityUtils
}; 