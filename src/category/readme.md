# 🚀 NestJS Category CRUD API

Professional RESTful API built with **NestJS**, **TypeORM**, and **PostgreSQL**, designed for category management with advanced validation, duplicate prevention, and interactive documentation through **Swagger**.

---

## 🛠️ Technologies and Tools

* **[NestJS](https://nestjs.com/)** - Progressive Node.js framework for scalable architectures.
* **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript.
* **[TypeORM](https://typeorm.io/)** - Robust ORM for TypeScript and relational databases.
* **[PostgreSQL](https://www.postgresql.org/)** - Powerful and secure relational database.
* **[Swagger (@nestjs/swagger)](https://docs.nestjs.com/openapi/introduction)** - Graphical interface for API documentation.
* **[Class-Validator](https://github.com/typestack/class-validator)** - Decorator-based validation for DTOs.

---

## 📋 Main Features

* 🔒 **Duplicate Validation:** Prevents registering categories with repeated names by throwing a `409 Conflict` error.
* 🛡️ **Data Validation:** Strict rules in DTOs (minimum and maximum lengths, correct data types).
* 📑 **Interactive Documentation:** Swagger integrated at the `/docs` route with detailed schemas and descriptions.
* 🗄️ **Unique Identifiers (UUID):** Use of UUIDs in entities for better route security.

---

## ⚙️ Requirements

Make sure you have the following installed:
* **Node.js** (version 18 or higher recommended)
* **npm** or **yarn**
* **PostgreSQL** (running locally or in a container)

---

