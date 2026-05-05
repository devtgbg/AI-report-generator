# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the Vite frontend ----------
FROM node:22-alpine AS build

WORKDIR /app

# Install ALL deps (including devDependencies — Vite is a devDep)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build-time env for Vite. Coolify passes this via --build-arg.
# In production this should be "/api" so the deployed frontend hits the
# same domain that Express serves the app from.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Vite reads NODE_ENV=production internally for optimizations, but we
# don't want it set during npm ci above. Setting it here is safe.
ENV NODE_ENV=production
RUN npm run build


# ---------- Stage 2: production runtime ----------
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7104

# Install ONLY production dependencies for the Express server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the built frontend and the server code
COPY --from=build /app/dist ./dist
COPY server ./server

EXPOSE 7104

# Optional but useful: surface app errors with a non-zero exit
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O- http://localhost:${PORT}/health > /dev/null || exit 1

CMD ["node", "server/index.js"]
