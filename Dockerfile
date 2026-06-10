# catenahq/docs -- docs.catena.run
#
# Multi-stage Astro+Starlight static build -> nginx:alpine serving dist/.
# Standalone repo: build context is the repo root.

# ---- Stage 1: build ----
FROM node:26-alpine AS build
WORKDIR /app

# Install deps first so source changes don't invalidate the cache.
# @catenahq/contracts is vendored as a tarball under vendor/.
COPY package.json package-lock.json* ./
COPY vendor ./vendor
RUN npm ci --no-audit --no-fund

# Copy source + build.
COPY . .
RUN npm run build

# ---- Stage 2: serve ----
# nginx-unprivileged runs as UID 101 (non-root). A non-root user cannot bind
# ports < 1024, so the listener moves to 8080. trivy DS-0002 wants an explicit
# USER directive in the Dockerfile (it does not inspect the base image's user),
# so set it explicitly even though the base already drops to nginx.
FROM nginxinc/nginx-unprivileged:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/ || exit 1

EXPOSE 8080
