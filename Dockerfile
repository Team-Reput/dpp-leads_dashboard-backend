# ---- Base ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the backend source
COPY . .

# Elastic Beanstalk's nginx proxies to the EXPOSEd port, so the app MUST
# listen on the same one. Keep these two in sync (and don't override PORT
# in the EB environment properties with a different value).
ENV PORT=5000
EXPOSE 5000

# .env is NOT copied in (it's gitignored) — pass real values via
# `docker run --env-file .env` or your orchestrator's secrets/env config
CMD ["node", "server.js"]
