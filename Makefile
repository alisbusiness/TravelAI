.PHONY: up down logs ps restart clean build dev

# Docker compose commands
up:
	docker-compose -f infrastructure/docker-compose.yml up --build

down:
	docker-compose -f infrastructure/docker-compose.yml down -v

logs:
	docker-compose -f infrastructure/docker-compose.yml logs -f

ps:
	docker-compose -f infrastructure/docker-compose.yml ps

restart:
	make down
	make up

clean:
	docker-compose -f infrastructure/docker-compose.yml down -v
	docker system prune -f

build:
	docker-compose -f infrastructure/docker-compose.yml build --no-cache

# Development commands
dev:
	docker-compose -f infrastructure/docker-compose.yml up postgres redis mailhog -d
	cd apps/api && pnpm dev &
	cd apps/web && pnpm dev

install:
	pnpm install

# Database commands
db-migrate:
	cd apps/api && pnpm prisma:migrate:dev

db-seed:
	cd apps/api && pnpm seed

db-studio:
	cd apps/api && pnpm prisma:studio