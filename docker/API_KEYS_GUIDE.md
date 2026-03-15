# API Keys Setup Guide

The Hrisa-Mux app works without API keys, but returns empty search results. To enable YouTube and SoundCloud search, follow these steps:

## YouTube API Key (Optional)

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

### 2. Create API Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Click "Restrict Key" and limit it to:
   - Application restrictions: HTTP referrers
   - API restrictions: YouTube Data API v3

### 3. Add to Configuration
Edit `docker/.env` and add your key:
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

Then restart the API container:
```bash
docker compose -f docker/docker-compose.yml restart api
```

---

## SoundCloud Client ID (Optional)

### 1. Get a Client ID
SoundCloud has deprecated their official API, but you can use the unofficial scraper which doesn't require authentication. The client ID field can be left empty or you can find working client IDs online.

**Option 1: Leave Empty (Recommended)**
The `soundcloud-scraper` library will work without a client ID for most use cases.

**Option 2: Find a Working Client ID**
Search online for "soundcloud client id" and try different ones.

### 2. Add to Configuration
Edit `docker/.env`:
```env
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
```

Then restart the API container:
```bash
docker compose -f docker/docker-compose.yml restart api
```

---

## Verify Configuration

After adding API keys, test the endpoints:

```bash
# Test YouTube search
curl "http://localhost:3001/api/youtube/search?q=music&maxResults=5"

# Test SoundCloud search
curl "http://localhost:3001/api/soundcloud/search?q=music&maxResults=5"
```

You should see results instead of empty arrays.

---

## Rate Limits

### YouTube Data API v3
- **Free Quota**: 10,000 units/day
- **Search Operation**: 100 units
- **Max Searches/Day**: ~100 searches

If you exceed the quota, you'll get errors. Consider implementing user-based rate limiting or requesting a quota increase from Google.

### SoundCloud
- No official rate limits with the scraper
- Be respectful and don't spam requests

---

## Troubleshooting

### YouTube returns empty results
- Check API key is correct in `docker/.env`
- Verify YouTube Data API v3 is enabled in Google Cloud Console
- Check API key restrictions aren't blocking requests
- View API logs: `docker logs hrisa-mux-api`

### SoundCloud returns errors
- Try leaving `SOUNDCLOUD_CLIENT_ID` empty
- The library should work without authentication
- Check logs for specific error messages

### General Issues
```bash
# Check environment variables are loaded
docker exec hrisa-mux-api env | grep -E "YOUTUBE|SOUNDCLOUD"

# View detailed logs
docker logs hrisa-mux-api --tail 100

# Restart API container
docker compose -f docker/docker-compose.yml restart api
```
