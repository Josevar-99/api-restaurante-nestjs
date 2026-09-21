# Restaurant API

Backend para gestión de reservas, pedidos y operación de un restaurante.

Autor: Jose Vargas

## Stack

- Node.js + TypeScript
- NestJS 12
- PostgreSQL + TypeORM
- Docker / Docker Compose
- Swagger (OpenAPI)

## Requisitos previos

- Node.js 20+
- Docker y Docker Compose

## Instalación

\`\`\`bash
git clone <url-del-repo>
cd restaurant-api
npm install
cp .env.example .env
\`\`\`

Ajusta los valores de `.env` según tu entorno.

## Levantar el proyecto

\`\`\`bash
docker compose up -d --build
\`\`\`

La API queda disponible en `http://localhost:3000/api/v1`.

## Documentación de la API

Swagger disponible en `http://localhost:3000/api/docs`.

## Health check

\`\`\`bash
curl http://localhost:3000/api/v1/health
\`\`\`

## Desarrollo local (sin Docker para la API)

\`\`\`bash
docker compose up -d postgres
npm run start:dev
\`\`\`

## Scripts disponibles

- `npm run start:dev` — modo desarrollo con recarga automática
- `npm run build` — compila el proyecto
- `npm run lint` — corre oxlint
- `npm run test` — corre pruebas con Vitest
- `npm run format` — formatea con Prettier

## Estructura del proyecto

\`\`\`
src/
├── config/          # Configuración y validación de variables de entorno
├── modules/         # Módulos de dominio (health, reservas, pedidos, etc.)
└── main.ts
\`\`\`