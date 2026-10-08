# API REST de Sistema de Reservas para Restaurante (NestJS + TypeORM + PostgreSQL)

Este proyecto es una API REST desarrollada con **NestJS**, **TypeORM** y **PostgreSQL**, diseñada para gestionar de forma eficiente el flujo completo de un restaurante (gestión de mesas, productos, categorías y un robusto sistema transaccional de reservas).

## Tecnologías Principales
- **NestJS** - Framework progresivo de Node.js.
- **TypeScript** - Lenguaje de tipado estricto.
- **PostgreSQL** - Base de datos relacional.
- **TypeORM** - Object-Relational Mapping (ORM) para la persistencia.
- **Docker & Docker Compose** - Containerización de servicios de base de datos.
- **Jest** - Framework de pruebas unitarias.
- **Swagger UI** - Documentación interactiva de endpoints.

---

## Requisitos Previos
Asegúrate de tener instalados los siguientes componentes antes de iniciar:
- [Node.js](https://nodejs.org) (Versión v18 o superior recomendada)
- [Docker Desktop](https://docker.com)

---

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com
   cd api-restaurante-nestjs
   ```

2. **Instalar dependencias:**
   Si estás en Windows y encuentras restricciones con scripts, recuerda configurar la política temporal en PowerShell antes de instalar:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   npm install
   ```

3. **Configurar el entorno:**
   Crea tu archivo `.env` en la raíz del proyecto basándote en el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

4. **Levantar la base de datos (Docker):**
   ```bash
   docker compose up -d postgres
   ```

5. **Iniciar la aplicación en desarrollo:**
   ```bash
   npm run start:dev
   ```

La API estará corriendo en `http://localhost:3000/api/v1`.

---

## Documentación de la API (Swagger)

Una vez que el servidor esté en marcha, puedes acceder a la documentación interactiva en:
👉 `http://localhost:3000/api/docs`

Desde allí podrás probar de forma visual todos los endpoints integrados (Categorías, Productos, Mesas y Reservas).

---

## Pruebas Unitarias y Cobertura (Testing)

El proyecto cuenta con una sólida arquitectura de pruebas unitarias implementadas con Jest, que aseguran el correcto cumplimiento de todas las Reglas de Negocio (RN) del sistema.

Para ejecutar la suite de pruebas localmente:
```bash
npm run test
```

### Reporte Actual de Cobertura (Coverage)

Nuestra suite de automatización garantiza métricas de calidad de código excepcionales de acuerdo con el último reporte consolidado:

* **Test Suites:** 20 pasadas, 20 en total
* **Tests:** 280 pasados, 280 en total
* **Tiempo de Ejecución:** ~9.64 segundos

#### Resumen de Cobertura por Módulos:

| Capa / Módulo | % Stmts | % Branch | % Funcs | % Lines | Estado |
|---|---|---|---|---|---|
| **Módulo de Reservas (`reservations`)** | **91.93%** | **85.14%** | **95.65%** | **92.17%** | 🟢 Excelente |
| **Módulo de Mesas (`tables`)** | **100.00%** | **100.00%** | **100.00%** | **100.00%** | 🟢 Óptimo |
| **Módulo de Productos (`products`)** | **100.00%** | **100.00%** | **100.00%** | **100.00%** | 🟢 Óptimo |
| **Módulo de Categorías (`category`)** | **80.85%** | **66.66%** | **57.14%** | **80.00%** | 🟡 Sólido |
| **Módulo de Salud (`health`)** | **75.00%** | **100.00%** | **33.33%** | **66.66%** | 🟡 Sólido |

---

## Checklist de Integración Continua (CI)

Antes de realizar un Pull Request a `develop`, asegúrate de ejecutar los siguientes comandos de calidad:
- **Formateo de código:** `npm run format` (Aplica Prettier para evitar fallos de estilo en el pipeline).
- **Linter de código:** `npm run lint` (Ejecuta validaciones estricta con oxlint).
- **Compilación de producción:** `npm run build` (Garantiza que TypeScript compile a JavaScript sin errores).
