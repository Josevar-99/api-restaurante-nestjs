# Arreglos de código — HU-007 (Reservas) y configuración general

Fecha: 25/09/2026
Rama: `feature/hu-007-reservations`

---

## 1. La aplicación no arrancaba (crash en el arranque)

**Qué estaba mal**
`src/app.module.ts` inyectaba la configuración de observabilidad con
`configService.getOrThrow('observe')`, pero **no existía la sección `observe`**
en `src/config/env.config.ts` (ni variables `OBSERVE_*` en `.env`).
Al arrancar, el proceso moría con:

```
TypeError: Configuration key "observe" does not exist
ERROR ObserveModule initialized without options...
```

**Qué se arregló**

- `src/config/env.config.ts`: se agregó la sección `observe` (`appKey`,
  `appSecret`, `serviceId`, `serviceVersion`, `endpoint`, `forwardLogs`,
  `runtimeMetrics`, `debug`) con valores por defecto leídos del entorno.
- `.env.example`: se documentaron las nuevas variables `OBSERVE_*`.

---

## 2. Cada petición generaba un error de trazas

**Qué estaba mal**
`src/app.module.ts` exporta `ObserveInstrument`, pero `src/main.ts` creaba la app
sin pasarlo:

```ts
const app = await NestFactory.create(AppModule); // faltaba instrument
```

Resultado: un `ERROR` por cada request:

```
Operation "POST /api/v1/reservations" produced no spans -
the "instrument" option is still missing from NestFactory
```

**Qué se arregló**

- `src/main.ts`:

```ts
const app = await NestFactory.create(AppModule, { instrument: ObserveInstrument });
```

---

## 3. El endpoint de reservas devolvía 404 (módulo no registrado)

**Qué estaba mal**
`ReservationsModule` existía con su controller y servicio, pero **nunca se
importó en `AppModule`**, así que `POST /api/v1/reservations` no estaba mapeado
y respondía `404 Not Found`.

**Qué se arregló**

- `src/app.module.ts`: se agregó `ReservationsModule` a `imports`.

**Verificación real (app levantada contra la base local):**

| Caso | Resultado |
|------|-----------|
| `POST /api/v1/reservations` válido | `201` con la mesa asignada |
| Fecha ya reservada | `409` |
| Sin mesa disponible | `409` |
| Hora/cantidad/teléfono inválidos | `400` con mensajes de validación |
| `GET /api/v1/reservations` | `404` (solo se expone `POST`, según la HU) |

---

## 4. Enum con valor inconsistente

**Qué estaba mal**

```ts
COMPLETED = 'completado' // el resto de los valores van en MAYÚSCULAS
```

Ese valor se guarda tal cual en la columna `enum` de la base y se devuelve en la
API, rompiendo la convención con `PENDING`, `CONFIRMED`, etc.

**Qué se arregló**

- `src/reservations/reservation-status.enum.ts`: `COMPLETED = 'COMPLETED'`.

---

## 5. `npm test` no corría (dos configuraciones de Jest)

**Qué estaba mal**
Había `jest.config.js` **y** `jest.config.cjs` en la raíz. Jest 30 aborta con:

```
● Multiple configurations found:
    * jest.config.js
    * jest.config.cjs
```

Además, `jest.config.cjs` configuraba ts-jest en `globals`, que es la forma
**deprecada** y generaba un warning por cada suite.

**Qué se arregló**

- Se eliminó `jest.config.js` y se dejó **una sola** configuración en
  `jest.config.cjs`.
- Se movió la configuración de ts-jest de `globals` a `transform` (forma
  soportada).

---

## 6. Scripts de `package.json` que apuntaban a Vitest (no instalado)

**Qué estaba mal**
`test:watch`, `test:debug` y `test:e2e` ejecutaban `vitest`, paquete que **no
está en `devDependencies`** (ni existe `vitest.config.e2e.ts`), por lo que
fallaban siempre. El README también decía que las pruebas corrían con Vitest.

