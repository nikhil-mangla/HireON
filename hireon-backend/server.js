require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const { Resend } = require('resend');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'hireon-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://oauth2.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration - allow both production and development origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Production origins
      process.env.FRONTEND_URL,
      'https://hire-on-nikhil-manglas-projects.vercel.app',
      'https://hireon-rho.vercel.app',
      'https://hireon-aiel.onrender.com',
      // Development origins
      'http://localhost:5173',
      'http://localhost:5180',
      'http://localhost:3000',
      'http://localhost:3001',
      // Vercel preview deployments
      /^https:\/\/hireon-.*-nikhil-manglas-projects\.vercel\.app$/,
      /^https:\/\/hireon-.*\.vercel\.app$/
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration with security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + '-' + sanitizedName);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF and DOCX files
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Environment validation
const requiredEnvVars = [
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// JWT Secret - must be strong in production
const JWT_SECRET = process.env.JWT_SECRET;
if (JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  logger.warn('Using default JWT secret. Please change this in production!');
}

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Email configuration
let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  logger.info('Resend email service configured successfully');
} else {
  logger.warn('Resend API key not configured. Password reset emails will not be sent.');
}

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://hireon-rho.vercel.app';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  logger.info(`Reset URL generated: ${resetUrl}`);
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">HireOn</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          You requested a password reset for your HireOn account. Click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            Reset Password
          </a>
        </div>
        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #667eea; word-break: break-all; margin-bottom: 25px;">
          <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
        </p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons. 
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; text-align: center; font-size: 12px; margin: 0;">
          This email was sent from HireOn. If you have any questions, contact us at support@hireon.ex
        </p>
      </div>
    </div>
  `;

  try {
    if (!resend) {
      logger.warn(`Resend not configured. Would send password reset email to: ${email} with token: ${resetToken}`);
      
      // For development/testing, log the reset token
      logger.info(`DEVELOPMENT MODE: Password reset token for ${email}: ${resetToken}`);
      logger.info(`DEVELOPMENT MODE: Reset URL: ${resetUrl}`);
      
      return false; // Return false to indicate email not sent
    }
    
    logger.info(`Attempting to send password reset email to: ${email}`);
    logger.info(`Resend API key configured: ${!!process.env.RESEND_API_KEY}`);
    logger.info(`Resend API key length: ${process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0}`);
    
    const { data, error } = await resend.emails.send({
      from: 'HireOn <noreply@hireon.tk>', // Replace with your verified domain
      to: [email],
      subject: 'HireOn - Password Reset Request',
      html: emailHtml,
      headers: {
        'X-Entity-Ref-ID': `reset-${Date.now()}` // Add unique identifier for tracking
      }
    });

    if (error) {
      logger.error('Resend API error:', error);
      logger.error('Resend API error details:', JSON.stringify(error, null, 2));
      return false;
    }

    logger.info(`Password reset email sent to: ${email}. Email ID: ${data?.id}`);
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    logger.error('Error stack:', error.stack);
    return false;
  }
};

// Token blacklist for expired subscriptions
const tokenBlacklist = new Set();

// In-memory storage for password reset tokens (fallback)
const passwordResetTokens = new Map();

// Clean up expired password reset tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of passwordResetTokens.entries()) {
    if (data.expires < now) {
      passwordResetTokens.delete(token);
      logger.info(`Cleaned up expired password reset token: ${token}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Function to blacklist a token
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Remove from blacklist after 24 hours
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
};

// Function to blacklist all tokens for a user
const blacklistUserTokens = (userId) => {
  // Add a special marker for all user tokens
  tokenBlacklist.add(`user_${userId}_all`);
};

// Middleware to check token blacklist
const checkTokenBlacklist = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token has been invalidated due to subscription expiration'
      });
    }
    
    // Check if all user tokens are blacklisted
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (tokenBlacklist.has(`user_${decoded.id}_all`)) {
        return res.status(401).json({
          success: false,
          error: 'Token has been invalidated due to subscription expiration'
        });
      }
    } catch (error) {
      // Token is invalid, let the next middleware handle it
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Input validation middleware
const validateSignup = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validatePayment = [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.error('Health check - Supabase error:', error);
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'error',
      error: error.message
    });
  }
});

// Debug endpoint to check environment variables (remove in production)
app.get('/api/debug/env', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV,
    resendConfigured: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    timestamp: new Date().toISOString()
  });
});

