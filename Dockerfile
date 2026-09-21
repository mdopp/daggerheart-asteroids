FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY vite.config.js ./
COPY index.html ./
COPY src/ ./src/
RUN npm install 2>&1 | tail -1
RUN npx vite build 2>&1 | tail -3

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev 2>&1 | tail -1
COPY --from=build /app/dist ./dist
COPY server.js ./
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
