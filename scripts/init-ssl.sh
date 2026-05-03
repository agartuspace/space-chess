#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# init-ssl.sh — First-time SSL bootstrap for Space Chess production
#
# Problem: nginx needs SSL certs to start, but certbot needs nginx
#          to serve the ACME challenge. Classic chicken-and-egg.
# Solution: create a temporary self-signed cert → start nginx →
#           obtain real Let's Encrypt cert → reload nginx.
#
# Usage:  sudo bash scripts/init-ssl.sh
# ────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${DOMAIN:-space-chess.agartu.space}"
EMAIL="${EMAIL:-admin@agartu.space}"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"

echo "═══════════════════════════════════════════════════════"
echo "  Space Chess — SSL Bootstrap for ${DOMAIN}"
echo "═══════════════════════════════════════════════════════"

# ── 1. Create directory structure for certbot volumes ────────────────────
echo ""
echo "→ Step 1/5: Creating certificate directories…"
mkdir -p ./certbot/conf/live/${DOMAIN}
mkdir -p ./certbot/www

# ── 2. Generate a temporary self-signed certificate ──────────────────────
echo "→ Step 2/5: Generating temporary self-signed certificate…"
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout ./certbot/conf/live/${DOMAIN}/privkey.pem \
  -out    ./certbot/conf/live/${DOMAIN}/fullchain.pem \
  -subj   "/CN=${DOMAIN}" \
  2>/dev/null

echo "  ✓ Temporary cert created"

# ── 3. Start the stack (nginx will use the self-signed cert) ─────────────
echo "→ Step 3/5: Starting Docker Compose stack…"
docker compose ${COMPOSE_FILES} up -d

echo "  Waiting 10s for nginx to become ready…"
sleep 10

# ── 4. Delete the self-signed cert and obtain a real one ─────────────────
echo "→ Step 4/5: Requesting Let's Encrypt certificate…"
# Remove self-signed cert
rm -rf ./certbot/conf/live/${DOMAIN}

docker compose ${COMPOSE_FILES} run --rm --entrypoint "" certbot \
  certbot certonly --webroot -w /var/www/certbot \
  -d ${DOMAIN} \
  --email ${EMAIL} \
  --agree-tos \
  --non-interactive \
  --force-renewal

echo "  ✓ Real certificate obtained"

# ── 5. Reload nginx to pick up the real certificate ─────────────────────
echo "→ Step 5/5: Reloading nginx…"
docker compose ${COMPOSE_FILES} exec nginx nginx -s reload

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✓ SSL bootstrap complete!"
echo "  Site: https://${DOMAIN}"
echo ""
echo "  Certbot auto-renewal runs inside the certbot"
echo "  container every 12 hours."
echo "═══════════════════════════════════════════════════════"
