# Hrisa-Mux Docker Setup

This directory contains the Docker configuration for running the complete Hrisa-Mux application stack.

## Services

The Docker Compose setup includes:

1. **PostgreSQL** - Database (port 5432)
2. **Redis** - Cache and session storage (port 6379)
3. **API** - Express.js backend (port 3001)
4. **Web** - Next.js frontend (port 3000)

## Quick Start

### 1. Environment Setup

Copy the example environment file:

```bash
cd docker
cp .env.example .env
```

Edit `.env` with your configuration (default values work for local testing).

### 2. Build and Run

From the project root:

```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up --build

# Or run in detached mode (background)
docker-compose -f docker/docker-compose.yml up --build -d
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Common Commands

### Start services
```bash
docker-compose -f docker/docker-compose.yml up
```

### Stop services
```bash
docker-compose -f docker/docker-compose.yml down
```

### View logs
```bash
# All services
docker-compose -f docker/docker-compose.yml logs -f

# Specific service
docker-compose -f docker/docker-compose.yml logs -f api
docker-compose -f docker/docker-compose.yml logs -f web
```

### Rebuild after code changes
```bash
# Rebuild all services
docker-compose -f docker/docker-compose.yml up --build

# Rebuild specific service
docker-compose -f docker/docker-compose.yml up --build api
```

### Clean up everything (including volumes)
```bash
docker-compose -f docker/docker-compose.yml down -v
```

## Database Management

### Run database migrations

```bash
# Access the API container
docker exec -it hrisa-mux-api sh

# Run migrations (inside container)
cd /app/apps/api
pnpm db:push
```

### Access PostgreSQL directly

```bash
docker exec -it hrisa-mux-postgres psql -U postgres -d hrisa_mux
```

### Access Redis CLI

```bash
docker exec -it hrisa-mux-redis redis-cli
```

## Development vs Production

### Development Mode (Current Setup)

- Uses `NODE_ENV=development`
- Hot reload may not work (requires volume mounts for source code)
- Good for testing the full stack in Docker

### For Active Development

If you need hot reload during development, consider:

1. Run only infrastructure in Docker:
   ```bash
   docker-compose -f docker/docker-compose.yml up postgres redis
   ```

2. Run app services locally:
   ```bash
   cd apps/api && pnpm dev
   cd apps/web && pnpm dev
   ```

### Production

For production deployment:

1. Update `.env` with production values
2. Change `NODE_ENV=production`
3. Use strong secrets for JWT tokens
4. Configure proper CORS origins
5. Set up reverse proxy (nginx) for HTTPS

## Troubleshooting

### Port already in use

If you get "port already allocated" errors:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process or stop the conflicting service
```

### Database connection issues

```bash
# Check if PostgreSQL is healthy
docker ps

# View PostgreSQL logs
docker logs hrisa-mux-postgres
```

### Rebuild from scratch

```bash
# Remove all containers, volumes, and rebuild
docker-compose -f docker/docker-compose.yml down -v
docker-compose -f docker/docker-compose.yml up --build
```

### Clear Docker build cache

```bash
docker builder prune -a
```

## File Upload Storage

Local file uploads are stored in a Docker volume mounted at:
- Host: `./apps/api/uploads`
- Container: `/app/apps/api/uploads`

Files persist between container restarts.

## Network

All services communicate through the `hrisa-mux-network` bridge network. Services can reference each other by their service names:

- `postgres` - Database host
- `redis` - Redis host
- `api` - Backend API
- `web` - Frontend

## Health Checks

PostgreSQL and Redis have health checks configured. The API and Web services will wait for the database to be ready before starting.

Check service health:
```bash
docker ps
```

Look for "healthy" status in the STATUS column.
