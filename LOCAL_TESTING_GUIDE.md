# Local Testing Guide for Hrisa-Mux

Everything is now set up and ready for local testing! Follow these instructions to test your application.

## ✅ Setup Completed

The following has been prepared for you:

- ✅ Docker services (PostgreSQL & Redis) are running
- ✅ Backend environment variables configured (`.env`)
- ✅ Frontend environment variables configured (`.env.local`)
- ✅ Database schema created and migrated
- ✅ JWT secrets generated

## 🚀 Starting the Application

### Option 1: Start Both Servers Together (Recommended)

From the **root directory** (`Hrisa-Mux/`):

```bash
pnpm dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

## 📋 Testing Checklist

### 1. Test Backend Health

Open your browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-12T...",
  "env": "development"
}
```

### 2. Test Frontend

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Hrisa-Mux landing page.

### 3. Create an Account

1. Click **"Get Started"** or **"Sign Up"**
2. Fill in the registration form:
   - **Email**: test@example.com (or any email)
   - **Username**: testuser
   - **Password**: Test123!@#
   - **Display Name**: Test User (optional)
3. Click **"Sign Up"**
4. You should be redirected to the login page

### 4. Log In

1. Enter your credentials:
   - **Email**: test@example.com
   - **Password**: Test123!@#
2. Click **"Sign In"**
3. You should be redirected to the **Home** page

### 5. Test File Upload

1. Click **"Library"** in the sidebar (or use the quick action card)
2. Click **"Upload Music"**
3. Drag and drop an audio file (MP3, M4A, FLAC, WAV, or OGG)
   - Or click to browse and select a file
4. Watch the upload progress
5. Once complete, the file should appear in your library with:
   - Extracted metadata (title, artist, album)
   - Duration
   - Play button

### 6. Test Local Music Playback

1. In your library, click the **Play button** on an uploaded track
2. The audio player should appear at the bottom
3. Test the player controls:
   - **Play/Pause** button
   - **Volume** slider
   - **Seek bar** (click to jump to position)
   - **Next/Previous** buttons (if you have multiple tracks)
   - **Shuffle** button
   - **Repeat** button (off/one/all)
   - **Queue** button (to view/manage queue)

### 7. Test YouTube Search

1. Click **"Search"** in the sidebar
2. Make sure the **"YouTube"** tab is selected
3. Enter a search query (e.g., "lofi hip hop")
4. Click **"Search"**
5. You should see search results with:
   - Thumbnails
   - Track titles
   - Artists (channel names)
   - Duration
   - View counts

**Note**: If YouTube search doesn't work, you need to:
- Get a YouTube Data API key from https://console.cloud.google.com
- Add it to `apps/api/.env` as `YOUTUBE_API_KEY=your-key-here`
- Restart the backend server

### 8. Test YouTube Playback

1. From YouTube search results, click the **Play button** on any video
2. The track should start playing in the audio player
3. The video title and thumbnail should appear in the player

### 9. Test SoundCloud Search

1. Click **"Search"** in the sidebar
2. Switch to the **"SoundCloud"** tab
3. Enter a search query
4. Click **"Search"**
5. You should see SoundCloud tracks with:
   - Album art
   - Track titles
   - Artists
   - Duration
   - Play counts

### 10. Test Adding to Library

1. From YouTube or SoundCloud search results
2. Click the **+ (Plus)** button on any track
3. A success message should appear: "Added to library!"
4. The button should change to a checkmark
5. Go to your Library - the track should now be there

### 11. Test Playlist Creation

1. Click **"Playlists"** in the sidebar
2. Click **"Create Playlist"**
3. Fill in the form:
   - **Name**: My Test Playlist
   - **Description**: A playlist for testing (optional)
   - **Public**: Check or uncheck the box
4. Click **"Create"**
5. You should see your new playlist

### 12. Test Playlist Details

1. Click on your created playlist
2. You should see:
   - Playlist cover (default icon if no image)
   - Playlist name and description
   - Public/Private indicator
   - Track count (0 for now)
   - Empty state message

### 13. Test Adding Tracks to Playlist

(This feature may need to be tested once playlist add functionality is available)

### 14. Test Recently Played

1. Play several different tracks (local, YouTube, SoundCloud)
2. Go to **"Home"**
3. You should see a **"Recently Played"** section
4. The last 5 tracks you played should be listed
5. Click play on any of them to replay

### 15. Test Playlist Sharing

1. Create a **Public** playlist
2. Open the playlist details
3. Click the **"Share"** button
4. The playlist URL should be copied to your clipboard
5. A success message should appear

### 16. Test Queue Management

1. Play a track from your library (with multiple tracks)
2. Click the **Queue** button in the player
3. You should see:
   - Currently playing track
   - Upcoming tracks in the queue
4. Try:
   - Clicking on a track to jump to it
   - Using shuffle to randomize order
   - Using repeat modes (off/one/all)

### 17. Test Mobile Responsive Design

