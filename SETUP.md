# 🚀 თევზაობის პროგნოზი - Phase 2 Setup

## 📋 Prerequisites

- **Node.js** 18+ (https://nodejs.org/)
- **MongoDB Atlas** free account (https://cloud.mongodb.com/)
- **Google reCAPTCHA** keys (https://www.google.com/recaptcha/)

## 🔧 Phase 2 Setup Instructions

### 1. Install Dependencies

```bash
cd "Claude FishingForecast"
npm install
```

### 2. MongoDB Atlas Setup (FREE)

1. **Create Account**: Go to https://cloud.mongodb.com/
2. **Create Cluster**: 
   - Choose "Build a Database"
   - Select "FREE" Shared cluster
   - Choose region (recommend Frankfurt for Georgia)
   - Name your cluster (e.g., "fishing-forecast")

3. **Database Access**:
   - Go to Database Access
   - Add Database User
   - Username: `fishing_user`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

4. **Network Access**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Or add your specific IP for better security

5. **Get Connection String**:
   - Go to Databases → Connect → Connect your application
   - Copy connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

### 3. Google reCAPTCHA Setup (FREE)

1. **Go to**: https://www.google.com/recaptcha/admin/create
2. **Register Site**:
   - Label: "Fishing Forecast Georgia"
   - reCAPTCHA type: "reCAPTCHA v2" → "I'm not a robot"
   - Domains: `localhost`, `127.0.0.1`, your domain
3. **Get Keys**:
   - Site Key (for frontend)
   - Secret Key (for backend)

### 4. Environment Configuration

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual values:
   ```env
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://fishing_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fishing-forecast?retryWrites=true&w=majority

   # JWT Secret (generate random string)
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random

   # Google reCAPTCHA
   RECAPTCHA_SITE_KEY=your-site-key-here
   RECAPTCHA_SECRET_KEY=your-secret-key-here

   # Weather APIs (optional for demo)
   OPENWEATHER_API_KEY=your-openweather-key
   WEATHERAPI_KEY=your-weatherapi-key
   ```

### 5. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

🎉 **Application will be available at**: http://localhost:3000

## 🧪 Testing the Authentication

### Test Registration
1. Click "რეგისტრაცია" (Register)
2. Fill form with:
   - სახელი: თესტი
   - გვარი: მომხმარებელი
   - ელ-ფოსტა: test@example.com
   - პაროლი: Test123!@#
3. Complete reCAPTCHA
4. Submit

### Test Login
1. Click "შესვლა" (Login)
2. Use registered credentials
3. Complete reCAPTCHA
4. Submit

### Test Features
- ✅ User registration with strong password hashing
- ✅ User login with JWT authentication
- ✅ Google reCAPTCHA v2 integration
- ✅ Session management
- ✅ Responsive forms in Georgian
- ✅ MongoDB Atlas integration
- ✅ Secure password validation
- ✅ Error handling and validation

## 🔐 Security Features

### Password Security
- **bcrypt** with salt rounds of 12
- Password requirements: min 8 chars, uppercase, lowercase, digit, special char
- Client-side and server-side validation

### Authentication
- **JWT tokens** with 7-day expiration
- Secure token storage in localStorage
- Token validation on protected routes

### Rate Limiting
- 100 requests per 15 minutes for general API
- 5 requests per 15 minutes for auth endpoints

### Data Validation
- **express-validator** for input sanitization
- Georgian/Latin alphabet validation for names
- Email format validation
- **reCAPTCHA v2** anti-bot protection

## 📁 Project Structure (Phase 2)

```
Claude FishingForecast/
├── models/
│   └── User.js              # MongoDB User schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── user.js              # User management routes
│   └── weather.js           # Weather API routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── utils/
│   └── recaptcha.js         # reCAPTCHA verification
├── server.js                # Express server
├── auth.js                  # Frontend authentication
├── script.js                # Main frontend logic
├── styles.css               # Complete styles
├── index.html               # Main HTML with auth modals
├── package.json             # Dependencies
├── .env                     # Environment variables
└── README.md                # Documentation
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout (client-side)

### User Management
- `GET /api/user/favorites` - Get favorite locations
- `POST /api/user/favorites` - Add favorite location
- `DELETE /api/user/favorites/:id` - Remove favorite
- `PUT /api/user/preferences` - Update preferences
- `PUT /api/user/profile` - Update profile

### Weather
- `GET /api/weather/forecast` - Get weather forecast
- `POST /api/weather/fishing-score` - Calculate fishing score

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check connection string format
- Verify username/password
- Ensure IP is whitelisted

### reCAPTCHA Not Working
- Verify site key in HTML matches Google Console
- Check domain configuration
- Test with localhost and 127.0.0.1

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process by PID
taskkill /PID <PID> /F
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 🚀 Next Steps

Phase 2 is complete! Ready for:
- ✅ User registration & authentication
- ✅ Secure password handling
- ✅ Session management
- ✅ MongoDB integration
- ✅ reCAPTCHA protection

**Phase 3 Ideas**:
- User favorite locations
- Weather data API integration
- Push notifications
- Historical data analysis
- Social features