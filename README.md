# Hrisa-Mux

A modern, Spotify-like music streaming web application that allows users to browse and stream music from YouTube, SoundCloud, and manage their own local music library.

## Features

- 🎵 **Multi-Source Streaming**: Stream music from YouTube, SoundCloud, and uploaded local files
- 📚 **Playlist Management**: Create, edit, and organize your playlists
- 🔐 **User Authentication**: Secure JWT-based authentication
- 📤 **File Upload**: Upload and manage your local music collection
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🔄 **Real-time Updates**: WebSocket support for live updates
- 🎧 **Unified Player**: Seamless playback across all music sources

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **Axios** for HTTP requests

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **Redis** for caching and sessions
- **JWT** for authentication
- **Multer** for file uploads
- **ytdl-core** for YouTube integration
- **soundcloud-scraper** for SoundCloud integration

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

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** and **Docker Compose** (for databases)

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services** (PostgreSQL & Redis)
   ```bash
   cd docker
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm db:migrate
   ```

6. **Start development servers**
   ```bash
   # From root directory
   pnpm dev
   ```

   This will start:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001

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
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
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

## Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build images
docker build -f docker/Dockerfile.web -t hrisa-mux-web .
docker build -f docker/Dockerfile.api -t hrisa-mux-api .

# Run containers
docker run -p 3000:3000 hrisa-mux-web
docker run -p 3001:3001 hrisa-mux-api
```

### Production Deployment

Recommended platforms:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, AWS
- **Database**: Supabase, Railway, AWS RDS
- **Storage**: AWS S3, Cloudflare R2

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