**Qué se arregló**

- `package.json`:
  - `test:watch` → Jest en watch mode.
  - `test:debug` → Jest con `--inspect-brk --runInBand`.
  - `test:e2e` → Jest con `--testPathPatterns e2e --passWithNoTests`.
  - Nuevo script `typecheck` → `tsc -p tsconfig.json --noEmit`.
- `README.md`: scripts actualizados a Jest y documentado `typecheck`.

---

## 7. Errores de TypeScript en `test/tables.service.spec.ts`

**Qué estaba mal**
`npm run typecheck` (antes inexistente) fallaba con 7 errores: los mocks se
declaraban sin tipos, así que TypeScript infería `never` y rechazaba
`{ id: 1, ...d }`, `mockResolvedValue(null)` y `mockResolvedValue(<TableEntity>)`.

**Qué se arregló**

- `test/tables.service.spec.ts`: los mocks ahora están tipados
  (`Partial<TableEntity>`, `Promise<TableEntity | null>`, etc.).

---

## 8. `docker compose` no podía construir la imagen

**Qué estaba mal**
`docker-compose.yml` referenciaba `dockerfile: Dockerfile`, pero el archivo en el
repo se llamaba `dockerfile` (minúscula). En Linux (sistema de ficheros
sensible a mayúsculas) el build falla con *Dockerfile not found*.

**Qué se arregló**

- Renombrado `dockerfile` → `Dockerfile` (`git mv`).

---

## 9. DTO de reserva: validación y documentación

**Qué estaba mal** (`src/reservations/dto/create-reservation.dto.ts`)

- `quantity` no tenía `@Type(() => Number)`: un `"4"` venido de un form-data o
  de un cliente que serializa mal producía `400` en lugar de convertirse.
- `@IsNumber()` + `@IsInt()` + `@IsNotEmpty()` eran redundantes entre sí
  (`IsInt`/`Min(1)` ya cubren el resto).
- `date`, `phone`, `email` y `quantity` no tenían `@ApiProperty`, así que
  Swagger documentaba esos campos incompletos o ausentes.

**Qué se arregló**

- `quantity` con `@Type(() => Number)` + `@IsInt()` + `@Min(1)`.
- `@ApiProperty` añadidos a `date`, `phone`, `email` y `quantity`.
- Se añadieron 2 pruebas nuevas en `create-reservation.dto.spec.ts`
  (cantidad numérica en string y cantidad ausente).

---

## 10. Mensaje de conflicto con fecha "cruda"

**Qué estaba mal**
El servicio devolvía `We have reservation on this "${date}"`, y como `date` es un
`Date`, el mensaje salía dependiente de timezone/locale del servidor:

```
We have reservation on this "Fri Dec 25 2026 14:00:00 GMT-0500 (hora estándar de Colombia)"
```

**Qué se arregló**

- `src/reservations/reservations.service.ts`: mensaje estable y legible:

```
There is already a reservation on 2026-12-25T19:00:00.000Z at 19:00
```

---

## 11. README con Markdown roto

**Qué estaba mal**
Los cercos de código venían escapados (`\`\`\`bash`), así que el bloque de
comandos no se renderizaba; y la sección de scripts mencionaba Vitest.

**Qué se arregló**

- `README.md`: cercos de código corregidos y scripts actualizados (ver punto 6).

---

## 12. Paquetes: lockfile corrupto y build de Docker roto

**Qué estaba mal**

