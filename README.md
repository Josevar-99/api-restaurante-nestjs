# Restaurant Categories API

REST API built with NestJS and PostgreSQL to manage restaurant menu categories.

## Requirements

- Node.js 20 or later
- PostgreSQL 14 or later
- Docker Desktop and Docker Compose

## Installation

```bash
npm install
copy .env.example .env
docker compose up -d
```

The API uses the global prefix `/api/v1`. The local PostgreSQL service creates the restaurant database automatically.

## Running the Application

```bash
npm run start:dev
```

The API is available at `http://localhost:3000`, and Swagger is available at `http://localhost:3000/api/docs`.

## Category Rules

- Category names are required and unique.
- Names must contain between 4 and 100 characters.
- Descriptions are required and may contain up to 500 characters.
- New categories always start with status `ACTIVE`.
- Only `ACTIVE` categories are returned by `/api/v1/categories/available` for the customer menu.
- The only valid statuses are `ACTIVE` and `INACTIVE`.

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/v1/categories` | Create a category |
| `GET` | `/api/v1/categories` | List all categories for administrators |
| `GET` | `/api/v1/categories/available` | List active categories for customers |
| `GET` | `/api/v1/categories/:id` | Get a category |
| `PATCH` | `/api/v1/categories/:id` | Update name or description |
| `PATCH` | `/api/v1/categories/:id/status` | Activate or deactivate a category |

Example category names: `Appetizers`, `Main Courses`, `Beverages`, `Desserts`, `Burgers`, and `Salads`.

## Verification

```bash
npm run build
npm run lint
npm test
```

See the module documentation in [src/category/README.md](src/category/README.md).
