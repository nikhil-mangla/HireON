# 🚀 Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare all required environment variables

## Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `hireon-backend` directory

### 2. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-actual-jwt-secret-key

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Configuration
ADMIN_SECRET_KEY=your-admin-secret-key

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Deploy

1. Railway will automatically detect the Node.js project
2. It will install dependencies and start the server
3. The deployment URL will be provided

### 4. Update Frontend

Update your frontend's `.env` file:

```env
VITE_API_BASE_URL=https://your-railway-app-url.railway.app
```

## Health Check

Your app includes a health check endpoint at `/api/health` that Railway will use to verify the deployment.

## Monitoring

- Check Railway dashboard for logs
- Monitor the health check endpoint
- Set up alerts for any issues

## Troubleshooting

1. **Build Failures**: Check Railway logs for dependency issues
2. **Environment Variables**: Ensure all required variables are set
3. **Port Issues**: Railway automatically assigns ports, don't hardcode
4. **Database Connection**: Verify Supabase connection strings

## Security Notes

- Never commit `.env` files to Git
- Use strong JWT secrets in production
- Enable HTTPS in production
- Regularly update dependencies 