# Dockerfile
FROM node:20.19.5-bullseye AS base
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json ./
# 假设 standalone 输出目录为 standalone, 其内部结构通常已包含 node_modules
COPY --from=build /app/standalone ./
COPY --from=build /app/standalone/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"] # 使用 standalone 模式生成的 server.js

# FROM nginx-proxy-manager/nginx-proxy-manager:latest AS base
# # 安装依赖
# FROM base AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci --only=production

# # 构建应用
# FROM base AS builder
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# # 生产镜像
# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV production

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# USER nextjs

# EXPOSE 3000

# ENV PORT 3000

# CMD ["node", "server.js"]
