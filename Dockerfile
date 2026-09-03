# استفاده از Node 20 (با Alpine برای حجم کمتر)
FROM node:20-alpine AS base

# نصب وابستگی‌های سیستمی (در صورت نیاز)
RUN apk add --no-cache libc6-compat

# مرحله‌ی وابستگی‌ها
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# مرحله‌ی build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# غیرفعال کردن SWC در محیط build
ENV NEXT_DISABLE_SWC=true

RUN npm run build

# مرحله‌ی اجرا (production)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_DISABLE_SWC=true

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
