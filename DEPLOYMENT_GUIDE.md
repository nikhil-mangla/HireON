# HireOn Deployment Guide

## 🚀 **Quick Deployment**

### Current Live URLs
- **Frontend:** https://seaemyjh.manus.space
- **Backend:** https://3001-inwsq2s9o0qoj4fosx9yr-a803f191.manusvm.computer

## 📋 **Pre-Deployment Checklist**

### Backend Requirements
- [ ] Node.js environment
- [ ] Environment variables configured
- [ ] Database setup (or JSON file storage)
- [ ] CORS configured for frontend domain
- [ ] SSL certificate (for production)

### Frontend Requirements
- [ ] React build completed
- [ ] API base URL updated
- [ ] Google Client ID configured
- [ ] Static file hosting ready

## 🔧 **Environment Configuration**

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## 🌐 **Platform-Specific Deployment**

### Vercel (Frontend)
1. Connect GitHub repository
2. Set build command: `pnpm run build`
3. Set output directory: `dist`
4. Add environment variables in dashboard

### Netlify (Frontend)
1. Drag and drop `dist` folder
2. Or connect Git repository
3. Build command: `pnpm run build`
4. Publish directory: `dist`

### Heroku (Backend)
1. Create new Heroku app
2. Add environment variables
3. Deploy from Git or CLI
4. Ensure `package.json` has start script

### Railway (Backend)
1. Connect GitHub repository
2. Add environment variables
3. Auto-deploy on push
4. Custom domain configuration

### AWS/DigitalOcean (Full Stack)
1. Set up server instance
2. Install Node.js and dependencies
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Configure environment variables

## 🔒 **Security Configuration**

### Production Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Use environment variables for secrets
- [ ] Set up monitoring and logging

### CORS Configuration
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

## 💾 **Database Migration**

### From JSON to PostgreSQL
```javascript
// Replace in-memory storage with database
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
});
```

### From JSON to MongoDB
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  subscription: String,
  // ... other fields
});
```

## 🔄 **CI/CD Pipeline**

### GitHub Actions Example
```yaml
name: Deploy HireOn
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd hireon-frontend && pnpm install
      - name: Build
        run: cd hireon-frontend && pnpm run build
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 📊 **Monitoring Setup**

### Health Check Endpoint
The backend includes a health check at `/api/health`

### Logging Configuration
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚨 **Troubleshooting**

### Common Issues

1. **CORS Errors**
   - Check origin configuration
   - Verify API base URL
   - Ensure credentials are included

2. **Authentication Failures**
   - Verify JWT secret consistency
   - Check token expiration
   - Validate environment variables

3. **Payment Issues**
   - Confirm Razorpay keys
   - Check webhook configuration
   - Verify signature validation

4. **Google OAuth Problems**
   - Validate client ID
   - Check authorized domains
   - Verify redirect URIs

### Debug Commands
```bash
# Check backend health
curl https://your-backend.com/api/health

# Test authentication
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Verify CORS
curl -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS https://your-backend.com/api/auth/login
```

## 📈 **Performance Optimization**

### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images and assets

### Backend Optimization
- Implement caching
- Use connection pooling
- Add rate limiting
- Optimize database queries

## 🔄 **Backup Strategy**

### User Data Backup
```bash
# Backup users.json
cp users.json users_backup_$(date +%Y%m%d).json

# Database backup (PostgreSQL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## 📞 **Support & Maintenance**

### Regular Maintenance Tasks
- [ ] Update dependencies
- [ ] Monitor error logs
- [ ] Check security updates
- [ ] Backup user data
- [ ] Monitor performance metrics
- [ ] Review access logs

### Emergency Procedures
1. **Service Down:** Check health endpoint, restart services
2. **Database Issues:** Restore from backup, check connections
3. **Payment Problems:** Contact Razorpay support, check webhook logs
4. **Security Breach:** Rotate secrets, check access logs, notify users

---

**Need Help?** Check the included documentation or contact support.

