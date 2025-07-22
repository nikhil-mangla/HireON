# Google OAuth Implementation Notes

## Key Steps for Implementation

### 1. Google Console Setup
- Create OAuth 2.0 Client ID credentials
- Configure OAuth consent screen
- Set authorized JavaScript origins (backend URL)
- Set authorized redirect URIs (callback URL)
- Get Client ID and Client Secret

### 2. Backend Implementation Options

#### Option A: Using Passport.js (Traditional)
```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Find or create user logic
}));
```

#### Option B: Using google-auth-library (Modern)
```javascript
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
```

### 3. Frontend Integration
- Use Google Sign-In button
- Send ID token to backend for verification
- Handle success/failure responses

### 4. User Data Structure
```javascript
{
  id: profile.id,
  name: profile.displayName,
  email: profile.emails[0].value,
  picture: profile.photos[0].value,
  provider: 'google'
}
```

### 5. JWT Integration
- Verify Google token
- Create JWT token for session management
- Return user data and JWT to frontend

## Implementation Plan for HireOn
1. Install required packages
2. Add Google OAuth routes to existing server.js
3. Update user model to support Google ID
4. Add Google Sign-In button to frontend
5. Update authentication flow to handle both email/password and Google login

