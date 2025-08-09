# 🚀 TripGenie Quick Start Guide

## Prerequisites Check
```bash
docker --version  # Should be 20.10+
docker-compose --version  # Should be 1.29+
node --version  # Should be 20+
pnpm --version  # Should be 9.7+
```

## Step 1: Clone & Setup
```bash
git clone <repository-url>
cd tripgenie
```

## Step 2: Configure API Keys
```bash
# Edit the Docker environment file
nano apps/api/.env.docker

# Replace these values:
# OPENAI_API_KEY=<your-openai-api-key>
# STRIPE_SECRET_KEY=<your-stripe-test-key> (optional)
```

## Step 3: Run Setup Script
```bash
./infrastructure/bin/setup.sh
```

## Step 4: Start the Application
```bash
make up
# OR
docker-compose -f infrastructure/docker-compose.yml up --build
```

## Step 5: Verify Everything is Running
```bash
# In a new terminal:
./infrastructure/bin/test-setup.sh
```

## 🎯 Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | Main application |
| API | http://localhost:8080 | Backend API |
| API Docs | http://localhost:8080/docs | Swagger documentation |
| Mailhog | http://localhost:8025 | Email testing interface |

## 🧪 Test the Flow

### 1. Login with Magic Link
- Go to http://localhost:3000
- Enter any email address
- Open http://localhost:8025 (Mailhog)
- Click the magic link in the email

### 2. Create a Free Trip
- Click "Create Trip"
- Enter: "Paris", "5 days", "December 2024"
- View the generated itinerary (uses GPT-4o-mini)

### 3. Upgrade to Premium
- Click "Go Premium"
- Use test card: 4242 4242 4242 4242
- Any future date, any CVC

### 4. Create a Premium Trip
- Create another trip
- Notice the higher quality output (uses GPT-4o)

## 🛑 Stop the Application
```bash
make down
# OR
docker-compose -f infrastructure/docker-compose.yml down -v
```

## 🔧 Troubleshooting

### Docker Issues
```bash
# Reset everything
make clean
docker system prune -a --volumes
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000
lsof -i :8080
```

### Database Issues
```bash
# Reset database
make down
make up
```

### API Key Issues
- Ensure OPENAI_API_KEY is valid
- Check logs: `make logs`

## 📚 Common Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | View logs |
| `make ps` | List running containers |
| `make restart` | Restart everything |
| `make clean` | Clean up everything |

## 🎉 Success!
If you can access http://localhost:3000 and see the TripGenie interface, you're all set!