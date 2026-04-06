# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

LABEL maintainer="MeowVault Team"
LABEL description="MeowVault Backend API"

ENV NODE_ENV=production

WORKDIR /app

# Только production зависимости
COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/src/generated/ ./src/generated/  
COPY --from=builder /app/shared/ ./shared/                 
COPY prisma.config.ts ./                                   

COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

