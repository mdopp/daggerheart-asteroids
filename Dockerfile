# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (cached unless package.json changes)
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund 2>&1 | tail -1

# Build static assets (cached unless source changes)
COPY vite.config.js ./
COPY index.html ./
COPY src/ ./src/
RUN npx vite build --loglevel silent

# Production stage — minimal runtime
FROM node:20-alpine
LABEL org.opencontainers.image.source="https://github.com/mdopp/daggerheart-asteroids"
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund 2>&1 | tail -1

COPY --from=build /app/dist ./dist
COPY server.js ./
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["node", "server.js"]