// Test Resend email endpoint (remove in production)
app.post('/api/debug/test-email', async (req, res) => {
  try {
    if (!resend) {
      return res.status(503).json({
        success: false,
        error: 'Resend not configured'
      });
    }

    const testEmail = req.body.email || 'test@example.com';
    
    logger.info(`Testing email sending to: ${testEmail}`);
    
    // Test with the actual password reset email function
    const emailSent = await sendPasswordResetEmail(testEmail, 'test-token-123');
    
    if (emailSent) {
      logger.info(`Test password reset email sent successfully to: ${testEmail}`);
      res.json({
        success: true,
        message: 'Test password reset email sent successfully',
        email: testEmail
      });
    } else {
      logger.error('Test password reset email failed');
      res.status(500).json({
        success: false,
        error: 'Failed to send test password reset email'
      });
    }
  } catch (error) {
    logger.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Test email failed',
      details: error.message
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Scheduled task to check and update expired subscriptions
async function checkExpiredSubscriptions() {
  try {
    logger.info('🔍 Checking for expired subscriptions...');
    
    // Get all users with premium subscriptions
    const { data: premiumUsers, error } = await supabase
      .from('users')
      .select('id, email, subscription, updatedAt')
      .neq('subscription', 'free');

    if (error) {
      logger.error('Error fetching premium users:', error);
      return;
    }

    if (!premiumUsers || premiumUsers.length === 0) {
      logger.info('✅ No premium users found');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    let expiredCount = 0;

    for (const user of premiumUsers) {
      // For each user, we need to check their token expiry
      // Since we don't store expiry in the database, we'll use a conservative approach
      // and check based on subscription type and last update time
      
      let shouldExpire = false;
      
      // Check based on subscription type and last update
      if (user.subscription === 'trial') {
        // Trial expires in 2 days from last update
        const trialExpiry = new Date(user.updatedAt).getTime() / 1000 + (2 * 24 * 60 * 60);
        shouldExpire = now > trialExpiry;
      } else if (user.subscription === 'monthly') {
        // Monthly expires in 30 days from last update
        const monthlyExpiry = new Date(user.updatedAt).getTime() / 1000 + (30 * 24 * 60 * 60);
        shouldExpire = now > monthlyExpiry;
      } else if (user.subscription === 'annual') {
        // Annual expires in 365 days from last update
        const annualExpiry = new Date(user.updatedAt).getTime() / 1000 + (365 * 24 * 60 * 60);
        shouldExpire = now > annualExpiry;
      }

      if (shouldExpire) {
        // Update user to free plan
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription: 'free',
            isVerified: false,
            updatedAt: new Date().toISOString()
          })
          .eq('id', user.id);

        if (!updateError) {
          expiredCount++;
          logger.info(`📉 User ${user.email} subscription expired and downgraded to free`);
          // Blacklist all tokens for this user
          blacklistUserTokens(user.id);
        } else {
          logger.error(`❌ Failed to downgrade user ${user.email}:`, updateError);
        }
      }
    }

    logger.info(`✅ Subscription check complete. ${expiredCount} users downgraded to free.`);
  } catch (error) {
    logger.error('❌ Error in subscription expiry check:', error);
  }
}

// Run subscription check every hour
setInterval(checkExpiredSubscriptions, 60 * 60 * 1000);

// Also run once on server startup
setTimeout(checkExpiredSubscriptions, 5000); // Run 5 seconds after startup

// Password hashing utilities
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Mock Supabase client (replace with actual Supabase integration)
function generateToken(user, subscription = 'free', expiresIn = '30d') {
  const expires = Math.floor(Date.now() / 1000) + (typeof expiresIn === 'string' && expiresIn.endsWith('d')
    ? parseInt(expiresIn) * 24 * 60 * 60
    : 7 * 24 * 60 * 60
  );
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      plan: subscription,
      verified: user.isVerified,
      expires,
    },
    JWT_SECRET,
    { expiresIn }
  )
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Enhanced middleware to authenticate requests and check subscription expiry
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Check if subscription has expired by checking the database directly
  try {
    // Get the latest user data from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('subscription, isVerified, updatedAt')
      .eq('id', decoded.id)
      .single();

    if (!userError && currentUser) {
      // Update decoded user data with latest from database
      decoded.plan = currentUser.subscription || 'free';
      decoded.verified = currentUser.isVerified || false;
      
      // Check if subscription has actually expired based on database data
      const now = Math.floor(Date.now() / 1000);
      let isExpired = false;
      
      if (currentUser.subscription === 'trial') {
        // Trial expires in 2 days from last update
        const trialExpiry = new Date(currentUser.updatedAt).getTime() / 1000 + (2 * 24 * 60 * 60);
        isExpired = now > trialExpiry;
      } else if (currentUser.subscription === 'monthly') {
        // Monthly expires in 30 days from last update
        const monthlyExpiry = new Date(currentUser.updatedAt).getTime() / 1000 + (30 * 24 * 60 * 60);
        isExpired = now > monthlyExpiry;
      } else if (currentUser.subscription === 'annual') {
        // Annual expires in 365 days from last update
        const annualExpiry = new Date(currentUser.updatedAt).getTime() / 1000 + (365 * 24 * 60 * 60);
        isExpired = now > annualExpiry;
      }
      
      logger.info(`Database expiry check for user ${decoded.email}: now=${now}, subscription=${currentUser.subscription}, isExpired=${isExpired}, isVerified=${currentUser.isVerified}`);
      
      if (isExpired && currentUser.subscription !== 'free') {
        logger.info(`Downgrading expired subscription for user ${decoded.email}`);
        // Subscription has expired, update user to free plan
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            subscription: 'free',
            isVerified: false,
            updatedAt: new Date().toISOString()
          })
          .eq('id', decoded.id)
          .select()
          .single();

        if (!updateError && updatedUser) {
          // Update the decoded user data to reflect the change
          decoded.plan = 'free';
          decoded.verified = false;
          decoded.expires = null;
          // Blacklist all tokens for this user
          blacklistUserTokens(decoded.id);
        }
      }
  }

  req.user = decoded;
  next();
  } catch (error) {
    logger.error('Subscription expiry check error:', error);
    // Continue with original token data if database update fails
    req.user = decoded;
    next();
  }
}

// Signup endpoint with enhanced security
app.post('/api/auth/signup', authLimiter, validateSignup, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password: hashedPassword, 
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      logger.error('Signup error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate token
    const token = generateToken(newUser, 'free');
    
    logger.info(`New user registered: ${email}`);
    
    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan: 'free',
        verified: false,
        expires: jwt.decode(token).expires
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET route for signup endpoint information
app.get('/api/auth/signup', (req, res) => {
  res.json({
    success: false,
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    requiredFields: {
      email: 'string (valid email format)',
      password: 'string (minimum 8 characters)',
      name: 'string (2-50 characters)'
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'user@example.com',
        password: 'password123',
        name: 'John Doe'
      }
    }
  });
});

// Login endpoint with enhanced security
app.post('/api/auth/login', authLimiter, validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Determine the correct expiration time based on subscription type
    let expiresIn = '30d'; // default monthly
    if (user.subscription === 'trial') {
      expiresIn = '2d';
    } else if (user.subscription === 'annual') {
      expiresIn = '365d';
    } else if (user.subscription === 'monthly') {
      expiresIn = '30d';
    }

    const token = generateToken(user, user.subscription || 'free', expiresIn);
    
    logger.info(`User logged in: ${email}`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.subscription || 'free',
        verified: user.isVerified || false,
        expires: jwt.decode(token).expires
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET route for login endpoint information
app.get('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    requiredFields: {
      email: 'string (valid email format)',
      password: 'string (required)'
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'user@example.com',
        password: 'password123'
      }
    }
  });
});

