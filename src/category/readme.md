# 🚀 NestJS Category CRUD API

API RESTful profesional desarrollada con **NestJS**, **TypeORM** y **PostgreSQL**, diseñada para la gestión de categorías con validaciones avanzadas, control de duplicados y documentación interactiva mediante **Swagger**.

---

## 🛠️ Tecnologías y Herramientas

* **[NestJS](https://nestjs.com/)** - Framework progresivo de Node.js para arquitecturas escalables.
* **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado de JavaScript.
* **[TypeORM](https://typeorm.io/)** - ORM robusto para TypeScript y bases de datos relacionales.
* **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional potente y segura.
* **[Swagger (@nestjs/swagger)](https://docs.nestjs.com/openapi/introduction)** - Interfaz gráfica para la documentación de la API.
* **[Class-Validator](https://github.com/typestack/class-validator)** - Validación basada en decoradores para los DTOs.

---

## 📋 Características Principales

* 🔒 **Validación de Duplicados:** Evita registrar categorías con nombres repetidos arrojando un error `409 Conflict`.
* 🛡️ **Validación de Datos:** Reglas estrictas en los DTOs (longitudes mínimas y máximas, tipos de datos correctos).
* 📑 **Documentación Interactiva:** Swagger integrado en la ruta `/docs` con esquemas y descripciones detalladas.
* 🗄️ **Identificadores Únicos (UUID):** Uso de UUIDs en las entidades para mayor seguridad en las rutas.

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado en tu equipo:
* **Node.js** (versión 18 o superior recomendada)
* **npm** o **yarn**
* **PostgreSQL** (corriendo de manera local o en contenedor)

---

