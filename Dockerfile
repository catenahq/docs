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
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1/ || exit 1

EXPOSE 80