// Google OAuth login endpoint with enhanced security
app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required'
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Validate email domain if needed (optional security measure)
    if (process.env.ALLOWED_EMAIL_DOMAINS) {
      const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS.split(',');
      const userDomain = email.split('@')[1];
      if (!allowedDomains.includes(userDomain)) {
        logger.warn(`Login attempt from unauthorized domain: ${userDomain}`);
        return res.status(403).json({
          success: false,
          error: 'Email domain not authorized'
        });
      }
    }

    // Check if user exists by email or Google ID
    let user = null;
    
    // First, try to find by email
    const { data: existingUserByEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUserByEmail) {
      user = existingUserByEmail;
    } else {
      // Create new user with Google OAuth
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
          email, 
          name, 
          googleId, 
          picture, 
          provider: 'google', 
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        logger.error('Failed to create Google user:', insertError);
        return res.status(500).json({ error: 'Failed to create Google user' });
      }
      user = newUser;
    }

    // Update existing user with Google info if not already set
    if (!user.googleId) {
      user.googleId = googleId;
      user.picture = picture;
      user.provider = user.provider || 'google';
      user.isVerified = true;
    }

    // Determine the correct expiration time based on subscription type
    let expiresIn = '30d'; // default monthly
    if (user.subscription === 'trial') {
      expiresIn = '2d';
    } else if (user.subscription === 'annual') {
      expiresIn = '365d';
    } else if (user.subscription === 'monthly') {
      expiresIn = '30d';
    }

    const token = generateToken(user, user.subscription || 'free', expiresIn);
    
    logger.info(`Google OAuth login successful: ${email}`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        plan: user.subscription || 'free',
        verified: user.isVerified,
        provider: user.provider,
        expires: jwt.decode(token).expires
      }
    });
  } catch (error) {
    logger.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
});

// GET route for Google OAuth endpoint information
app.get('/api/auth/google', (req, res) => {
  res.json({
    success: false,
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    requiredFields: {
      idToken: 'string (Google ID token from client-side authentication)'
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        idToken: 'google_id_token_here'
      }
    },
    note: 'This endpoint requires Google OAuth client-side authentication to obtain the ID token'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Download endpoint for desktop app
app.get('/api/download/:platform', (req, res) => {
  const { platform } = req.params;
  const { direct } = req.query; // Check if direct download is requested
  
  // Configuration for different download methods
  const downloadConfig = {
    windows: {
      filename: 'HireOn-Setup.exe',
      contentType: 'application/vnd.microsoft.portable-executable',
      githubUrl: 'https://github.com/nikhil-mangla/HireON/releases/download/v1.0.0/HireOn-Setup.exe',
      localPath: './downloads/HireOn-Setup.exe' // When you have the file locally
    },
    mac: {
      filename: 'HireOn-1.0.0-arm64.dmg',
      contentType: 'application/x-apple-diskimage',
      githubUrl: 'https://github.com/nikhil-mangla/HireON/releases/download/v1.0.0/HireOn-1.0.0-arm64.dmg',
      localPath: './downloads/HireOn-1.0.0-arm64.dmg' // Updated to match your actual file
    }
  };

  if (!downloadConfig[platform]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid platform. Supported platforms: windows, mac'
    });
  }

  const config = downloadConfig[platform];

  // Log download attempt
  logger.info(`Download requested for platform: ${platform}, direct: ${direct}`);

  // If direct download is requested, try to serve the file directly
  if (direct === 'true') {
    const fs = require('fs');
    const path = require('path');
    const https = require('https');
    
    // Check if local file exists first
    if (fs.existsSync(config.localPath)) {
      // Serve file directly with proper headers
      res.setHeader('Content-Disposition', `attachment; filename="${config.filename}"`);
      res.setHeader('Content-Type', config.contentType);
      res.setHeader('Cache-Control', 'no-cache');
      
      const fileStream = fs.createReadStream(config.localPath);
      fileStream.pipe(res);
      
      logger.info(`Direct download served for ${platform}: ${config.filename}`);
      return;
    } else {
      // Local file doesn't exist, try to stream from GitHub
      logger.info(`Local file not found, attempting to stream from GitHub for ${platform}`);
      
      // Set proper headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${config.filename}"`);
      res.setHeader('Content-Type', config.contentType);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Stream the file from GitHub
      https.get(config.githubUrl, (fileRes) => {
        if (fileRes.statusCode === 200) {
          // Successfully streaming from GitHub
          fileRes.pipe(res);
          logger.info(`Streaming download from GitHub for ${platform}: ${config.filename}`);
        } else {
          // GitHub file not found, provide helpful error
          logger.error(`GitHub file not found for ${platform}: ${fileRes.statusCode}`);
          res.status(404).json({
            success: false,
            error: 'File not available for download',
            message: 'The desktop app file is not yet available for download.',
            instructions: [
              '1. Create a GitHub release with the file',
              '2. Or upload the file to the server',
              '3. For now, please use the web version at https://hireon-rho.vercel.app'
            ],
            note: 'Contact us for early access to the desktop app.'
          });
        }
      }).on('error', (err) => {
        logger.error(`Error streaming from GitHub for ${platform}:`, err);
        res.status(500).json({
          success: false,
          error: 'Download failed',
          message: 'Failed to download the file. Please try again later.',
          note: 'Contact us for early access to the desktop app.'
        });
      });
      return;
    }
  }

  // For now, redirect to download page with instructions
  // This prevents the GitHub 404 error during development
  const downloadPageUrl = `https://hireon-rho.vercel.app/download?platform=${platform}&direct=true`;
  res.redirect(downloadPageUrl);
});

// Get download URLs endpoint
app.get('/api/download-urls', (req, res) => {
  const downloadUrls = {
    windows: {
      url: 'https://hireon-rho.vercel.app/download?platform=windows',
      filename: 'HireOn-Setup.exe',
      size: 'Coming Soon',
      version: 'Coming Soon',
      status: 'preparing'
    },
    mac: {
      url: 'https://hireon-rho.vercel.app/download?platform=mac',
      filename: 'HireOn-1.0.0-arm64.dmg',
      size: '186 MB',
      version: '1.0.0',
      status: 'available'
    }
  };

  res.json({
    success: true,
    downloads: downloadUrls,
    message: 'Download information retrieved successfully. Mac version is now available!',
    note: 'The Mac version (1.0.0) is ready for download. Windows version coming soon.'
  });
});

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    message: 'HireOn Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        google: 'POST /api/auth/google',
        validateToken: 'POST /api/auth/validate-token',
        checkSubscription: 'POST /api/auth/check-subscription',
        trialEligibility: 'GET /api/auth/trial-eligibility',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password'
      },
      user: {
        profile: 'GET /api/user/profile',
        updateProfile: 'PUT /api/user/profile',
        subscriptionStatus: 'GET /api/user/subscription-status'
      },
      payment: {
        createOrder: 'POST /api/razorpay/create-order',
        verifyPayment: 'POST /api/razorpay/verify-payment',
        webhook: 'POST /api/razorpay/webhook'
      },
      download: {
        windows: 'GET /api/download/windows',
        mac: 'GET /api/download/mac',
        urls: 'GET /api/download-urls'
      },
      system: {
        health: 'GET /api/health'
      }
    },
    documentation: 'All endpoints return JSON responses. Authentication endpoints require POST requests with appropriate data. Download endpoints redirect to GitHub releases.'
  });
});



