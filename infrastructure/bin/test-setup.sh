#!/bin/bash
set -e

echo "🧪 Testing TripGenie Setup"
echo "========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check services
check_service() {
    local service=$1
    local port=$2
    local url=$3
    
    echo -n "Checking $service on port $port... "
    
    if curl -f -s -o /dev/null "$url"; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not responding${NC}"
        return 1
    fi
}

echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

echo -e "\n${YELLOW}Testing services:${NC}"
check_service "Web Application" 3000 "http://localhost:3000/api/health"
check_service "API Server" 8080 "http://localhost:8080/healthz"
check_service "API Documentation" 8080 "http://localhost:8080/docs"
check_service "Mailhog" 8025 "http://localhost:8025"

echo -e "\n${YELLOW}Testing API endpoints:${NC}"

# Test health endpoint
echo -n "Testing /healthz endpoint... "
if curl -s http://localhost:8080/healthz | grep -q "ok"; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

# Test readiness endpoint
echo -n "Testing /readyz endpoint... "
if curl -s http://localhost:8080/readyz | grep -q "ready"; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${RED}✗ Not ready${NC}"
fi

echo -e "\n${GREEN}✅ Setup test complete!${NC}"
echo -e "\nYou can now access:"
echo -e "  Web: ${GREEN}http://localhost:3000${NC}"
echo -e "  API: ${GREEN}http://localhost:8080${NC}"
echo -e "  Docs: ${GREEN}http://localhost:8080/docs${NC}"
echo -e "  Email: ${GREEN}http://localhost:8025${NC}"