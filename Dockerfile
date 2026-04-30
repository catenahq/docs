# apps/docs -- docs.catena.run
#
# Multi-stage. Build the Starlight static site, serve dist/ from
# nginx:alpine. Same build-context-must-be-repo-root caveat as
# apps/marketing (workspace deps live outside apps/docs/).

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY apps/docs/package.json apps/docs/
COPY packages/brand/package.json packages/brand/
COPY packages/i18n/package.json packages/i18n/

RUN npm install --workspaces --include-workspace-root --no-audit --no-fund

COPY apps/docs apps/docs
COPY packages/brand packages/brand
COPY packages/i18n packages/i18n

WORKDIR /repo/apps/docs
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:alpine AS serve
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/docs/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1/ || exit 1

EXPOSE 80
