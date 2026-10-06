FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# stage 2

FROM node:22-alpine AS production

ENV NODE_ENV=production 

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist


EXPOSE 3000

USER node

CMD ["node","dist/server.js"]



FROM node:22-alpine AS migration

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

RUN npm ci --legacy-peer-deps


CMD ["npx", "tsx", "scripts/migrate-all.ts"]
