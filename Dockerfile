# ─── Stage 1: Compile JS ──────────────────────────────────────────────────────
# Runs on the build platform (host), not the target — avoids QEMU overhead
# for the expensive webpack/TypeScript compilation step.
FROM --platform=$BUILDPLATFORM node:20-alpine AS build

ENV SHARP_FORCE_GLOBAL_LIBVIPS=true

# Use Alpine's pre-built libvips (no compilation from source needed)
RUN apk add --no-cache python3 g++ make vips-dev

WORKDIR /app

COPY server/ server/
COPY client/ client/
COPY rest-api/ rest-api/
COPY package.json package-lock.json* ./

RUN npm ci
RUN npm run build

# ─── Stage 2: Production server dependencies (target platform) ────────────────
# Must run on the target platform so native modules (sharp, better-sqlite3)
# are compiled for the correct architecture.
FROM node:20-alpine AS prod-deps

ENV SHARP_FORCE_GLOBAL_LIBVIPS=true

RUN apk add --no-cache python3 g++ make vips-dev

WORKDIR /server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev

# ─── Stage 3: Final runtime image ─────────────────────────────────────────────
# Use plain alpine (not node:20-alpine) so uid 1000 is free for the 'abc' user.
# node:20-alpine ships with a 'node' user at uid 1000 which conflicts.
FROM node:20-alpine AS node-bin
FROM alpine:3.20

RUN apk add --no-cache curl shadow su-exec vips \
    && groupadd --gid 1000 abc \
    && useradd --create-home --uid 1000 --gid abc abc

# Copy node runtime from the node image
COPY --from=node-bin /usr/local/bin/node /usr/local/bin/
COPY --from=node-bin /usr/lib/ /usr/lib/

WORKDIR /storage
VOLUME /storage

WORKDIR /assets
VOLUME /assets

WORKDIR /logs
VOLUME /logs

WORKDIR /app

COPY --from=build /app/server/public public
COPY --from=build /app/server/build build
COPY --from=prod-deps /server/node_modules node_modules
COPY server/package.json ./
COPY docker/entrypoint.sh /docker/entrypoint.sh

ENV PORT=7481
EXPOSE $PORT

ENV PUID=1000
ENV PGID=1000
ENV SHARP_FORCE_GLOBAL_LIBVIPS=true
ENV DATABASE_PATH="/storage/data.db"
ENV ASSETS_PATH="/assets"
ENV LOGS_PATH="/logs"
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl ${HOSTNAME}:${PORT}

ENTRYPOINT ["sh", "/docker/entrypoint.sh"]
