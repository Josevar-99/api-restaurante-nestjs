# Categories Module

The `category` module manages restaurant menu categories.

## Category Data

| Field | Type | Rules |
| --- | --- | --- |
| `id` | UUID | Generated automatically |
| `name` | string | Required, unique, between 4 and 100 characters |
| `description` | string | Required, up to 500 characters |
| `status` | enum | `ACTIVE` or `INACTIVE` |

New categories always start with `ACTIVE` status. Inactive categories are excluded from the customer menu through `GET /api/v1/categories/available`.

Examples include `Appetizers`, `Main Courses`, `Beverages`, `Desserts`, `Burgers`, and `Salads`.

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/v1/categories` | Create a category |
| `GET` | `/api/v1/categories` | List all categories for administrators |
| `GET` | `/api/v1/categories/available` | List active categories for customers |
| `GET` | `/api/v1/categories/:id` | Get one category |
| `PATCH` | `/api/v1/categories/:id` | Update name or description |
| `PATCH` | `/api/v1/categories/:id/status` | Activate or deactivate a category |

## Create Example

```json
{
  "name": "Main Courses",
  "description": "Grilled and cooked dishes served as the main course."
}
```

The response contains the new category with `status: "ACTIVE"`.

## Status Example

```json
{
  "status": "INACTIVE"
}
```

Swagger documents the complete API contract at `/api/docs` while the application is running.