// Get user profile endpoint
app.get('/api/user/profile', checkTokenBlacklist, authenticateToken, async (req, res) => {
  logger.info('GET /api/user/profile called, user:', req.user);
  try {
    // Use email instead of id for lookup
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', req.user.email)
      .single();
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if subscription has expired and update if needed
    const now = Math.floor(Date.now() / 1000);
    let subscriptionStatus = user.subscription || 'free';
    let isVerified = user.isVerified || false;
    let expires = null;
    let isExpired = false;

    // Calculate expiry based on database data
    if (subscriptionStatus === 'trial') {
      // Trial expires in 2 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (2 * 24 * 60 * 60);
      isExpired = now > expires;
    } else if (subscriptionStatus === 'monthly') {
      // Monthly expires in 30 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (30 * 24 * 60 * 60);
      isExpired = now > expires;
    } else if (subscriptionStatus === 'annual') {
      // Annual expires in 365 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (365 * 24 * 60 * 60);
      isExpired = now > expires;
    }

    // If subscription has expired, update to free
    if (isExpired && subscriptionStatus !== 'free') {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          subscription: 'free',
          isVerified: false,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (!updateError && updatedUser) {
        subscriptionStatus = 'free';
        isVerified = false;
        expires = null;
        // Blacklist all tokens for this user
        blacklistUserTokens(user.id);
      }
    }

    logger.info(`Profile fetch for user ${user.email}: status=${subscriptionStatus}, isExpired=${isExpired}, expires=${expires ? new Date(expires * 1000).toISOString() : 'null'}`);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: subscriptionStatus,
      verified: isVerified,
      expires: expires,
      jobRole: user.profile?.jobRole || '',
      company: user.profile?.company || '',
      resume: user.resumeUrl || '',
      profile: user.profile || {},
      resumeUrl: user.resumeUrl || '',
      createdAt: user.createdAt
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user profile endpoint
app.put('/api/user/profile', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobRole, company, experience } = req.body;
    let resumeUrl = null;
    let resumeText = '';

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Parse resume text
      try {
        const pdfData = await pdfParse(fileBuffer);
        resumeText = pdfData.text;
      } catch (err) {
        logger.error('Resume parsing error:', err);
      }

      // Mock file upload (replace with actual Supabase storage)
      resumeUrl = `https://example.com/resumes/${userId}/${req.file.originalname}`;
      fs.unlinkSync(req.file.path);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        profile: {
          jobRole,
          company,
          experience,
          resumeText,
          updatedAt: new Date().toISOString()
        },
        resumeUrl: resumeUrl || user.resumeUrl,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        subscription: updatedUser.subscription,
        isVerified: updatedUser.isVerified,
        profile: updatedUser.profile,
        resumeUrl: updatedUser.resumeUrl
      }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create Razorpay Order with enhanced security
app.post('/api/razorpay/create-order', authenticateToken, generalLimiter, async (req, res) => {
  try {
    const { amount, currency = 'INR', plan = 'premium' } = req.body;

    // Validate amount
    if (!amount || amount <= 0 || amount > 100000) { // Max 1 lakh INR
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be between 1 and 100000 INR.'
      });
    }

    // Validate currency
    const allowedCurrencies = ['INR', 'USD', 'EUR'];
    if (!allowedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency. Only INR, USD, EUR are supported.'
      });
    }

    // Validate plan
    const allowedPlans = ['trial', 'monthly', 'annual', 'premium'];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Only trial, monthly, annual, premium are supported.'
      });
    }

    // Shorten receipt to < 40 chars (timestamp + 6 random chars)
    const shortReceipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: shortReceipt,
      notes: {
        plan,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    logger.info(`Order created for user ${req.user.email}: ${order.id}`);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    logger.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Verify Razorpay Payment with enhanced security
app.post('/api/razorpay/verify-payment', authenticateToken, validatePayment, handleValidationErrors, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = 'premium' } = req.body;

    // Validate plan
    const allowedPlans = ['trial', 'monthly', 'annual', 'premium'];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Only trial, monthly, annual, premium are supported.'
      });
    }

    // Allow mock payments for testing (only in development)
    const isMockPayment = process.env.NODE_ENV !== 'production' && (
      razorpay_payment_id.includes('mock_payment') ||
      razorpay_signature.includes('mock_signature')
    );

    if (!isMockPayment) {
      // Real payment: verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        logger.warn(`Invalid payment signature for order: ${razorpay_order_id}`);
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature'
        });
      }
    }

    // Update user subscription
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const subscriptionPlan = plan || 'premium';
    let expiresIn = '30d'; // default monthly
    
    // Check if user is trying to get a trial and has already used one
    if (subscriptionPlan === 'trial') {
      expiresIn = '2d';
    } else if (subscriptionPlan === 'annual') {
      expiresIn = '365d';
    } else if (subscriptionPlan === 'monthly') {
      expiresIn = '30d';
    }

    // Prepare update data
    const updateData = {
        subscription: subscriptionPlan,
        isVerified: true,
        updatedAt: new Date().toISOString()
    };

    // Track trial usage
    if (subscriptionPlan === 'trial') {
      updateData.hasUsedTrial = true;
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update user subscription:', updateError);
      return res.status(500).json({ error: 'Failed to update user subscription' });
    }

    // Generate new token with updated subscription
    const token = generateToken(updatedUser, subscriptionPlan, expiresIn);

    logger.info(`Payment verified for user ${req.user.email}: ${subscriptionPlan} plan`);
    logger.info(`Updated user data:`, updatedUser);
    logger.info(`Generated token expires:`, jwt.decode(token).expires);

    res.json({
      success: true,
      userId: updatedUser.id,
      plan: subscriptionPlan,
      verifiedAt: new Date().toISOString(),
      paymentId: razorpay_payment_id,
      token,
      expires: jwt.decode(token).expires
    });
  } catch (error) {
    logger.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

app.get('/api/gemini-key', (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(404).json({ error: 'Gemini API key not configured' });
  }
  res.json({ key: process.env.GEMINI_API_KEY });
});

