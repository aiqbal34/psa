# UCDPakiPSA Polling Website - Deployment Guide

This guide will help you deploy the full-stack polling website to production.

## 🏗️ Architecture

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Express.js API deployed on Render
- **Database**: PostgreSQL hosted on Render

## 📋 Prerequisites

1. GitHub account
2. Vercel account (free)
3. Render account (free tier available)

## 🚀 Backend Deployment (Render)

### Step 1: Create Render Web Service

1. Go to [Render.com](https://render.com) and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and configure:
   - **Name**: `ucdpakipsa-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Add PostgreSQL Database

1. In Render dashboard, click "New" → "PostgreSQL"
2. Configure database:
   - **Name**: `ucdpakipsa-db`
   - **Database**: `ucdpakipsa_polls`
   - **User**: `your_username`
   - **Region**: Same as your web service
3. Note the connection details (Render will provide `DATABASE_URL`)

### Step 3: Configure Environment Variables

In Render web service → Environment, add:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[Your PostgreSQL External Database URL from Render]
CORS_ORIGINS=https://ucdpakipsa.vercel.app,https://ucdpakipsa.io
```

**⚠️ IMPORTANT**: Make sure to use the **External Database URL**, not the Internal one. The External URL is accessible from your web service.

### Step 4: Troubleshooting Database Connection Issues

If you see `ECONNREFUSED` errors like:
```
Error: connect ECONNREFUSED ::1:5432
Error: connect ECONNREFUSED 127.0.0.1:5432
```

This means your app is trying to connect to localhost instead of the Render database. Here's how to fix it:

#### Check 1: Verify DATABASE_URL is Set
1. Go to your Render web service dashboard
2. Click on "Environment" tab
3. Ensure `DATABASE_URL` is present and correctly formatted
4. The URL should look like: `postgresql://username:password@hostname:port/database_name`

#### Check 2: Ensure Database Service Exists
1. Go to Render Dashboard → Databases
2. Verify your PostgreSQL database (`ucdpakipsa-db`) is running
3. Copy the "External Database URL" (not Internal)
4. Paste it as the `DATABASE_URL` environment variable

#### Check 3: Service Dependencies
1. Ensure your database is created BEFORE deploying the web service
2. The web service should wait for the database to be ready
3. Check the database status - it should show "Available"

#### Check 4: Manual Environment Variable Setup
If the `render.yaml` linking isn't working:
1. Go to your web service → Environment
2. Delete the existing `DATABASE_URL` variable
3. Add a new one with the actual connection string from your database service
4. **Use the EXTERNAL Database URL**: `postgresql://aiqbal34:geleNLrHaAAOGARWPYr7uSPjwl52k99F@dpg-d29etg7diees73clqh9g-a.oregon-postgres.render.com/ucdpakipsa_polls`
5. Redeploy the service

**⚠️ CRITICAL**: Always use the **External** Database URL (with `.oregon-postgres.render.com`), not the Internal one!

#### Check 5: SSL/TLS Connection Issues
If you see `SSL/TLS required` errors:
```
error: SSL/TLS required
```

This means Render's PostgreSQL requires SSL connections. The app is configured to handle this automatically in production, but if you still see this error:

1. Ensure `NODE_ENV=production` is set in your environment variables
2. The SSL configuration should automatically use `{ rejectUnauthorized: false, require: true }`
3. If the issue persists, check that your DATABASE_URL is the External URL (not Internal)

### Step 4: Deploy Backend

1. Render will automatically deploy your backend
2. Note your Render backend URL (e.g., `https://ucdpakipsa-backend.onrender.com`)
3. Test the API at: `https://your-backend-url.onrender.com/health`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import your GitHub repository
3. Select the `frontend` folder as the root directory

### Step 2: Configure Build Settings

In Vercel project settings:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
NEXT_PUBLIC_API_URL=https://ucdpakipsa-backend.onrender.com
```

### Step 4: Deploy Frontend

1. Vercel will automatically deploy your frontend
2. Your site will be available at: `https://your-project-name.vercel.app`

## 🌍 Custom Domain Setup

### For ucdpakipsa.io Domain

#### Frontend (Vercel)
1. In Vercel project settings → Domains
2. Add custom domain: `ucdpakipsa.io` and `www.ucdpakipsa.io`
3. Follow Vercel's DNS configuration instructions
4. Update your domain's DNS records as instructed

#### Backend (Render)
1. In Render web service settings → Custom Domains
2. Add custom domain: `api.ucdpakipsa.io`
3. Update DNS records as instructed by Render
4. Update frontend environment variable: `NEXT_PUBLIC_API_URL=https://api.ucdpakipsa.io`

## 🔧 Environment Variables Summary

### Backend (Render)
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[Your Render PostgreSQL External Database URL]
CORS_ORIGINS=https://ucdpakipsa.io,https://www.ucdpakipsa.io,https://ucdpakipsa.vercel.app
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://api.ucdpakipsa.io
```

## 🧪 Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend-url/health`
2. **API Endpoints**: Test `https://your-backend-url/api/polls`
3. **Frontend**: Visit your Vercel URL and test creating/voting on polls
4. **Integration**: Ensure frontend can communicate with backend

## 📊 Database Setup

The backend will automatically create the required tables when it starts. The schema includes:

- `polls` table for storing poll questions and options
- `votes` table for storing individual votes
- Proper indexes for performance
- Sample data for testing

## 🔒 Security Features

- CORS protection configured for your domains
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection protection with parameterized queries
- Helmet.js security headers

## 📱 Features Verification

After deployment, verify these features work:

- ✅ Create new polls
- ✅ View all polls on homepage
- ✅ Vote on polls
- ✅ View poll results with bar charts
- ✅ Edit existing polls
- ✅ Share polls via URL
- ✅ Mobile responsive design
- ✅ No authentication required

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure `CORS_ORIGINS` includes your frontend domain
2. **Database Connection**: Check `DATABASE_URL` is correctly set
3. **API Not Found**: Verify `NEXT_PUBLIC_API_URL` points to your Render backend
4. **Build Failures**: Check all dependencies are in `package.json`

### Logs:
- **Render**: View logs in Render web service dashboard
- **Vercel**: View function logs in Vercel dashboard

## 🎯 Performance Tips

1. **Render**: Use Render's metrics to monitor API performance
2. **Vercel**: Enable Vercel Analytics for frontend insights
3. **Database**: Render PostgreSQL includes connection pooling
4. **Caching**: Next.js automatically optimizes static assets

## 💰 Cost Estimation

- **Render**: Free tier includes 512MB RAM, $7/month for starter plan with more resources
- **Vercel**: Free tier includes 100GB bandwidth, commercial use allowed
- **Domain**: ~$10-15/year for .io domain

Your polling website should now be fully deployed and accessible at `ucdpakipsa.io`! 🎉