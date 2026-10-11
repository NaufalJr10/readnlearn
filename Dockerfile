# syntax=docker/dockerfile:1

# The image is built without a database: nothing in `next build` queries Postgres
# (the home page is force-dynamic), and `prisma generate` only reads the schema.
# DATABASE_URL and the other secrets are supplied when the container runs.

FROM node:24-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS builder
# Install first so the dependency layer is cached until the lockfile or schema changes.
# `npm ci` runs the postinstall `prisma generate`, which needs the schema and prisma.config.ts.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build
# server.ts normally runs through tsx (a dev dependency); compile it to plain CommonJS for production.
RUN npx tsc server.ts --outDir dist --module commonjs --moduleResolution node10 --target es2022 \
      --esModuleInterop --skipLibCheck --types node
RUN npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000
COPY --from=builder /app/package.json /app/next.config.ts /app/tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/server.js ./server.js
# .next must be writable: the runtime data cache (unstable_cache) lives in .next/cache.
COPY --from=builder --chown=node:node /app/.next ./.next

USER node
EXPOSE 3000
CMD ["node", "server.js"]
