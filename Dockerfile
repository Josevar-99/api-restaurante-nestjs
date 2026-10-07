# 1. Etapa de compilación (Builder) usando Node 22 para compatibilidad de paquetes
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Eliminamos temporalmente 'npm ci' en Docker hasta que soluciones el archivo local
RUN npm install

COPY . .
RUN npm run build

# 2. Etapa de producción usando también Node 22 para evitar fallos de EBADENGINE
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3040

COPY package*.json ./
# Usamos install con flag de producción para evitar conflictos de sincronización estrictos
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
