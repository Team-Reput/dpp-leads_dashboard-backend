# ---- Base ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the backend source
COPY . .

# Express server listens on this port (matches your server.js PORT fallback)
EXPOSE 4000

# .env is NOT copied in (it's gitignored) — pass real values via
# `docker run --env-file .env` or your orchestrator's secrets/env config
CMD ["node", "server.js"]