FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Eliminamos temporalmente 'npm ci' en Docker hasta que soluciones el archivo local
RUN npm install

COPY . .
RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3040

COPY package*.json ./
# Usamos install con flag de producción para evitar conflictos de sincronización estrictos
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
