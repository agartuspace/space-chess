.PHONY: dev prod logs stop clean migrate seed shell-backend shell-frontend ssl-init

# ─── Development ─────────────────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-d:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# ─── Production ───────────────────────────────────────────────────────────────
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

prod-build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# ─── Logs ─────────────────────────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-nginx:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f nginx

# ─── Lifecycle ────────────────────────────────────────────────────────────────
stop:
	docker compose down

clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# ─── Database ─────────────────────────────────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head

migrate-new:
	@read -p "Migration name: " name; \
	docker compose exec backend alembic revision --autogenerate -m "$$name"

seed:
	docker compose exec backend python -m app.scripts.seed

# ─── Shells ───────────────────────────────────────────────────────────────────
shell-backend:
	docker compose exec backend bash

shell-frontend:
	docker compose exec frontend sh

shell-db:
	docker compose exec postgres psql -U chess -d chess_db

# ─── SSL (run once on fresh VPS) ─────────────────────────────────────────────
ssl-init:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
		certbot certonly --webroot -w /var/www/certbot \
		-d space-chess.agartu.space \
		--email admin@agartu.space \
		--agree-tos \
		--non-interactive

# ─── Local frontend dev (without Docker) ─────────────────────────────────────
fe-dev:
	cd frontend && npm run dev

fe-build:
	cd frontend && npm run build

fe-install:
	cd frontend && npm install
