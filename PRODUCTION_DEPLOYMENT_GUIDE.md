# 🚀 HireOn Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] All security vulnerabilities fixed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring systems set up
- [ ] Rate limiting configured
- [ ] Security headers enabled

### ✅ Infrastructure Requirements
- [ ] Production server provisioned
- [ ] Domain and DNS configured
- [ ] Load balancer configured (if needed)
- [ ] CDN set up for static assets
- [ ] Database cluster ready
- [ ] Backup storage configured

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```env
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ========================================

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-32-chars-minimum
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Domain Restrictions (optional)
ALLOWED_EMAIL_DOMAINS=gmail.com,outlook.com,yourcompany.com

# Razorpay Configuration (LIVE KEYS)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Configuration
ADMIN_SECRET_KEY=your_admin_secret_key

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Subscription Configuration
TRIAL_DURATION_DAYS=2
MONTHLY_DURATION_DAYS=30
ANNUAL_DURATION_DAYS=365
```

### Frontend Environment Variables (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Analytics (optional)
VITE_ANALYTICS_ID=your_analytics_id
```

## 🏗️ Infrastructure Setup

### 1. Server Provisioning

#### AWS EC2 Setup
```bash
# Launch Ubuntu 22.04 LTS instance
# Minimum specs: 2 vCPU, 4GB RAM, 20GB SSD

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install SSL certificates
sudo apt install certbot python3-certbot-nginx -y
```

#### DigitalOcean Droplet Setup
```bash
# Similar to AWS setup
# Use Ubuntu 22.04 LTS image
# Minimum specs: 2GB RAM, 1 vCPU, 50GB SSD
```

### 2. Domain & DNS Configuration

#### DNS Records
```
# A Record
api.yourdomain.com -> Your Server IP

# CNAME Record
www.yourdomain.com -> yourdomain.com

# A Record
yourdomain.com -> Your Server IP
```

#### SSL Certificate
```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Nginx Configuration

#### /etc/nginx/sites-available/hireon-backend
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/hireon-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Database Setup

#### Supabase Production Setup
1. Create new Supabase project
2. Configure production database
3. Set up Row Level Security (RLS)
4. Configure backups
5. Set up monitoring

#### Database Schema
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription);
CREATE INDEX idx_users_updated_at ON users(updated_at);
```

## 🚀 Application Deployment

### 1. Code Deployment

#### Using Git
```bash
# Clone repository
git clone https://github.com/your-username/hireon-backend.git
cd hireon-backend

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
# Edit .env with production values

# Create logs directory
mkdir logs

# Test application
npm test
```

#### Using PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hireon-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 2. Frontend Deployment

#### Build Application
```bash
cd hireon-frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to hosting service (Vercel, Netlify, etc.)
```

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔒 Security Hardening

### 1. Server Security

#### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### SSH Security
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Add/modify these lines:
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# Restart SSH
sudo systemctl restart sshd
```

### 2. Application Security

#### Environment Validation
```bash
# Test environment variables
node -e "
const required = ['JWT_SECRET', 'RAZORPAY_KEY_ID', 'SUPABASE_URL'];
required.forEach(key => {
  if (!process.env[key]) {
    console.error('Missing required environment variable:', key);
    process.exit(1);
  }
});
console.log('All required environment variables are set');
"
```

#### Security Headers Test
```bash
# Test security headers
curl -I https://api.yourdomain.com/api/health
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

#### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs hireon-backend

# Monitor resources
pm2 status
```

#### Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/hireon-backend

# Add configuration:
/home/ubuntu/hireon-backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. System Monitoring

#### Install Monitoring Tools
```bash
# Install htop for system monitoring
sudo apt install htop

# Install netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

## 🔄 Backup Strategy

### 1. Database Backups

#### Automated Backups
```bash
# Create backup script
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Database backup (if using PostgreSQL)
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /home/ubuntu/hireon-backend

# Upload to cloud storage (AWS S3 example)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql s3://your-backup-bucket/
aws s3 cp $BACKUP_DIR/app_backup_$DATE.tar.gz s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

# Make executable
chmod +x /home/ubuntu/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh
```

## 🧪 Testing & Validation

### 1. Security Testing

#### Run Security Scans
```bash
# Install security tools
npm install -g auditjs

# Run security audit
npm audit

# Run OWASP ZAP scan
# Download and run OWASP ZAP against your application
```

#### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://api.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/health"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "testpassword"
EOF

# Run load test
artillery run load-test.yml
```

### 2. Functionality Testing

#### API Testing
```bash
# Test all endpoints
curl -X GET https://api.yourdomain.com/api/health
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

## 🚨 Incident Response

### 1. Monitoring Alerts

#### Set up Alerts
```bash
# Create monitoring script
cat > /home/ubuntu/monitor.sh << 'EOF'
#!/bin/bash

# Check if application is running
if ! pm2 list | grep -q "hireon-backend.*online"; then
    echo "Application is down!" | mail -s "HireOn Alert" admin@yourdomain.com
    pm2 restart hireon-backend
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is high: ${DISK_USAGE}%" | mail -s "HireOn Alert" admin@yourdomain.com
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "Memory usage is high: ${MEMORY_USAGE}%" | mail -s "HireOn Alert" admin@yourdomain.com
fi
EOF

# Add to crontab (run every 5 minutes)
crontab -e
# Add: */5 * * * * /home/ubuntu/monitor.sh
```

## 📈 Performance Optimization

### 1. Application Optimization

#### Enable Compression
```bash
# Already configured in Nginx
# Verify compression is working
curl -H "Accept-Encoding: gzip" -I https://api.yourdomain.com/api/health
```

#### Database Optimization
```sql
-- Analyze table performance
ANALYZE users;

-- Create additional indexes if needed
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY idx_users_provider ON users(provider);
```

### 2. CDN Configuration

#### Cloudflare Setup
1. Add domain to Cloudflare
2. Configure DNS records
3. Enable SSL/TLS encryption
4. Configure caching rules
5. Enable security features

## ✅ Post-Deployment Checklist

### Security Verification
- [ ] SSL certificate working
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Environment variables secure
- [ ] Database backups working
- [ ] Monitoring alerts configured

### Performance Verification
- [ ] Application responding quickly
- [ ] Load testing passed
- [ ] Database queries optimized
- [ ] CDN configured
- [ ] Compression working
- [ ] Logs being generated

### Functionality Verification
- [ ] All API endpoints working
- [ ] Authentication flows working
- [ ] Payment processing working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Admin functions working

## 🎯 Success Metrics

### Performance Targets
- **Response Time:** < 200ms for API calls
- **Uptime:** > 99.9%
- **Error Rate:** < 0.1%
- **Throughput:** 1000+ requests/second

### Security Targets
- **Vulnerability Score:** 0 critical, 0 high
- **Security Headers:** All implemented
- **Rate Limiting:** Active and effective
- **Data Encryption:** 100% encrypted in transit

---

**Deployment Status:** Ready for Production  
**Security Level:** Enterprise Grade  
**Performance Level:** Optimized  
**Monitoring:** Comprehensive  

**Next Steps:**
1. Execute deployment checklist
2. Run security tests
3. Monitor performance
4. Set up alerts
5. Document procedures 