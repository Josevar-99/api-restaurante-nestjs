## 📝 Descripción

<!-- Qué hace este PR y por qué -->

**Historia de usuario:** HU-__ (ver `docs/doc-HU__.md`)
Closes #<número_de_issue>

## 🔖 Tipo de cambio

- [ ] ✨ Nueva funcionalidad (`feat`)
- [ ] 🐛 Corrección de bug (`fix`)
- [ ] ♻️ Refactorización (`refactor`)
- [ ] 📝 Documentación (`docs`)
- [ ] 🧪 Tests (`test`)
- [ ] 🔧 Configuración / Docker / CI (`chore`)
- [ ] 💥 Breaking change

## 🧩 Módulos afectados

- [ ] `category`
- [ ] `products`
- [ ] `reservations`
- [ ] `tables` (controllers / services / dtos / entities)
- [ ] `health`
- [ ] `config` (env, swagger)
- [ ] Otro: _______

## 🔨 Cambios realizados

-
-
-

## 🌐 Endpoints nuevos o modificados

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET    | `/...` | | |
| POST   | `/...` | | |
| PATCH  | `/...` | | |

## 🗄️ Base de datos (TypeORM / PostgreSQL)

- [ ] Sin cambios en base de datos
- [ ] Nueva entidad o campos en entidades existentes
- [ ] Nuevos enums (`category-status`, `reservation-status`, etc.)
- [ ] Cambios que requieren migración o recrear el esquema

## ⚙️ Configuración

- [ ] Sin cambios de configuración
- [ ] Nuevas variables de entorno (actualizadas en `env.schema.validations.ts` y en el README)
- [ ] Cambios en `docker-compose.yml` / `Dockerfile`
- [ ] Cambios en `swagger.config.ts`

## 🧪 Cómo probarlo

1. `git checkout <rama>`
2. `npm install`
3. Configurar `.env` (variables nuevas: ...)
4. `docker compose up -d` (PostgreSQL)
5. `npm run start:dev`
6. Probar en Swagger: `http://localhost:<puerto>/api` → ...

## ✅ Checklist

- [ ] La rama parte de `develop` y el PR apunta a `develop`
- [ ] Sin marcadores de conflicto (`<<<<<<<`, `>>>>>>>`)
- [ ] `npm run lint` (oxlint) sin errores
- [ ] `npm run format` aplicado
- [ ] `npm test` pasa
- [ ] `npm run build` compila
- [ ] DTOs con validaciones (`class-validator`) y decoradores de Swagger
- [ ] Tests unitarios añadidos o actualizados (`*.spec.ts`)
- [ ] Documentación actualizada (`docs/`, README del módulo)
- [ ] Sin secretos, `.env` ni archivos innecesarios (capturas, imágenes) en el commit
- [ ] Commits con Conventional Commits (`feat(products): ...`)

## 📸 Evidencias (opcional)

<!-- Capturas de Swagger/Postman, resultados de tests, cobertura -->

## 📌 Notas para el revisor

<!-- Decisiones técnicas, deuda pendiente, puntos delicados -->