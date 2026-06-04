# --- STAGE 1: Build everything ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install ALL dependencies (including devDependencies for compilation)
RUN npm install && npm install --prefix server && npm install --prefix client

# Copy source code
COPY server/src ./server/src
COPY server/tsconfig.json ./server/
COPY client/src ./client/src
COPY client/public ./client/public
COPY client/index.html ./client/
COPY client/vite.config.ts ./client/
COPY client/tsconfig*.json ./client/

# Build both server and client
RUN npm run build --prefix server
RUN npm run build --prefix client

# --- STAGE 2: Lightweight Production Runtime ---
FROM node:20-alpine
WORKDIR /app/server

# Copy production package files
COPY package*.json ../
COPY server/package*.json ./

# Install ONLY production dependencies for server
RUN npm install --production

# Copy built assets from builder
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ../client/dist

EXPOSE 8080

CMD ["node", "dist/server.js"]