#!/bin/bash
set -e

echo "🚀 TripGenie Setup Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
    fi
}

echo "Checking prerequisites..."
check_command docker
check_command docker-compose || check_command "docker compose"
check_command pnpm

# Check if .env.docker files exist
echo -e "\n${YELLOW}Checking environment files...${NC}"
if [ ! -f "apps/api/.env.docker" ]; then
    echo -e "${YELLOW}Creating apps/api/.env.docker from example...${NC}"
    cp apps/api/.env.example apps/api/.env.docker
    echo -e "${RED}⚠️  Please update apps/api/.env.docker with your API keys!${NC}"
fi

if [ ! -f "apps/web/.env.docker" ]; then
    echo -e "${YELLOW}Creating apps/web/.env.docker...${NC}"
    cat > apps/web/.env.docker << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_URL=http://api:8080
NODE_ENV=production
EOF
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
pnpm install

# Build Docker images
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker-compose -f infrastructure/docker-compose.yml build

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\nTo start the application, run:"
echo -e "  ${GREEN}make up${NC} or ${GREEN}docker-compose -f infrastructure/docker-compose.yml up${NC}"
echo -e "\nThe application will be available at:"
echo -e "  Web: ${GREEN}http://localhost:3000${NC}"
echo -e "  API: ${GREEN}http://localhost:8080${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:8080/docs${NC}"
echo -e "  Mailhog: ${GREEN}http://localhost:8025${NC}"