// Razorpay Webhook Handler
app.post('/api/razorpay/webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    if (!webhookSecret) {
      logger.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      logger.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(webhookBody.toString());
    logger.info('Webhook event received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        logger.info('Payment captured:', event.payload.payment.entity);
        // Handle successful payment
        break;
      case 'payment.failed':
        logger.info('Payment failed:', event.payload.payment.entity);
        // Handle failed payment
        break;
      case 'order.paid':
        logger.info('Order paid:', event.payload.order.entity);
        // Handle order completion
        break;
      default:
        logger.info('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Token validation endpoint (for desktop app)
app.post('/api/auth/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        isVerified: user.isVerified
      },
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        subscription: decoded.plan
      }
    });
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check and refresh subscription status
app.post('/api/auth/check-subscription', checkTokenBlacklist, authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const now = Math.floor(Date.now() / 1000);
    let subscriptionStatus = user.subscription || 'free';
    let isVerified = user.isVerified || false;
    let expires = null;
    let isExpired = false;

    // Calculate expiry based on database data
    if (subscriptionStatus === 'trial') {
      // Trial expires in 2 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (2 * 24 * 60 * 60);
      isExpired = now > expires;
    } else if (subscriptionStatus === 'monthly') {
      // Monthly expires in 30 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (30 * 24 * 60 * 60);
      isExpired = now > expires;
    } else if (subscriptionStatus === 'annual') {
      // Annual expires in 365 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (365 * 24 * 60 * 60);
      isExpired = now > expires;
    }

    logger.info(`Expiry calculation for user ${user.email}:`, {
      subscription: subscriptionStatus,
      updatedAt: user.updatedAt,
      updatedAtTimestamp: new Date(user.updatedAt).getTime() / 1000,
      now: now,
      calculatedExpires: expires,
      calculatedExpiresISO: expires ? new Date(expires * 1000).toISOString() : 'null',
      isExpired: isExpired,
      difference: expires ? expires - now : null,
      differenceHours: expires ? Math.floor((expires - now) / 3600) : null
    });

    // If subscription has expired, update to free
    if (isExpired && subscriptionStatus !== 'free') {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          subscription: 'free',
          isVerified: false,
          updatedAt: new Date().toISOString()
        })
        .eq('id', req.user.id)
        .select()
        .single();

      if (!updateError && updatedUser) {
        subscriptionStatus = 'free';
        isVerified = false;
        expires = null;
        // Blacklist all tokens for this user
        blacklistUserTokens(req.user.id);
      }
    }

    // Determine the correct expiration time based on subscription type
    let expiresIn = '30d'; // default monthly
    if (subscriptionStatus === 'trial') {
      expiresIn = '2d';
    } else if (subscriptionStatus === 'annual') {
      expiresIn = '365d';
    } else if (subscriptionStatus === 'monthly') {
      expiresIn = '30d';
    } else if (subscriptionStatus === 'free') {
      expiresIn = '30d';
    }

    // Generate new token with current subscription status
    const newToken = generateToken(
      { ...user, subscription: subscriptionStatus, isVerified },
      subscriptionStatus,
      expiresIn
    );

    logger.info(`Subscription check for user ${user.email}: status=${subscriptionStatus}, isExpired=${isExpired}, expires=${expires ? new Date(expires * 1000).toISOString() : 'null'}`);

    res.json({
      success: true,
      subscription: subscriptionStatus,
      isVerified,
      expires,
      isExpired,
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: subscriptionStatus,
        verified: isVerified,
        expires: expires
      }
    });
  } catch (error) {
    logger.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check trial eligibility
app.get('/api/auth/trial-eligibility', checkTokenBlacklist, authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription, hasUsedTrial')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isEligible = !user.hasUsedTrial;
    const currentPlan = user.subscription || 'free';

    res.json({
      success: true,
      isEligible,
      hasUsedTrial: user.hasUsedTrial || false,
      currentPlan,
      message: isEligible 
        ? 'You are eligible for a trial subscription' 
        : 'You have already used your trial. Please choose a different plan.'
    });
  } catch (error) {
    logger.error('Trial eligibility check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    logger.info(`Processing password reset request for: ${email}`);

    // Check if user exists with better error handling
    let user;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

      if (error) {
        logger.error('Supabase error checking user:', error);
        // Don't expose whether user exists or not for security
        return res.status(200).json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
      }

      if (!data) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        // Don't expose whether user exists or not for security
        return res.status(200).json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
      }

      user = data;
    } catch (dbError) {
      logger.error('Database connection error:', dbError);
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database with better error handling
    let tokenStored = false;
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          resettoken: resetToken,
          resettokenexpiry: resetTokenExpiry.toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Error storing reset token in database:', updateError);
        // Fall back to in-memory storage
        passwordResetTokens.set(resetToken, {
          email: user.email,
          userId: user.id,
          expires: resetTokenExpiry.getTime()
        });
        tokenStored = true;
        logger.info(`Reset token stored in memory for ${email}: ${resetToken} (expires: ${resetTokenExpiry.toISOString()})`);
      } else {
        tokenStored = true;
        logger.info(`Reset token stored in database for ${email}: ${resetToken} (expires: ${resetTokenExpiry.toISOString()})`);
      }
    } catch (updateError) {
      logger.error('Database update error, using fallback storage:', updateError);
      // Fall back to in-memory storage
      passwordResetTokens.set(resetToken, {
        email: user.email,
        userId: user.id,
        expires: resetTokenExpiry.getTime()
      });
      tokenStored = true;
      logger.info(`Reset token stored in memory for ${email}: ${resetToken} (expires: ${resetTokenExpiry.toISOString()})`);
    }

    if (!tokenStored) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process password reset request'
      });
    }

    // Send password reset email
    try {
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailSent) {
        logger.warn(`Failed to send password reset email to: ${email}`);
        
        // For development/testing, log the reset token
        if (process.env.NODE_ENV !== 'production') {
          logger.info(`DEVELOPMENT MODE: Password reset token for ${email}: ${resetToken}`);
          logger.info(`DEVELOPMENT MODE: Reset URL: ${process.env.FRONTEND_URL || 'https://hireon-rho.vercel.app'}/reset-password?token=${resetToken}`);
          
          return res.status(200).json({
            success: true,
            message: 'Password reset token generated (development mode)',
            resetToken: resetToken,
            resetUrl: `${process.env.FRONTEND_URL || 'https://hireon-rho.vercel.app'}/reset-password?token=${resetToken}`
          });
        }
        
        // Check if email service is configured
        if (!resend) {
          logger.warn(`Email service not configured. Token generated but email not sent to: ${email}`);
          return res.status(503).json({
            success: false,
            error: 'Password reset email service is not configured. Please contact support.'
          });
        }
        
        return res.status(503).json({
          success: false,
          error: 'Password reset email system is temporarily unavailable. Please try again later.'
        });
      }

      logger.info(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      logger.error('Email sending error:', emailError);
      
      // For development/testing, log the reset token
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`DEVELOPMENT MODE: Password reset token for ${email}: ${resetToken}`);
        logger.info(`DEVELOPMENT MODE: Reset URL: ${process.env.FRONTEND_URL || 'https://hireon-rho.vercel.app'}/reset-password?token=${resetToken}`);
        
        return res.status(200).json({
          success: true,
          message: 'Password reset token generated (development mode)',
          resetToken: resetToken,
          resetUrl: `${process.env.FRONTEND_URL || 'https://hireon-rho.vercel.app'}/reset-password?token=${resetToken}`
        });
      }
      
      // Check if email service is configured
      if (!resend) {
        logger.warn(`Email service not configured. Token generated but email not sent to: ${email}`);
        return res.status(503).json({
          success: false,
          error: 'Password reset email service is not configured. Please contact support.'
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'Password reset email system is temporarily unavailable. Please try again later.'
      });
    }
    
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Find user with this reset token (check both database and in-memory)
    let user = null;
    let tokenData = null;
    
    // First check in-memory storage
    if (passwordResetTokens.has(token)) {
      tokenData = passwordResetTokens.get(token);
      if (tokenData.expires < Date.now()) {
        passwordResetTokens.delete(token);
        return res.status(400).json({
          success: false,
          error: 'Reset token has expired'
        });
      }
      
      // Get user from database using the stored user ID
      try {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', tokenData.userId)
          .single();
          
        if (!error && dbUser) {
          user = dbUser;
        }
      } catch (dbError) {
        logger.error('Error fetching user for in-memory token:', dbError);
      }
    }
    
    // If not found in memory, check database
    if (!user) {
      try {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('id, email, resettoken, resettokenexpiry')
          .eq('resettoken', token)
          .single();

        if (error || !dbUser) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired reset token'
          });
        }

        // Check if token is expired
        if (new Date() > new Date(dbUser.resettokenexpiry)) {
          return res.status(400).json({
            success: false,
            error: 'Reset token has expired'
          });
        }
        
        user = dbUser;
      } catch (dbError) {
        logger.error('Database error checking reset token:', dbError);
        return res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again later.'
        });
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    let passwordUpdated = false;
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          resettoken: null,
          resettokenexpiry: null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Error updating password in database:', updateError);
        // Continue with in-memory cleanup
      } else {
        passwordUpdated = true;
      }
    } catch (dbError) {
      logger.error('Database error updating password:', dbError);
      // Continue with in-memory cleanup
    }

    // Clear the token from in-memory storage if it exists
    if (passwordResetTokens.has(token)) {
      passwordResetTokens.delete(token);
      logger.info(`Cleared in-memory reset token: ${token}`);
    }

    if (!passwordUpdated) {
      logger.warn(`Password reset completed but database update failed for user: ${user.email}`);
      // Still return success since the token was cleared and password was processed
    }

    // Blacklist all existing tokens for this user
    blacklistUserTokens(user.id);

    logger.info(`Password reset successful for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET route for forgot password endpoint information
app.get('/api/auth/forgot-password', (req, res) => {
  res.json({
    success: false,
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    requiredFields: {
      email: 'string (valid email format)'
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'user@example.com'
      }
    }
  });
});

// GET route for reset password endpoint information
app.get('/api/auth/reset-password', (req, res) => {
  res.json({
    success: false,
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests',
    requiredFields: {
      token: 'string (reset token from email)',
      newPassword: 'string (minimum 8 characters)'
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        token: 'reset_token_from_email',
        newPassword: 'new_password_123'
      }
    }
  });
});

// Get subscription status endpoint
app.get('/api/user/subscription-status', checkTokenBlacklist, authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const now = Math.floor(Date.now() / 1000);
    let subscriptionStatus = user.subscription || 'free';
    let isVerified = user.isVerified || false;
    let expires = null;
    let isExpired = false;

    // Calculate expiry based on database data
    if (subscriptionStatus === 'trial') {
      // Trial expires in 2 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (2 * 24 * 60 * 60);
      isExpired = now > expires;
    } else if (subscriptionStatus === 'monthly') {
      // Monthly expires in 30 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (30 * 24 * 60 * 60);
      isExpired = now > expires;
    } else if (subscriptionStatus === 'annual') {
      // Annual expires in 365 days from last update
      expires = new Date(user.updatedAt).getTime() / 1000 + (365 * 24 * 60 * 60);
      isExpired = now > expires;
    }

    // If subscription has expired, update to free
    if (isExpired && subscriptionStatus !== 'free') {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          subscription: 'free',
          isVerified: false,
          updatedAt: new Date().toISOString()
        })
        .eq('id', req.user.id)
        .select()
        .single();

      if (!updateError && updatedUser) {
        subscriptionStatus = 'free';
        isVerified = false;
        expires = null;
        // Blacklist all tokens for this user
        blacklistUserTokens(req.user.id);
      }
    }

    // Calculate time remaining
    let timeRemaining = null;
    if (expires) {
      const difference = expires - now;
      if (difference > 0) {
        const days = Math.floor(difference / (24 * 60 * 60));
        const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((difference % (60 * 60)) / 60);
        
        if (days > 0) {
          timeRemaining = `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (hours > 0) {
          timeRemaining = `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
          timeRemaining = `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
      } else {
        timeRemaining = 'Expired';
      }
    }

    logger.info(`Subscription status for user ${user.email}: status=${subscriptionStatus}, isExpired=${isExpired}, expires=${expires ? new Date(expires * 1000).toISOString() : 'null'}, timeRemaining=${timeRemaining}`);

    res.json({
      success: true,
      subscription: subscriptionStatus,
      isVerified,
      expires,
      isExpired,
      timeRemaining,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: subscriptionStatus,
        verified: isVerified,
        expires: expires
      },
      message: isExpired 
        ? 'Your subscription has expired. Please renew to continue accessing premium features.'
        : `Your ${subscriptionStatus} subscription is active.`
    });
  } catch (error) {
    logger.error('Subscription status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Manual trigger for subscription expiry check (admin endpoint)
app.post('/api/admin/check-all-subscriptions', async (req, res) => {
  try {
    // Simple admin check - you can enhance this with proper admin authentication
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Trigger the subscription check
    await checkExpiredSubscriptions();
    
    res.json({
      success: true,
      message: 'Subscription expiry check completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Manual subscription check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Legacy payment verification endpoint (for backward compatibility)
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { paymentId, plan, userId, email } = req.body;
    logger.info('Payment verification request:', { paymentId, plan, userId, email });
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    // Mock payment validation for testing
    const isPaymentValid = paymentId &&
      paymentId.length >= 8 &&
      (paymentId.includes('mock') ||
        paymentId.includes('test') ||
        paymentId.includes('payment') ||
        /^[a-zA-Z0-9_-]+$/.test(paymentId));

    if (isPaymentValid) {
      let user = null;

      if (userId) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        user = existingUser;
      } else if (email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        user = existingUser;
      }

      if (user) {
        const subscriptionPlan = plan || 'premium';
        let expiresIn = '30d'; // default monthly
        
        // Check if user is trying to get a trial
        if (subscriptionPlan === 'trial') {
          // Check if user has already used trial
          if (user.hasUsedTrial) {
            return res.status(400).json({
              success: false,
              error: 'Trial can only be used once per user. Please choose a different plan.'
            });
          }
          expiresIn = '2d';
        } else if (subscriptionPlan === 'annual') {
          expiresIn = '365d';
        } else if (subscriptionPlan === 'monthly') {
          expiresIn = '30d';
        }

        // Prepare update data
        const updateData = {
          subscription: subscriptionPlan,
          isVerified: true,
          updatedAt: new Date().toISOString()
        };

        // Track trial usage
        if (subscriptionPlan === 'trial') {
          updateData.hasUsedTrial = true;
        }

        // Update user in database
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to update user subscription:', updateError);
          return res.status(500).json({ error: 'Failed to update user subscription' });
        }

        const token = generateToken(updatedUser, subscriptionPlan, expiresIn);

        return res.json({
          success: true,
          userId: user.id,
          plan: subscriptionPlan,
          verifiedAt: new Date().toISOString(),
          paymentId: paymentId, // Use req.body.paymentId
          token,
          expires: jwt.decode(token).expires
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment ID format'
      });
    }
  } catch (error) {
    logger.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Existing endpoints (session, listening-feedback, etc.)
app.post('/api/session', upload.single('resume'), async (req, res) => {
  const { jobTitle, company } = req.body;
  const resumePath = req.file ? req.file.path : null;
  let resumeText = '';

  if (resumePath) {
    try {
      const dataBuffer = fs.readFileSync(resumePath);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
      fs.unlinkSync(resumePath);
    } catch (err) {
      logger.error('Failed to parse PDF:', err);
      return res.status(500).json({ error: 'Failed to parse PDF' });
    }
  }

  res.json({
    success: true,
    jobTitle,
    company,
    resumeText: resumeText.slice(0, 1000)
  });
});

// app.post('/api/listening-feedback', express.json(), async (req, res) => {
//   const { transcript, resumeText, jobTitle, company } = req.body;
//   const apiKey = req.query.apiKey || req.headers['x-api-key'] || '';

//   const prompt = `
// You are an expert technical interview coach. The following is a transcript of a candidate's spoken answer to an interview question.

// Candidate's answer:
// "${transcript}"

// Candidate's resume (summary):
// "${resumeText}"

// Job Title: ${jobTitle}
// Company: ${company}

// Please provide:
// - A professional, concise, and technically deep evaluation of the answer.
// - Feedback on strengths and weaknesses.
// - Suggestions for improvement, if any.
// - Tailor your feedback to the job title and company context.
// - Be confident, memorable, and include real-world relevance or a touch of personal insight.

// Respond as if you are the interviewer giving feedback to help the candidate succeed.
// `;

//   try {
//     const response = await axios.post(
//       'https://api.anthropic.com/v1/messages',
//       {
//         model: 'claude-3-haiku-20240307',
//         max_tokens: 500,
//         messages: [{ role: 'user', content: prompt }]
//       },
//       {
//         headers: {
//           'x-api-key': apiKey,
//           'anthropic-version': '2023-06-01',
//           'content-type': 'application/json'
//         }
//       }
//     );
//     res.json({ success: true, feedback: response.data });
//   } catch (err) {
//     res.status(400).json({ success: false, error: err.message, details: err.response?.data });
  // }
// });

// Deep Link Generation for Electron App
app.post('/api/generate-deep-link', authenticateToken, async (req, res) => {
  try {
    const { userId, email, name, subscription, expires } = req.user;
    
    // Create a secure token for the Electron app
    const electronToken = jwt.sign(
      {
        userId,
        email,
        name,
        subscription,
        expires,
        type: 'electron_auth',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Deep link token expires in 1 hour
    );

    // Generate multiple deep link URLs for different scenarios
    const deepLinkUrl = `hireon://auth?token=${electronToken}&user=${encodeURIComponent(email)}&expires=${expires}`;
    const fallbackDeepLink = `learncodeapp://auth?token=${electronToken}&user=${encodeURIComponent(email)}&expires=${expires}`;
    const webFallbackUrl = `${process.env.FRONTEND_URL || 'https://hire-on-nikhil-manglas-projects.vercel.app'}/auth?token=${electronToken}&user=${encodeURIComponent(email)}&expires=${expires}`;
    
    // Also generate a fallback URL for manual copy
    const fallbackData = {
      token: electronToken,
      user: email,
      name,
      subscription,
      expires,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      deepLink: deepLinkUrl,
      fallbackDeepLink: fallbackDeepLink,
      webFallbackUrl: webFallbackUrl,
      token: electronToken,
      fallbackData,
      message: 'Deep link generated successfully'
    });
  } catch (error) {
    logger.error('Deep link generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate deep link'
    });
  }
});

// Validate Electron Token (for Electron app to verify the token)
app.post('/api/validate-electron-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Verify the electron token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if it's an electron auth token
    if (decoded.type !== 'electron_auth') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Check if the original subscription token is still valid
    const now = Math.floor(Date.now() / 1000);
    if (decoded.expires && now > decoded.expires) {
      return res.status(401).json({
        success: false,
        error: 'Subscription has expired',
        expired: true
      });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        subscription: decoded.subscription,
        expires: decoded.expires
      }
    });
  } catch (error) {
    logger.error('Electron token validation error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Deep link token has expired',
        expired: true
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        invalid: true
      });
    }

    res.status(500).json({
      success: false,
      error: 'Token validation failed'
    });
  }
});

