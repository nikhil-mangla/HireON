# HireOn - Complete Authentication & Payment System

A full-stack web application for technical interview practice with authentication, payment processing, and desktop app integration.

## 🚀 **Features**

- ✅ **Email/Password Authentication** - Complete signup and login system
- ✅ **Google OAuth Integration** - One-click Google login
- ✅ **Payment Processing** - Razorpay integration with 3 subscription plans
- ✅ **Deep Link Generation** - Electron desktop app integration
- ✅ **Stylish UI** - Modern glassmorphism design with dark gradients
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Token Expiration Logic** - Subscription-based access control

## 📦 **Project Structure**

```
hireon-complete-project/
├── hireon-backend/          # Node.js Express backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── .env               # Environment variables
│   └── users.json         # User data storage (auto-generated)
├── hireon-frontend/        # React frontend
│   ├── src/               # Source code
│   ├── package.json       # Frontend dependencies
│   ├── .env              # Frontend environment variables
│   └── dist/             # Built files (generated)
└── Documentation/         # Project documentation
```

## 🛠 **Setup Instructions**

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd hireon-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Edit `.env` file with your credentials:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Start the backend server:**
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd hireon-frontend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables:**
   Edit `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server:**
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🔧 **Configuration Guide**

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
6. Copy Client ID and Client Secret to `.env` files

### Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get API keys from dashboard
3. Set up webhook endpoint: `https://yourdomain.com/api/razorpay/webhook`
4. Copy keys to backend `.env` file

## 💳 **Subscription Plans**

- **Trial Week:** ₹99 for 7 days
- **Monthly:** ₹499 for 30 days
- **Annual:** ₹4999 for 365 days

## 🔗 **API Endpoints**

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Payment Processing
- `POST /api/razorpay/create-order` - Create payment order
- `POST /api/razorpay/verify-payment` - Verify payment
- `POST /api/razorpay/webhook` - Payment webhook

### Desktop App Integration
- `POST /api/generate-deep-link` - Generate deep link
- `POST /api/validate-electron-token` - Validate desktop token
- `POST /api/generate-token-file` - Generate token file

## 🚀 **Deployment**

### Backend Deployment
1. Build the application
2. Set environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)
4. Ensure CORS is configured for your frontend domain

### Frontend Deployment
1. Build the application:
   ```bash
   pnpm run build
   ```
2. Deploy the `dist` folder to your hosting platform
3. Update API base URL in environment variables

## 🔒 **Security Features**

- JWT token-based authentication
- Google OAuth integration
- Secure payment processing with Razorpay
- CORS protection
- Input validation
- Token expiration based on subscription

## 🎨 **UI/UX Features**

- Modern glassmorphism design
- Dark gradient backgrounds
- Responsive layout
- Smooth animations
- Professional Google login integration
- Payment modal with multiple plans
- Dashboard with subscription management

## 📱 **Desktop App Integration**

The application supports deep link generation for Electron desktop apps:

1. **Custom Protocol:** `learncodeapp://`
2. **Deep Link Format:** `learncodeapp://auth?token=...&user=...&expires=...`
3. **Token File Export:** Manual import option for desktop app
4. **Secure Validation:** Server-side token verification

## 🧪 **Testing**

### Test User Credentials
- **Email:** test.user@example.com
- **Password:** testpassword123

### Test Payment
Use Razorpay test credentials for payment testing.

## 📝 **Development Notes**

- User data is stored in `users.json` for development
- For production, migrate to a proper database (PostgreSQL/MongoDB)
- Implement password hashing with bcrypt for production
- Add proper logging and monitoring
- Set up SSL/HTTPS for production

## 🤝 **Support**

For issues or questions:
1. Check the documentation files included
2. Review the authentication fix summary
3. Ensure all environment variables are properly configured
4. Verify API endpoints are accessible

## 📄 **License**

This project is provided as-is for educational and development purposes.

---

**Built with:** Node.js, Express, React, Vite, Tailwind CSS, shadcn/ui, Razorpay, Google OAuth

**Last Updated:** $(date)

