FROM node:20.19.5-bullseye-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# GitHub Actions 将构建产物准备在构建上下文根目录
# 包含: server.js, package.json, node_modules, .next/ 等
COPY . ./

EXPOSE 3000

CMD ["node", "server.js"]

######################################################################
# # 多阶段构建优化版
# FROM node:20-alpine AS deps
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production && npm cache clean --force

# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN npm run build

# FROM node:20-alpine AS runner
# WORKDIR /app

# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001

# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# USER nextjs

# EXPOSE 3000

# ENV PORT=3000
# ENV HOSTNAME="0.0.0.0"

# CMD ["node", "server.js"]