// Generate Token File for Manual Import (alternative to deep link)
app.post('/api/generate-token-file', authenticateToken, async (req, res) => {
  try {
    const { userId, email, name, subscription, expires } = req.user;
    
    const tokenData = {
      version: '1.0',
      type: 'hireon_auth_token',
      user: {
        id: userId,
        email,
        name,
        subscription,
        expires
      },
      token: jwt.sign(
        {
          userId,
          email,
          name,
          subscription,
          expires,
          type: 'electron_auth',
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      ),
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      instructions: 'Import this file in your HireOn desktop app to authenticate'
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="hireon-auth-token.json"');
    
    res.json(tokenData);
  } catch (error) {
    logger.error('Token file generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate token file'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check user state (remove in production)
app.get('/api/debug/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = Math.floor(Date.now() / 1000);
    let expires = null;
    
    if (user.subscription === 'trial') {
      expires = new Date(user.updatedAt).getTime() / 1000 + (2 * 24 * 60 * 60);
    } else if (user.subscription === 'monthly') {
      expires = new Date(user.updatedAt).getTime() / 1000 + (30 * 24 * 60 * 60);
    } else if (user.subscription === 'annual') {
      expires = new Date(user.updatedAt).getTime() / 1000 + (365 * 24 * 60 * 60);
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        isVerified: user.isVerified,
        hasUsedTrial: user.hasUsedTrial,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
      },
      calculation: {
        now: now,
        nowISO: new Date(now * 1000).toISOString(),
        updatedAtTimestamp: new Date(user.updatedAt).getTime() / 1000,
        calculatedExpires: expires,
        calculatedExpiresISO: expires ? new Date(expires * 1000).toISOString() : 'null',
        difference: expires ? expires - now : null,
        differenceHours: expires ? Math.floor((expires - now) / 3600) : null,
        differenceDays: expires ? Math.floor((expires - now) / (24 * 3600)) : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Database schema check endpoint
app.get('/api/debug/schema', async (req, res) => {
  try {
    // Check if hasUsedTrial column exists by trying to select it
    const { data: testUser, error } = await supabase
      .from('users')
      .select('hasUsedTrial')
      .limit(1);
    
    if (error) {
      return res.json({
        hasUsedTrialColumn: false,
        error: error.message,
        message: 'hasUsedTrial column does not exist in the users table. Please add it manually.'
      });
    }
    
    res.json({
      hasUsedTrialColumn: true,
      message: 'hasUsedTrial column exists and is accessible',
      sampleData: testUser
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
 

  // Print all registered routes for debugging
  if (app._router && app._router.stack) {
    app._router.stack.forEach(function(r){
      if (r.route && r.route.path){
        logger.info('Registered route:', r.route.path);
      }
    });
  }
});

