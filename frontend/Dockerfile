# Stage 1: Dependencies
FROM node:20-alpine AS deps
# node:20-alpine defaults to non-root; installs need write access to /app
USER root
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Stage 2: Builder
FROM node:20-alpine AS builder
USER root
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
USER root
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Image already defines nextjs (uid 1001) and nodejs (gid 1001); do not addgroup/adduser

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