1. Resize your browser window to mobile size
2. Or open DevTools and toggle device emulation
3. Check:
   - The sidebar should collapse
   - A hamburger menu should appear in top-left
   - Click hamburger to open/close sidebar
   - All pages should be usable on mobile
   - Player controls should be accessible

### 18. Test Logout

1. Click on your user profile in the sidebar
2. Click **"Logout"**
3. You should be redirected to the login page
4. Try accessing protected pages (should redirect to login)

## 🐛 Troubleshooting

### Backend Won't Start

**Problem**: Error connecting to database
```bash
# Check if PostgreSQL is running
docker-compose ps
```
Should show `hrisa-mux-postgres` as "Up" and "healthy"

**Solution**: Restart Docker services
```bash
cd docker
docker-compose restart
```

### Frontend Won't Start

**Problem**: `NEXT_PUBLIC_API_URL is not defined`

**Solution**: Make sure `.env.local` exists in `apps/web/`
```bash
cat apps/web/.env.local
```
Should show: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### YouTube Search Not Working

**Problem**: "YouTube API key not configured" error

**Solution**: Add YouTube API key
1. Go to https://console.cloud.google.com
2. Create a project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `apps/api/.env`:
   ```env
   YOUTUBE_API_KEY=your-api-key-here
   ```
6. Restart backend: `cd apps/api && pnpm dev`

### File Upload Fails

**Problem**: Upload button doesn't work or files fail to upload

**Solution**: Check uploads directory
```bash
# Create uploads directory if it doesn't exist
mkdir -p apps/api/uploads
```

### CORS Errors in Browser Console

**Problem**: "Access-Control-Allow-Origin" errors

**Solution**: Verify CORS configuration in `apps/api/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```
Make sure it matches your frontend URL exactly.

### Database Connection Errors

**Problem**: "password authentication failed"

**Solution**: Verify `DATABASE_URL` in `apps/api/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrisa_mux
```

### Redis Connection Errors

**Problem**: "Redis connection failed"

**Solution**: Check if Redis is running
```bash
docker-compose ps
```
Should show `hrisa-mux-redis` as "Up" and "healthy"

## 🔍 Checking Logs

### Backend Logs
Backend logs appear in the terminal where you ran `pnpm dev`

### Frontend Logs
- **Server logs**: Terminal where you ran `pnpm dev`
- **Client logs**: Browser DevTools Console (F12)

### Docker Logs
```bash
# PostgreSQL logs
docker logs hrisa-mux-postgres

# Redis logs
docker logs hrisa-mux-redis
```

## 📊 Database Management

### View Database with Drizzle Studio

```bash
cd apps/api
pnpm db:studio
```

This opens a GUI at http://localhost:4983 where you can:
- View all tables
- Browse data
- Run queries
- Inspect schema

### Connect with psql

```bash
docker exec -it hrisa-mux-postgres psql -U postgres -d hrisa_mux
```

Useful commands:
- `\dt` - List all tables
- `\d users` - Describe users table
- `SELECT * FROM users;` - View all users
- `\q` - Quit

## 🎯 Test Scenarios

### Scenario 1: Music Discovery
1. Search for "chill music" on YouTube
2. Play the first result
3. Add it to your library
4. Create a "Chill Vibes" playlist
5. (Add the track to the playlist when feature is available)

### Scenario 2: Local Music Management
1. Upload 3 audio files
2. Play through all of them
3. Test shuffle mode
4. Test repeat modes
5. Delete one track
6. Verify it's removed from library

### Scenario 3: Multi-Source Queue
1. Add a local track to queue
2. Search and play a YouTube video
3. Search and play a SoundCloud track
4. View the queue - should show all 3 sources
5. Test next/previous navigation

### Scenario 4: Public Playlist Sharing
1. Create a public playlist
2. Add tracks from different sources
3. Share the playlist URL
4. Open in incognito/private window
5. Verify playlist is viewable

## ✅ Success Criteria

Your application is working correctly if:

- ✅ You can register and log in
- ✅ You can upload local music files
- ✅ You can search YouTube and SoundCloud
- ✅ You can play music from all three sources
- ✅ The audio player works (play, pause, seek, volume)
- ✅ You can create playlists
- ✅ Recently played tracks are saved and displayed
- ✅ The mobile responsive design works
- ✅ You can share public playlists
- ✅ All navigation and routing works

## 🎉 You're All Set!

Your Hrisa-Mux application is running locally and ready for testing. Enjoy exploring all the features you've built!

## 💡 Tips

- **Use real music files** for the best testing experience
- **Test with different file formats** (MP3, M4A, FLAC, WAV, OGG)
- **Try edge cases** like very long track names, large files, etc.
- **Test the queue** with many tracks to verify performance
- **Check browser console** for any errors or warnings

## 📝 Report Issues

If you find any bugs or issues:
1. Check the browser console for errors
2. Check the backend terminal for errors
3. Take screenshots of the issue
4. Note the steps to reproduce
5. Open an issue on GitHub (if applicable)

---

**Happy Testing! 🎵**
