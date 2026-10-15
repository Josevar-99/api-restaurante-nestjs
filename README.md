# Restaurant API

Backend para gestión de reservas, pedidos y operación de un restaurante.

Autor: Jose Vargas

## Stack

- Node.js + TypeScript
- NestJS 12
- PostgreSQL 13+ y TypeORM (migraciones versionadas)
- Docker / Docker Compose
- Swagger (OpenAPI)

## Requisitos previos

- Node.js 24+
- Docker y Docker Compose

## Instalación

```bash
git clone <url-del-repo>
cd api-restaurante-nestjs
npm install
cp .env.example .env
```

## Variables de entorno

Todas las variables son obligatorias: el proyecto no define valores por defecto para las credenciales.

```env
NODE_ENV=development
PORT=3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=restaurant_db
POSTGRES_USER=restaurant_user
POSTGRES_PASSWORD=changeme

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

`POSTGRES_HOST=localhost` es el valor para ejecutar la app, el CLI de migraciones o los seeds desde tu máquina. Dentro de Docker Compose el host es `postgres` y lo define el propio `docker-compose.yml`.

## Levantar el proyecto con Docker

```bash
docker compose up -d --build
```

Orden de arranque:

1. `postgres` arranca y pasa el healthcheck.
2. `migrate` aplica las migraciones pendientes y termina.
3. `restaurant-api` arranca solo si `migrate` terminó con éxito.

La API queda disponible en `http://localhost:3000/api/v1`.

## Desarrollo local (sin Docker para la API)

```bash
docker compose up -d postgres
npm run migration:run
npm run seed          # opcional: carga datos de prueba
npm run start:dev
```

## Documentación de la API

Swagger disponible en `http://localhost:3000/api/docs`.

## Health check

```bash
curl http://localhost:3000/api/v1/health
```

## Base de datos y migraciones

El esquema se gestiona con migraciones de TypeORM. `synchronize` está en `false` en todos los ambientes y la aplicación nunca ejecuta migraciones al iniciar: se aplican con un comando explícito o con el servicio `migrate` de Docker Compose.

- Las migraciones viven en `src/database/migrations/`.
- El CLI usa `src/database/data-source.ts`, que reutiliza `EnvConfig` y trabaja sobre `dist/`. Por eso cada script ejecuta `npm run build` antes.
- Todo cambio estructural de la base de datos se hace mediante una migración revisada en PR.
- Los seeds se mantienen separados de las migraciones de esquema (ver la sección siguiente).

### Comandos

- `npm run migration:generate -- src/database/migrations/Nombre`: genera una migración comparando las entidades contra la base de datos.
- `npm run migration:create -- src/database/migrations/Nombre`: crea una migración vacía.
- `npm run migration:run`: ejecuta las migraciones pendientes.
- `npm run migration:revert`: revierte la última migración.
- `npm run migration:show`: lista las migraciones y su estado.
- `npm run migration:run:prod`: ejecuta las migraciones sobre `dist/` sin recompilar.

### Flujo ante un cambio de entidad

1. Modificar la entidad.
2. `npm run migration:generate -- src/database/migrations/Nombre`
3. Revisar el SQL generado. Cuidado con `DROP` o `ALTER` destructivos, por ejemplo al renombrar columnas.
4. `npm run migration:run`
5. Subir la entidad y la migración en el mismo PR.

Para comprobar que entidades y migraciones están alineadas, `npm run migration:generate -- src/database/migrations/Check` debe responder que no hay cambios y no crear ningún archivo.

### Probar una migración nueva

```bash
npm run migration:run
npm run migration:show
npm run migration:revert
npm run migration:run
```

### Ya tengo una base creada con synchronize

- Opción 1 (recomendada en local): borrar la base y empezar limpio.

```bash
  docker compose down -v
  docker compose up -d postgres
  npm run migration:run
```

- Opción 2 (conservar los datos): insertar el registro de `InitialSchema` en la tabla `migrations` para marcarla como aplicada. Solo es válido si el esquema existente coincide con el de la migración.

### Problemas frecuentes

- `getaddrinfo EAI_AGAIN postgres`: el CLI corre en tu máquina y `POSTGRES_HOST` apunta a `postgres`. Usa `POSTGRES_HOST=localhost` en `.env`. Si ya lo tienes así, revisa que no haya una variable exportada en la terminal (`echo $POSTGRES_HOST`), porque no se sobrescribe.
- `migration:generate` sale vacía sin motivo: el build está desactualizado. Si `dist/` queda vacío tras compilar, borra `tsconfig.build.tsbuildinfo` y vuelve a compilar.

## Seeds (datos de prueba)

Los seeds cargan datos de ejemplo (categorías, mesas y productos) y están separados de las migraciones: las migraciones crean el esquema y los seeds llenan datos. Viven en `src/database/seeds/seed.ts` y reutilizan `src/database/data-source.ts`.

```bash
docker compose up -d postgres
npm run migration:run   # primero el esquema
npm run seed            # luego los datos
```

Reglas:

- El orden es siempre migraciones primero y seeds después, porque el seed necesita que las tablas existan.
- Los seeds nunca se ejecutan al iniciar la aplicación ni dentro de una migración de esquema.
- Son idempotentes: se pueden ejecutar varias veces sin duplicar datos (`upsert` sobre `categories.name` y `tables.tableNumber`; los productos se insertan solo si no existen).
- El script se niega a ejecutarse si `NODE_ENV=production`.
- Para empezar desde cero en local: `docker compose down -v`, `npm run migration:run` y `npm run seed`.
- Para agregar datos nuevos, edita los arreglos de `seed.ts`. Los valores de `zone` y `status` de las mesas deben pertenecer a `src/modules/tables/constants/table.constants.ts`.

## Pruebas
Antes de ejecutar los test se ejecuta este comando
```bash
docker compose exec postgres createdb -U restaurant_user restaurant_test
```

- `npm test`: pruebas unitarias.
- `npm run test:e2e`: migra la base `restaurant_test` y ejecuta las pruebas e2e contra ella.

La base `restaurant_test` se crea una sola vez:



## Scripts disponibles

- `npm run start:dev`: modo desarrollo con recarga automática
- `npm run build`: compila el proyecto
- `npm run lint`: corre oxlint
- `npm run format`: formatea con Prettier
- `npm test`: pruebas unitarias con Jest
- `npm run test:e2e`: pruebas e2e con Jest sobre la base de pruebas
- `npm run migration:*`: gestión de migraciones (ver sección anterior)
- `npm run seed`: carga datos de prueba (ver sección Seeds)

## Estructura del proyecto

```
src/
├── config/          # Configuración y validación de variables de entorno
├── database/
│   ├── data-source.ts   # DataSource del CLI de TypeORM
│   ├── migrations/      # Migraciones versionadas
│   └── seeds/           # Seeds de datos de prueba
├── modules/         # Módulos de dominio (health, reservas, pedidos, etc.)
└── main.ts
```