# Deployment Guide

This guide provides detailed instructions for deploying Hrisa-Mux to production using **Vercel** (frontend) and **Render** (backend).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Troubleshooting](#troubleshooting)
- [Alternative Deployment Options](#alternative-deployment-options)

## Prerequisites

Before deploying, ensure you have:

- [x] GitHub account with your repository pushed
- [x] Render account (https://render.com)
- [x] Vercel account (https://vercel.com)
- [x] YouTube Data API Key (optional, for search functionality)
- [x] Application tested locally

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `hrisa-mux-db`
   - **Database**: `hrisa_mux`
   - **User**: `hrisa_mux_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (for testing) or Starter ($7/month recommended)
4. Click **"Create Database"**
5. **Important**: Copy the **Internal Database URL** (starts with `postgresql://`)
   - Find it in the database dashboard under "Connections"
   - Use the **Internal** URL, not External

### Step 2: Create Redis Instance

1. Click **"New +"** → **"Redis"**
2. Configure:
   - **Name**: `hrisa-mux-redis`
   - **Region**: Same as PostgreSQL database
   - **Plan**: Free (for testing)
   - **Maxmemory Policy**: `allkeys-lru` (recommended for caching)
3. Click **"Create Redis"**
4. **Important**: Copy the **Internal Redis URL** (starts with `redis://`)

### Step 3: Deploy Backend API

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

   **Basic Settings**:
   - **Name**: `hrisa-mux-api`
   - **Region**: Same as database and Redis
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     pnpm install && pnpm build
     ```
   - **Start Command**:
     ```bash
     pnpm start
     ```

   **Advanced Settings**:
   - **Auto-Deploy**: Yes (deploys on git push)
   - **Health Check Path**: `/health`

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```env
   NODE_ENV=production
   API_PORT=10000
   API_URL=https://hrisa-mux-api.onrender.com
   WEB_URL=https://hrisa-mux.vercel.app

   # Database (from Step 1)
   DATABASE_URL=<paste Internal Database URL>

   # Redis (from Step 2)
   REDIS_URL=<paste Internal Redis URL>

   # JWT Secrets (generate new ones!)
   JWT_SECRET=<generate-strong-random-string>
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=<generate-another-strong-random-string>
   REFRESH_TOKEN_EXPIRES_IN=7d

   # YouTube API (optional but recommended)
   YOUTUBE_API_KEY=<your-youtube-api-key>

   # SoundCloud (optional)
   SOUNDCLOUD_CLIENT_ID=

   # Storage
   STORAGE_TYPE=local
   MAX_FILE_SIZE=104857600
   ALLOWED_FILE_TYPES=audio/mpeg,audio/mp4,audio/flac,audio/wav,audio/ogg

   # CORS - Update after deploying frontend!
   CORS_ORIGIN=https://hrisa-mux.vercel.app

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Cache TTL
   CACHE_TTL_YOUTUBE=1800
   CACHE_TTL_SOUNDCLOUD=1800
   CACHE_TTL_METADATA=3600
   ```

   **To generate JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run this command twice to generate two different secrets.

5. Click **"Create Web Service"**

6. Wait for deployment to complete (5-10 minutes for first deploy)

7. **Test the backend**:
   - Visit `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"...","env":"production"}`

### Step 4: Run Database Migrations

After first deployment:

1. Go to your backend service dashboard
2. Click **"Shell"** tab
3. Run migrations:
   ```bash
   cd /opt/render/project/src/apps/api
   pnpm db:push
   ```

Alternatively, you can add this to your build command:
```bash
pnpm install && pnpm build && pnpm db:push
```

## Frontend Deployment (Vercel)

### Step 1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository: `Hrisa-Mux`

### Step 2: Configure Build Settings

1. **Framework Preset**: Next.js (should auto-detect)

2. **Root Directory**: Click "Edit" → Enter `apps/web`

3. **Build & Development Settings**:
   - **Build Command**:
     ```bash
     cd ../.. && pnpm install && cd apps/web && pnpm build
     ```
   - **Output Directory**: `.next` (default, leave as is)
   - **Install Command**:
     ```bash
     pnpm install
     ```

4. **Environment Variables**:
   - Click "Environment Variables"
   - Add:
     ```env
     NEXT_PUBLIC_API_URL=https://hrisa-mux-api.onrender.com
     ```
   - Make sure to use YOUR Render backend URL!

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. Once deployed, Vercel will give you a URL like:
   - `https://hrisa-mux.vercel.app`
   - Or your custom domain

### Step 4: Update Production Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## Post-Deployment Configuration

### Update Backend CORS

After deploying the frontend, you need to update the backend CORS origin:

1. Go to Render → Your backend service → Environment
2. Update these variables:
   ```env
   WEB_URL=https://hrisa-mux.vercel.app
   CORS_ORIGIN=https://hrisa-mux.vercel.app
   ```
3. Save changes
4. Redeploy backend (automatic)

### Test the Full Application

1. Visit your Vercel URL: `https://hrisa-mux.vercel.app`
2. Register a new account
3. Log in
4. Try these features:
   - **Upload a file**: Go to Library → Upload Music
   - **Search YouTube**: Go to Search → YouTube tab
   - **Search SoundCloud**: Go to Search → SoundCloud tab
   - **Create playlist**: Go to Playlists → Create Playlist
   - **Play music**: Click play on any track

## Troubleshooting

### Backend Issues

**Problem**: `502 Bad Gateway` or backend not responding
- **Solution**: Check Render logs (Backend service → Logs)
- Look for errors in startup
- Verify all environment variables are set correctly

**Problem**: Database connection errors
- **Solution**:
  - Verify `DATABASE_URL` is the **Internal** connection string
  - Check database is in the same region as backend
  - Run migrations: `pnpm db:push` in Render Shell

**Problem**: Redis connection errors
- **Solution**:
  - Verify `REDIS_URL` is the **Internal** connection string
  - Check Redis instance is running
  - Same region as backend

**Problem**: YouTube search not working
- **Solution**:
  - Add `YOUTUBE_API_KEY` to environment variables
  - Get API key from: https://console.cloud.google.com
  - Enable YouTube Data API v3

### Frontend Issues

**Problem**: `NEXT_PUBLIC_API_URL is not defined`
- **Solution**: Add environment variable in Vercel project settings
- Redeploy after adding

**Problem**: CORS errors in browser console
- **Solution**:
  - Update `CORS_ORIGIN` in Render backend environment
  - Make sure it matches your Vercel URL exactly
  - Redeploy backend

**Problem**: API requests failing (401, 403, 500)
- **Solution**:
  - Check browser DevTools Network tab
  - Verify backend URL is correct in Vercel env
  - Check backend logs in Render

### Common Deployment Errors

**Problem**: Build fails with "pnpm not found"
- **Solution**: Render/Vercel should auto-install pnpm
- If not, change install command to: `npm install -g pnpm && pnpm install`

**Problem**: Module not found errors
- **Solution**: Clear build cache
  - Render: Settings → Clear build cache → Redeploy
  - Vercel: Deployments → [deployment] → Redeploy

**Problem**: Out of memory errors
- **Solution**: Upgrade to paid plan (Free tier has limited memory)

## Environment Variables Reference

### Required Backend Variables
```env
NODE_ENV=production
API_PORT=10000
API_URL=<your-render-url>
WEB_URL=<your-vercel-url>
DATABASE_URL=<from-render-postgres>
REDIS_URL=<from-render-redis>
JWT_SECRET=<generate-random>
REFRESH_TOKEN_SECRET=<generate-random>
CORS_ORIGIN=<your-vercel-url>
```

### Optional Backend Variables
```env
YOUTUBE_API_KEY=<from-google-cloud>
SOUNDCLOUD_CLIENT_ID=<from-soundcloud>
STORAGE_TYPE=local  # or s3 with AWS credentials
```

### Required Frontend Variables
```env
NEXT_PUBLIC_API_URL=<your-render-url>
```

## Alternative Deployment Options

### Railway (Backend Alternative)

Railway is similar to Render:
1. Create PostgreSQL and Redis instances
2. Deploy with Dockerfile or Node.js
3. Similar pricing to Render
4. Easier management interface

### Netlify (Frontend Alternative)

Netlify is similar to Vercel:
1. Import repository
2. Set build command and root directory
3. Add environment variables
4. Deploy

### Docker Deployment

For custom deployment (VPS, AWS, etc.):

1. **Build Docker images** (future implementation)
2. **Deploy to container platform** (AWS ECS, Digital Ocean, etc.)
3. **Set up reverse proxy** (Nginx, Caddy)
4. **Configure SSL certificates** (Let's Encrypt)

## Monitoring & Maintenance

### Logs

- **Render**: Backend service → Logs tab
- **Vercel**: Deployments → [deployment] → Function logs

### Database Backups

- **Render**: Automatic daily backups on paid plans
- Manual backup: Use `pg_dump` in Render Shell

### Uptime Monitoring

Consider using:
- **Uptime Robot** (free)
- **Pingdom** (paid)
- **Better Uptime** (paid)

### Performance

- Monitor response times
- Check Redis cache hit rates
- Optimize database queries if needed

## Security Checklist

- [ ] Strong JWT secrets (32+ characters, random)
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables properly set (no hardcoded secrets)
- [ ] Database backups enabled
- [ ] Regular dependency updates

## Cost Estimate

### Free Tier (for testing)
- Render Backend: Free (with limitations)
- Render PostgreSQL: Free
- Render Redis: Free
- Vercel Frontend: Free
- **Total**: $0/month

### Production (recommended)
- Render Backend: $7/month (Starter)
- Render PostgreSQL: $7/month (Starter)
- Render Redis: $3/month (Starter)
- Vercel Frontend: $0 (Hobby) or $20/month (Pro)
- **Total**: $17-37/month

### Enterprise
- Scale up as needed
- Custom domains included
- More regions available
- Priority support

---

## Support

If you encounter issues:

1. Check Render logs (Backend)
2. Check Vercel deployment logs (Frontend)
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Test backend health endpoint
6. Open an issue on GitHub

Good luck with your deployment! 🚀