1. `package-lock.json` tenía una entrada **falsa**:

   ```json
   "node_modules/bs-logger": { ..., "libc": ["glibc"], ... }
   ```

   El paquete `bs-logger@0.2.6` (dependencia de `ts-jest`, puro JavaScript) **no
   declara** `libc` en el registro de npm (`npm view bs-logger@0.2.6 libc` →
   vacío), y `node_modules/bs-logger/package.json` tampoco lo tiene. Esa
   restricción de plataforma escrita en el lock provocaba:

   ```
   npm error code EBADPLATFORM
   npm error notsup Unsupported platform for bs-logger@0.2.6:
              wanted {"libc":"glibc"} (current: {"libc":"musl"})
   ```

   y por lo tanto **`docker compose build` fallaba** en ambas etapas
   (`RUN npm install` y `RUN npm install --omit=dev`) porque la imagen base es
   `node:20-alpine` (musl). Cuando `npm install` aborta a mitad de la
   reificación, `node_modules` queda incompleto y TypeScript empieza a reportar
   errores como:

   ```
   Cannot find module '@nestjs/swagger' or its corresponding type declarations.
   ```

2. No existía ninguna configuración de editor en el proyecto, así que VSCode
   usaba el TypeScript **embebido** en lugar del TypeScript del workspace
   (`typescript@6.0.3`), resolviendo los paquetes distinto a la CLI.

**Qué se arregló**

- `package-lock.json`: se eliminó la entrada `"libc": ["glibc"]` inválida de
  `node_modules/bs-logger` (verificado que `npm install` no la vuelve a escribir).
- **Reinstalación limpia** con `npm ci` para garantizar un árbol de paquetes
  íntegro y sincronizado con el lockfile.
- Nuevo `.vscode/settings.json`:

  ```json
  {
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true
  }
  ```

  Así el editor usa el mismo compilador que `npm run typecheck`/`npm run build`.

**Verificación**

- `docker compose build` → **✅ imagen construida** (antes fallaba con
  `EBADPLATFORM`) y `nest build` corrió dentro del contenedor sin errores de
  tipos.
- `npm ci` → **✅ exit 0**, `node_modules/@nestjs/swagger@12.0.1` presente.

> Si el error TS2307 sigue visible en el editor después de este arreglo, es un
> estado cacheado del lenguaje: ejecuta en VSCode
> `Ctrl/Cmd + Shift + P` → **"TypeScript: Restart TS server"** (o recarga la
> ventana).

---

## Verificación final

| Comando | Resultado |
|---------|-----------|
| `npm ci` (instalación limpia) | ✅ árbol de paquetes íntegro |
| `npm run lint` | ✅ sin hallazgos |
| `npm run typecheck` | ✅ 0 errores |
| `npm run build` | ✅ |
| `npm test` | ✅ 10 suites, **57 pruebas** (antes: no corría) |
| Arranque de la app + prueba manual de `POST /api/v1/reservations` | ✅ 201/409/400 correctos |
| `docker compose config` | ✅ válido |
| `docker compose build` | ✅ imagen construida (antes: `EBADPLATFORM`) |

---

## Observaciones pendientes (no se tocaron)

1. **`tsconfig.build.tsbuildinfo` está trackeado en git** aunque `.gitignore` lo
   ignora: cada build modifica el repo. Solución recomendada:
   `git rm --cached tsconfig.build.tsbuildinfo`.
2. **`UpdateReservationDto` quedó sin uso** (`src/reservations/dto/update-reservation.dto.ts`)
   porque la HU solo expone la creación. Se dejó por si la HU agrega
   actualización/consulta de reservas.
3. **Sin credenciales de Observe** la app arranca igual, pero el agente registra
   **un único** `401 Telemetry rejected` al inicio (los siguientes solo se
   cuentan). Agrega `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET` en `.env` para
   eliminar ese aviso.
4. **No hay migraciones**: `synchronize` está habilitado solo en `development`.
   Antes de producción hay que generar migraciones con TypeORM CLI.
5. **npm bloquea 3 scripts de instalación** (`@parcel/watcher`,
   `@scarf/scarf`, `unrs-resolver`) porque no están aprobados en la política
   `allowScripts`. Todo funciona con los binarios precompilados (lint, tests y
   build verificados); solo se necesitan si algún binario nativo falla. Para
   aprobarlos: `npm install-scripts approve <paquete>`.
