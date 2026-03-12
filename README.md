# Hrisa-Mux 🎵

A Spotify-like music streaming application that allows users to browse and stream music from YouTube, SoundCloud, and upload their own local music files.

## ✨ Features

- 🎵 **Multi-Source Streaming**: Stream music from YouTube, SoundCloud, and uploaded local files
- 📚 **Playlist Management**: Create, edit, delete, and share playlists (public/private)
- 🔐 **User Authentication**: Secure JWT-based authentication with refresh tokens
- 📤 **File Upload**: Upload MP3, M4A, FLAC, WAV, OGG with automatic metadata extraction
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js 14 and Tailwind CSS
- 🎧 **Advanced Player**: Queue management, shuffle, repeat modes, volume control, Media Session API
- 🔍 **Powerful Search**: Search across YouTube and SoundCloud with tabbed interface
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- 🕐 **Recently Played**: Track and display recently played songs
- 🔗 **Public Sharing**: Share public playlists with copy-to-clipboard

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** (@tanstack/react-query) for server state management
- **Axios** for HTTP requests
- **react-hot-toast** for notifications
- **react-dropzone** for file uploads

### Backend
- **Node.js** with **Express.js**
- **TypeScript**
- **PostgreSQL** with **Drizzle ORM**
- **Redis** for caching and sessions
- **JWT** with HTTP-only cookies
- **@distube/ytdl-core** for YouTube streaming
- **soundcloud-scraper** for SoundCloud streaming
- **music-metadata** for audio file metadata extraction
- **Multer** for file uploads
- **Zod** for validation

### Infrastructure
- **Docker** for PostgreSQL and Redis
- **Turborepo** for monorepo management
- **pnpm** for package management

## Project Structure

```
Hrisa-Mux/
├── apps/
│   ├── web/              # Next.js frontend application
│   └── api/              # Express backend API
├── packages/
│   ├── shared/           # Shared TypeScript types and utilities
│   └── config/           # Shared configuration files
├── docker/               # Docker configurations
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   └── Dockerfile.api
├── .env.example          # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** 8+
- **Docker** and **Docker Compose** (for local PostgreSQL and Redis)
- **YouTube Data API Key** (optional, for YouTube search)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mahdisellami/Hrisa-Mux.git
   cd Hrisa-Mux
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start Docker services** (PostgreSQL & Redis)
   ```bash
   cd docker
   docker-compose up -d
   ```

   This will start:
   - **PostgreSQL** on port `5432`
   - **Redis** on port `6379`

4. **Set up environment variables**

   **Backend** (`apps/api/.env`):
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

   Edit `apps/api/.env` and set:
   ```env
   # Generate strong secrets for JWT tokens
   JWT_SECRET=your-super-secret-jwt-key
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

   # Optional: YouTube API key for search
   YOUTUBE_API_KEY=your-youtube-api-key
   ```

   **Frontend** (`apps/web/.env.local`):
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm db:push
   ```

6. **Start development servers**
   ```bash
   # From root directory
   pnpm dev
   ```

   This will start:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001

7. **Open the application**

   Navigate to **http://localhost:3000** and register a new account!

## Development

### Available Scripts

From the root directory:

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests
- `pnpm clean` - Clean all build artifacts

### Backend (apps/api)

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate database migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

### Frontend (apps/web)

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT token generation
- `YOUTUBE_API_KEY` - YouTube Data API key
- `SOUNDCLOUD_CLIENT_ID` - SoundCloud API client ID
- `STORAGE_TYPE` - Storage type (`local` or `s3`)

## Architecture

### Audio Player

The application uses an **Adapter Pattern** to provide a unified interface for streaming from multiple sources:

- **YouTubeAdapter**: Extracts stream URLs from YouTube videos
- **SoundCloudAdapter**: Streams tracks from SoundCloud
- **LocalFileAdapter**: Serves uploaded audio files

### Database Schema

- **users**: User accounts and authentication
- **playlists**: User-created playlists
- **tracks**: Music tracks from all sources
- **playlist_tracks**: Junction table for playlist-track relationships
- **user_preferences**: User settings and preferences

### API Routes

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/playlists` - Playlist CRUD operations
- `/api/tracks` - Track management
- `/api/youtube` - YouTube search and streaming
- `/api/soundcloud` - SoundCloud search and streaming
- `/api/upload` - File upload handling

## 🚢 Deployment

### Backend Deployment (Render)

1. **Create PostgreSQL Database** on Render:
   - Go to Render Dashboard → New → PostgreSQL
   - Choose a name and region
   - Copy the **Internal Database URL**

2. **Create Redis Instance** on Render:
   - Go to New → Redis
   - Choose a name and region
   - Copy the **Internal Redis URL**

3. **Deploy Backend**:
   - Go to New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: hrisa-mux-api
     - **Environment**: Node
     - **Region**: Same as database
     - **Branch**: main
     - **Root Directory**: `apps/api`
     - **Build Command**: `pnpm install && pnpm build`
     - **Start Command**: `pnpm start`

4. **Add Environment Variables**:
   ```env
   NODE_ENV=production
   API_PORT=3001
   API_URL=https://your-backend.onrender.com
   WEB_URL=https://your-frontend.vercel.app

   DATABASE_URL=<Internal Database URL from step 1>
   REDIS_URL=<Internal Redis URL from step 2>

   JWT_SECRET=<generate strong secret>
   REFRESH_TOKEN_SECRET=<generate strong secret>

   # Optional
   YOUTUBE_API_KEY=<your-youtube-api-key>
   SOUNDCLOUD_CLIENT_ID=<your-soundcloud-client-id>

   STORAGE_TYPE=local
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. **Deploy**: Click "Create Web Service"

### Frontend Deployment (Vercel)

1. **Import Project**:
   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && cd apps/web && pnpm build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `pnpm install`

3. **Add Environment Variable**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy**: Click "Deploy"

5. **Update Backend CORS**:
   - Go back to Render backend settings
   - Update `WEB_URL` and `CORS_ORIGIN` with your Vercel URL
   - Redeploy backend

### Post-Deployment

1. **Test the application**:
   - Visit your Vercel URL
   - Register a new account
   - Try uploading a file
   - Try searching YouTube/SoundCloud

2. **Common Issues**:
   - **CORS errors**: Verify `CORS_ORIGIN` matches your Vercel URL
   - **Database errors**: Check `DATABASE_URL` is correct
   - **YouTube not working**: Add `YOUTUBE_API_KEY`

### Generating Secrets

Generate strong JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ using modern web technologies
