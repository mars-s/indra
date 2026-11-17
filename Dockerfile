# Indra: small production image built from Next.js standalone output.
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS run
WORKDIR /app
# Bind to loopback by default. Run with --network host and put Tailscale Serve
# in front, or set HOSTNAME to the LAN/tailnet address. Never publish it publicly.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=127.0.0.1 \
    PORT=3000
RUN useradd --system --uid 1001 --no-create-home indra
COPY --from=build --chown=indra:indra /app/.next/standalone ./
COPY --from=build --chown=indra:indra /app/.next/static ./.next/static
USER indra
EXPOSE 3000
CMD ["node", "server.js"]
