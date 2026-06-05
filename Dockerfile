# --- STAGE 1: Build Backend (Server) ---
FROM node:20.11-alpine AS server-builder
WORKDIR /app/server

RUN echo "registry=https://registry.npmjs.org/" > .npmrc

# Copy and install dependencies in the isolated server directory
COPY server/package*.json ./
RUN npm install --no-audit --no-fund

# Copy the entire server project and compile TypeScript
COPY server/ ./
RUN npm run build


# --- STAGE 2: Production Runtime (Server Only) ---
FROM node:20.11-alpine
WORKDIR /app

ENV NODE_ENV=production

RUN echo "registry=https://registry.npmjs.org/" > .npmrc

# Install only production dependencies
COPY server/package*.json ./
RUN npm install --only=production --no-audit --no-fund

# Copy compiled server
COPY --from=server-builder /app/server/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]