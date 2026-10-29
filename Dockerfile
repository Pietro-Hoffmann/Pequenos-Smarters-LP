# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Imagem da landing page do Pequenos Smarters — Next.js 16, App Router.
#
# Três estágios, para a imagem final não carregar nada que só serviu para
# construir: dependências → build → execução.
#
# Como rodar na mão, se precisar depurar fora do painel:
#   docker build -t ps-lp .
#   docker run --rm -p 3000:3000 ps-lp
# ---------------------------------------------------------------------------
ARG NODE_VERSION=24-alpine

# --- 1. dependências -------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# O npm é fixado de propósito. O npm 10.9.9, que acompanha algumas imagens
# do Node, quebra ao montar árvores maiores com
# "Cannot read properties of null (reading 'edgesOut')" — não é conflito de
# dependência, é defeito do resolvedor daquela versão. Já custou um dia de
# build em outro projeto desta casa; fixar aqui tira a surpresa se a imagem
# base mudar.
RUN npm install -g npm@11.16.0

COPY package.json package-lock.json ./
# npm ci, e não npm install: o lockfile É versionado neste repositório, então
# o build é reprodutível. (Se um dia o lockfile sair do repo, isto quebra —
# troque por `npm install` junto com a mudança.)
RUN npm ci

# --- 2. build --------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- 3. execução -----------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ARG GIT_SHA=desconhecido
LABEL org.opencontainers.image.revision=$GIT_SHA
LABEL org.opencontainers.image.title="Pequenos Smarters — landing page"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Escutar em todas as interfaces. Dentro de um contêiner, 127.0.0.1 não
# recebe nada de fora, e a aplicação pareceria "no ar" sem responder.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# A saída autônoma traz o servidor e as dependências dele. public/ e
# .next/static ficam de fora dela e são copiados aqui — sem estes dois a
# página sobe sem CSS e sem imagem nenhuma.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
