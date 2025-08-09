# TripGenie - AI-Powered Travel Planning Platform

A full-stack, dockerized monorepo application for AI-powered travel planning with Free (GPT-3.5 Turbo) and Premium (GPT-4) tiers.

## 🚀 Quick Start (Ubuntu)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ 
- pnpm 9.7.0+

```bash
# Install Docker (Ubuntu)
sudo apt update
sudo apt install docker.io docker-compose-v2
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install pnpm
npm install -g pnpm@9.7.0
```

### 🏃 One-Command Setup

```bash
# Clone the repository
git clone <repo>
cd tripgenie

# Run setup script
./infrastructure/bin/setup.sh

# IMPORTANT: Update your API keys in apps/api/.env.docker
# - Add your OpenAI API key
# - Add your Stripe test keys (optional)

# Start the entire stack
make up
# OR
docker-compose -f infrastructure/docker-compose.yml up --build
```

### 🌐 Access Points

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **Mailhog (Email Testing)**: http://localhost:8025
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📁 Project Structure

```
tripgenie/
├── apps/
│   ├── api/          # Fastify backend with Prisma ORM
│   └── web/          # Next.js 14 frontend
├── infrastructure/
│   ├── docker-compose.yml
│   └── bin/
│       └── setup.sh
├── package.json      # Root monorepo config
├── pnpm-workspace.yaml
└── Makefile
```

## 🧪 Demo Flow

1. **Magic Link Login**
   - Go to http://localhost:3000
   - Enter your email
   - Check Mailhog at http://localhost:8025 for the magic link
   - Click the link to login

2. **Create a Trip (Free Tier)**
   - Click "Create Trip"
   - Enter destination and dates
   - Free tier uses GPT-3.5 Turbo
   - View generated itinerary

3. **Upgrade to Premium**
   - Click "Go Premium"
   - Redirects to Stripe checkout (test mode)
   - Use test card: 4242 4242 4242 4242
   - After payment, returns to app

4. **Create Trip (Premium Tier)**
   - Now uses GPT-4 for better quality
   - Price alerts enabled
   - Advanced features unlocked

5. **Share Trip**
   - Click "Share" on any trip
   - Get public URL
   - Works without authentication

## 🛠️ Development

### Local Development (without Docker)

```bash
# Install dependencies
pnpm install

# Start databases
docker compose -f infrastructure/docker-compose.yml up postgres redis mailhog -d

# Run migrations
cd apps/api && pnpm prisma:migrate:dev

# Start API (Terminal 1)
cd apps/api && pnpm dev

# Start Web (Terminal 2)
cd apps/web && pnpm dev
```

### Useful Commands

```bash
# Docker commands
make up          # Start all services
make down        # Stop and remove containers
make logs        # View logs
make ps          # List containers
make restart     # Restart all services
make clean       # Clean everything

# Database commands
make db-migrate  # Run migrations
make db-seed     # Seed database
make db-studio   # Open Prisma Studio

# Development
make dev         # Run in development mode
make install     # Install dependencies
```

## 🔧 Configuration

### Environment Variables

#### API (`apps/api/.env.docker`)
- `OPENAI_API_KEY` - **Required**: Your OpenAI API key
- `OPENAI_MODEL` - Premium model (default: gpt-4)
- `OPENAI_MODEL_LIGHT` - Free model (default: gpt-3.5-turbo)
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_ACCESS_SECRET` - JWT secret for access tokens
- `JWT_REFRESH_SECRET` - JWT secret for refresh tokens

#### Web (`apps/web/.env.docker`)
- `NEXT_PUBLIC_API_URL` - Public API URL (browser)
- `NEXT_PUBLIC_APP_URL` - Public app URL
- `INTERNAL_API_URL` - Internal API URL (SSR)

## 🏗️ Architecture

### Backend (Fastify + Prisma)
- RESTful API with OpenAPI documentation
- JWT authentication with refresh tokens
- Magic link authentication
- BullMQ for job processing
- Stripe integration for payments
- Multi-provider travel data aggregation

### Frontend (Next.js 14)
- App Router with RSC support
- Tailwind CSS for styling
- Zustand for state management
- React Query for data fetching
- shadcn/ui components

### Infrastructure
- PostgreSQL 16 for data persistence
- Redis 7 for caching and queues
- Mailhog for email testing
- Docker Compose orchestration
- Health checks and monitoring

## 🔐 Authentication Flow

1. User requests magic link
2. API sends email with signed token
3. User clicks link → Frontend verifies
4. JWT tokens set as httpOnly cookies
5. Automatic token refresh on 401

## 💳 Payment Integration

- Stripe Checkout for subscriptions
- Test mode by default
- Webhook handling for events
- Free vs Premium model selection

## 🚢 Production Deployment

### Using Docker

1. Update environment variables for production
2. Set proper secrets and API keys
3. Use external PostgreSQL and Redis
4. Configure proper domain and SSL
5. Set `NODE_ENV=production`

### Health Checks

- API: `GET /healthz` and `/readyz`
- Web: `GET /api/health`
- Metrics: `GET /metrics` (Prometheus format)

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :8080

# Kill the process or change ports in docker-compose.yml
```

**Permission denied (Docker)**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

**Database connection issues**
```bash
# Check if PostgreSQL is running
docker compose -f infrastructure/docker-compose.yml ps
# Check logs
docker compose -f infrastructure/docker-compose.yml logs postgres
```

**Build failures**
```bash
# Clean and rebuild
make clean
make build
```

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Next.js, Fastify, Prisma, and Docker