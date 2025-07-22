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

const upload = multer({ dest: 'uploads/' });
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5180'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing JSON (except for webhook endpoint)
app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret',
});

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  );
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// Signup endpoint (now uses Supabase)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, password, name }])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate token, etc. (use newUser.id, newUser.email, etc.)
    const token = generateToken(newUser, 'free');
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
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Login endpoint (now uses Supabase)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user, user.subscription || 'free');
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Google OAuth login endpoint
app.post('/api/auth/google', async (req, res) => {
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
        .insert([{ email, name, googleId, picture, provider: 'google', isVerified: true }])
        .select()
        .single();

      if (insertError) {
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

    const token = generateToken(user, user.subscription || 'free');
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
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
});

// Get user profile endpoint
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  console.log('GET /api/user/profile called, user:', req.user);
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
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.subscription, // <-- ensure this is present and correct
      verified: user.isVerified,
      expires: req.user.expires,
      jobRole: user.profile?.jobRole || '',
      company: user.profile?.company || '',
      resume: user.resumeUrl || '',
      profile: user.profile || {},
      resumeUrl: user.resumeUrl || '',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
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
        console.error('Resume parsing error:', err);
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
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create Razorpay Order
app.post('/api/razorpay/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', plan = 'premium' } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan,
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

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
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Verify Razorpay Payment
app.post('/api/razorpay/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = 'premium' } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment parameters'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
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
    
    if (subscriptionPlan === 'annual') {
      expiresIn = '365d';
    } else if (subscriptionPlan === 'trial') {
      expiresIn = '7d';
    } else if (subscriptionPlan === 'monthly') {
      expiresIn = '30d';
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription: subscriptionPlan,
        isVerified: true,
        paymentHistory: [...(user.paymentHistory || []), {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          plan: subscriptionPlan,
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (subscriptionPlan === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
        }],
        updatedAt: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user subscription:', updateError);
      return res.status(500).json({ error: 'Failed to update user subscription' });
    }

    // Generate new token with updated subscription
    const token = generateToken(updatedUser, subscriptionPlan, expiresIn);

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
    console.error('Payment verification error:', error);
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
      console.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(webhookBody.toString());
    console.log('Webhook event received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment.entity);
        // Handle successful payment
        break;
      case 'payment.failed':
        console.log('Payment failed:', event.payload.payment.entity);
        // Handle failed payment
        break;
      case 'order.paid':
        console.log('Order paid:', event.payload.order.entity);
        // Handle order completion
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
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
    console.error('Token validation error:', error);
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
        
        if (subscriptionPlan === 'annual') {
          expiresIn = '365d';
        } else if (subscriptionPlan === 'trial') {
          expiresIn = '7d';
        } else if (subscriptionPlan === 'monthly') {
          expiresIn = '30d';
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            subscription: subscriptionPlan,
            isVerified: true,
            paymentHistory: user.paymentHistory || [],
            paymentHistory: [...user.paymentHistory, {
              paymentId,
              plan: subscriptionPlan,
              verifiedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + (
                subscriptionPlan === 'annual' ? 365 : 
                subscriptionPlan === 'trial' ? 7 : 30
              ) * 24 * 60 * 60 * 1000).toISOString()
            }],
            updatedAt: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          return res.status(500).json({ error: 'Failed to update user subscription' });
        }

        const token = generateToken(updatedUser, subscriptionPlan, expiresIn);

        return res.json({
          success: true,
          userId: updatedUser.id,
          plan: subscriptionPlan,
          verifiedAt: new Date().toISOString(),
          paymentId,
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
    console.error('Payment verification error:', error);
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

    // Generate the deep link URL
    const deepLinkUrl = `learncodeapp://auth?token=${electronToken}&user=${encodeURIComponent(email)}&expires=${expires}`;
    
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
      token: electronToken,
      fallbackData,
      message: 'Deep link generated successfully'
    });
  } catch (error) {
    console.error('Deep link generation error:', error);
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
    console.error('Electron token validation error:', error);
    
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
    console.error('Token file generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate token file'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HireOn Backend Server running on port ${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /api/auth/signup - User registration');
  console.log('  POST /api/auth/login - User login');
  console.log('  POST /api/auth/google - Google OAuth login');
  console.log('  GET  /api/user/profile - Get user profile (requires auth)');
  console.log('  PUT  /api/user/profile - Update user profile (requires auth)');
  console.log('  POST /api/razorpay/create-order - Create Razorpay order (requires auth)');
  console.log('  POST /api/razorpay/verify-payment - Verify Razorpay payment (requires auth)');
  console.log('  POST /api/razorpay/webhook - Razorpay webhook handler');
  console.log('  POST /api/verify-payment - Legacy payment verification');
  console.log('  POST /api/auth/validate-token - Validate JWT token');
  console.log('  POST /api/generate-deep-link - Generate deep link for Electron app (requires auth)');
  console.log('  POST /api/validate-electron-token - Validate Electron app token');
  console.log('  POST /api/generate-token-file - Generate token file for manual import (requires auth)');
  console.log('  GET  /api/health - Health check');
  console.log('');
  console.log('🔧 Environment:');
  console.log(`  - JWT Secret: ${JWT_SECRET ? 'Configured' : 'Not configured'}`);
  console.log(`  - Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured'}`);
  console.log(`  - Razorpay Webhook Secret: ${process.env.RAZORPAY_WEBHOOK_SECRET ? 'Configured' : 'Not configured'}`);

  // Print all registered routes for debugging
  if (app._router && app._router.stack) {
    app._router.stack.forEach(function(r){
      if (r.route && r.route.path){
        console.log('Registered route:', r.route.path);
      }
    });
  }
});

