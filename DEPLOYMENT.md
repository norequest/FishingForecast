# 🚀 Deployment Guide - თევზაობის პროგნოზი

## 🎯 Quick Deploy Options

### **Option 1: Railway (Recommended - Full Stack)**
✅ **Best for**: Complete backend + frontend hosting  
✅ **Free Tier**: 500 hours/month, $5 credit  
✅ **Database**: Built-in PostgreSQL or external MongoDB

### **Option 2: Vercel (Frontend + Serverless)**
✅ **Best for**: Static frontend + serverless functions  
✅ **Free Tier**: Unlimited personal projects  
✅ **Database**: External MongoDB Atlas required

### **Option 3: Render (Full Stack)**
✅ **Best for**: Complete application hosting  
✅ **Free Tier**: 750 hours/month  
✅ **Database**: External MongoDB Atlas required

---

## 🚂 **Railway Deployment (Recommended)**

### **Step 1: Prepare Repository**
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - Phase 2 with authentication"

# Push to GitHub
# Create repository on github.com
git remote add origin https://github.com/YOUR_USERNAME/fishing-forecast-georgia.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy on Railway**
1. **Go to**: https://railway.app/
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your fishing-forecast repository
5. **Deploy** automatically starts

### **Step 3: Configure Environment Variables**
In Railway dashboard → **Variables** tab:
```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters-long
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NODE_ENV=production
```

### **Step 4: Custom Domain (Optional)**
Railway provides free `.up.railway.app` subdomain  
Custom domain: Railway Settings → **Domains**

---

## ⚡ **Vercel Deployment (Serverless)**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Deploy**
```bash
cd "Claude FishingForecast"
vercel login
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? Your account
# ? Link to existing project? No
# ? What's your project's name? fishing-forecast-georgia
# ? In which directory is your code located? ./
```

### **Step 3: Environment Variables**
```bash
# Add environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add RECAPTCHA_SITE_KEY
vercel env add RECAPTCHA_SECRET_KEY

# Redeploy with environment variables
vercel --prod
```

---

## 🎨 **Render Deployment**

### **Step 1: Create Account**
1. **Go to**: https://render.com/
2. **Sign up** with GitHub
3. **Connect** your repository

### **Step 2: Create Web Service**
1. **New** → **Web Service**
2. **Connect** fishing-forecast repository
3. **Configure**:
   - **Name**: fishing-forecast-georgia
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### **Step 3: Environment Variables**
Add in Render dashboard → **Environment**:
```env
MONGODB_URI=your-mongodb-atlas-connection
JWT_SECRET=your-jwt-secret
RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
NODE_ENV=production
```

---

## 🗄️ **MongoDB Atlas Setup (All Platforms)**

### **Required for all deployment options**

1. **Create Account**: https://cloud.mongodb.com/
2. **Create Cluster**:
   - Choose **FREE** M0 cluster
   - Region: **Frankfurt** (closest to Georgia)
   - Name: `fishing-forecast`

3. **Database Access**:
   - **Add User**: `fishing_user`
   - **Password**: Generate secure password
   - **Privileges**: Read and write to any database

4. **Network Access**:
   - **Add IP**: `0.0.0.0/0` (allow from anywhere)
   - **Or add specific deployment IPs**

5. **Get Connection String**:
   ```
   mongodb+srv://fishing_user:PASSWORD@cluster0.xxxxx.mongodb.net/fishing-forecast?retryWrites=true&w=majority
   ```

---

## 🔐 **Google reCAPTCHA Setup**

### **Required for authentication**

1. **Go to**: https://www.google.com/recaptcha/admin/create
2. **Register Site**:
   - **Label**: Fishing Forecast Georgia
   - **Type**: reCAPTCHA v2 → "I'm not a robot"
   - **Domains**: 
     - `localhost` (for development)
     - Your deployment domain (e.g., `your-app.vercel.app`)

3. **Copy Keys**:
   - **Site Key**: For frontend (public)
   - **Secret Key**: For backend (private)

---

## 🔧 **Environment Variables Guide**

### **Required Variables**
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Security
JWT_SECRET=minimum-64-character-random-string
NODE_ENV=production

# reCAPTCHA
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### **Optional Variables**
```env
# Weather APIs
OPENWEATHER_API_KEY=your-openweather-key
WEATHERAPI_KEY=your-weatherapi-key

# CORS (update with your domain)
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🧪 **Testing Deployed Application**

### **1. Check Health**
```bash
curl https://your-deployed-app.com/api/health
```

### **2. Test Authentication**
1. **Register**: Create new account
2. **Login**: Use created credentials
3. **reCAPTCHA**: Verify working on both forms
4. **Session**: Refresh page, user should stay logged in

### **3. Test Features**
- ✅ Location search and map
- ✅ Weather forecast display
- ✅ Responsive design on mobile
- ✅ Georgian language interface

---

## 🐛 **Common Deployment Issues**

### **Database Connection Fails**
```bash
# Check connection string format
# Verify MongoDB Atlas IP whitelist
# Test connection string locally first
```

### **reCAPTCHA Not Working**
```bash
# Verify domain in Google Console
# Check site key in environment variables
# Test with development keys first
```

### **Build Fails**
```bash
# Check Node.js version (requires 18+)
# Verify all dependencies in package.json
# Test build locally: npm install && npm start
```

### **Environment Variables Not Loading**
```bash
# Verify variable names match exactly
# Check for typos in variable values
# Redeploy after adding variables
```

---

## 📊 **Monitoring & Logs**

### **Railway**
- Dashboard → **Deployments** → **View Logs**
- Real-time monitoring available

### **Vercel** 
- Dashboard → **Functions** → **View Logs**
- Serverless function analytics

### **Render**
- Dashboard → **Logs** tab
- Real-time log streaming

---

## 🔄 **Updates & Redeployment**

### **Automatic Deployment**
All platforms support **automatic deployment** from GitHub:
1. Push changes to `main` branch
2. Platform automatically rebuilds and deploys
3. Monitor deployment status in dashboard

### **Manual Deployment**
```bash
# Railway
railway up

# Vercel
vercel --prod

# Render - automatic only
```

---

## 💰 **Free Tier Limits**

### **Railway**
- 500 hours/month execution time
- $5 monthly credit
- Automatic sleep after inactivity

### **Vercel**
- 100GB bandwidth/month
- 1000 serverless function invocations/day
- Custom domains included

### **Render**
- 750 hours/month
- Automatic sleep after 15 minutes inactivity
- Custom domains on paid plans

---

## 🎉 **Deployment Checklist**

### **Pre-Deployment**
- [ ] MongoDB Atlas cluster created
- [ ] Google reCAPTCHA keys obtained
- [ ] Environment variables prepared
- [ ] Code committed to GitHub

### **Post-Deployment**
- [ ] Health check endpoint working
- [ ] Database connection successful
- [ ] Authentication flow tested
- [ ] reCAPTCHA verification working
- [ ] Responsive design verified
- [ ] Error handling tested

### **Production Ready**
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy planned

**🚀 Your fishing forecast application is now live and ready for Georgian users!**