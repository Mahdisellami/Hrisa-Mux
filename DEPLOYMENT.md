# Hrisa-Mux Deployment Guide

## 🚀 Quick Start

### 1. Deploy Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Add `YOUTUBE_API_KEY` environment variable

### 2. Run Database Migrations
After backend is deployed, run the SQL from `docker/init.sql` in Render's database shell

### 3. Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://hrisa-mux-api.onrender.com
   ```
4. Deploy!

## ✅ Done!
Your app is now live at `https://your-app.vercel.app`
