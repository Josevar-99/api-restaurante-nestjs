# HU-005 — Consulta del Menú del Restaurante

## 1. ¿Qué se hizo?

Se desarrolló la **HU-005: Consulta del Menú del Restaurante**.

El objetivo es permitir que los usuarios puedan consultar el menú del restaurante de forma organizada, mostrando las categorías y productos que están activos.

La implementación utiliza las entidades existentes de **Category** y **Product**.

---

## 2. Funcionalidades de la HU-005

Se crearon las funcionalidades para consultar:

- El menú completo.
- Las categorías disponibles.
- Los productos de una categoría específica.
- Un producto específico.

### Endpoints

```http
GET /api/v1/menu
GET /api/v1/menu/categories
GET /api/v1/menu/categories/:categoryId/products
GET /api/v1/menu/products/:id
```

---

## 3. Archivos creados

Dentro de:

```text
src/menu/
```

se crearon:

```text
menu.controller.ts
menu.service.ts
menu.module.ts
```

También se crearon las pruebas unitarias:

```text
menu.controller.spec.ts
menu.service.spec.ts
```

---

## 4. MenuModule

El archivo `menu.module.ts` organiza toda la funcionalidad relacionada con el menú.

Utiliza las entidades existentes de:

- Category
- Product

No fue necesario crear una nueva entidad llamada `Menu`, porque el menú utiliza la información que ya existe en las categorías y productos.

---

## 5. MenuService

El `MenuService` contiene la lógica principal de la HU-005.

Se encarga de consultar las categorías y productos y aplicar las reglas necesarias antes de devolver la información.

### Reglas principales

**Categorías:** solo se muestran categorías con estado `ACTIVE`.

**Productos:** solo se muestran productos con estado `ACTIVE`.

**Disponibilidad:** un producto puede estar activo pero no disponible. En ese caso puede aparecer en el menú indicando que no está disponible, pero no debe poder seleccionarse para realizar un pedido.

**Categoría inactiva:** si un producto pertenece a una categoría inactiva, tampoco debe aparecer en el menú.

---

## 6. Consulta del menú completo

### Endpoint

```http
GET /api/v1/menu
```

Permite consultar el menú completo organizado por categorías.

La información se obtiene desde la base de datos y no está escrita directamente en el código.

Esto permite que los cambios realizados en categorías y productos se reflejen en la siguiente consulta.

---

## 7. Consulta de categorías

### Endpoint

```http
GET /api/v1/menu/categories
```

Permite consultar las categorías activas que hacen parte del menú.

Las categorías inactivas quedan fuera de la respuesta.

---

## 8. Consulta de productos por categoría

### Endpoint

```http
GET /api/v1/menu/categories/:categoryId/products
```

Permite consultar los productos pertenecientes a una categoría específica.

Se tiene en cuenta:

- Que la categoría exista.
- Que la categoría esté activa.
- Que el producto esté activo.
- La disponibilidad del producto.

---

## 9. Consulta de un producto

### Endpoint

```http
GET /api/v1/menu/products/:id
```

Permite consultar un producto específico.

La consulta valida las condiciones necesarias para que el producto pueda formar parte del menú.

---

## 10. MenuController

El archivo `menu.controller.ts` recibe las peticiones HTTP y las envía al `MenuService`.

El flujo es:

```text
Petición HTTP
      ↓
MenuController
      ↓
MenuService
      ↓
Base de datos
      ↓
Respuesta
```

El controller maneja las solicitudes, mientras que la lógica de negocio se encuentra principalmente en el service.

---

## 11. Integración del módulo

El `MenuModule` fue agregado al `AppModule` para que NestJS pueda reconocer y utilizar la funcionalidad del menú.

La aplicación integra:

- CategoryModule
- ProductsModule
- ReservationsModule
- HealthModule
- TablesModule
- MenuModule

---

## 12. Pruebas unitarias

Para comprobar el funcionamiento de la HU-005 se crearon pruebas unitarias utilizando **Jest**.

Archivos:

```text
src/menu/menu.service.spec.ts
src/menu/menu.controller.spec.ts
```

### ¿Qué se prueba?

- Categorías activas e inactivas.
- Productos activos e inactivos.
- Productos no disponibles.
- Productos pertenecientes a categorías inactivas.
- Consulta de categorías.
- Consulta de productos.
- Manejo de elementos que no existen.

Las pruebas del controller verifican que sus métodos llamen correctamente al servicio.

---

## 13. Configuración de Jest

Durante la configuración de las pruebas se encontró un conflicto porque existían varias configuraciones de Jest.

El error era:

```text
Multiple configurations found
```

Se solucionó dejando una única configuración de Jest dentro de `package.json`.

De esta manera Jest puede ejecutar correctamente las pruebas del proyecto.

---

## 14. ¿Por qué no se creó una entidad Menu?

No fue necesario crear una tabla o entidad llamada `Menu`.

El menú es una forma de mostrar la información que ya existe en:

```text
Category
Product
```

Por eso se reutilizan las entidades existentes.

Esto evita duplicar información en la base de datos.

---

## 15. Flujo general

```text
Usuario
   ↓
Consulta el menú
   ↓
MenuController
   ↓
MenuService
   ↓
Consulta categorías y productos
   ↓
Aplica filtros de estado y disponibilidad
   ↓
Organiza la información
   ↓
Devuelve el menú
```

---

## 16. Relación con otras HU

La HU-005 utiliza información creada por otras funcionalidades del proyecto.

- **HU-003:** Categorías.
- **HU-004:** Productos.
- **HU-005:** Consulta y presentación del menú.

La HU-005 no crea nuevamente los productos ni las categorías.

Utiliza la información existente.

Por eso, si un producto o una categoría cambia en la base de datos, la siguiente consulta del menú puede reflejar ese cambio.

---

## 17. ¿Cómo explicar mi trabajo?

> "Mi tarea fue desarrollar la consulta del menú del restaurante. Creé un módulo de menú con su controller y service. El menú utiliza las categorías y productos que ya existen en el proyecto. Implementé endpoints para consultar el menú completo, las categorías, los productos de una categoría y un producto específico. También apliqué las reglas de negocio para mostrar únicamente categorías y productos activos, y para identificar los productos que están temporalmente no disponibles. Finalmente, creé pruebas unitarias con Jest para verificar el funcionamiento del service y del controller."

---

## 18. Tecnologías utilizadas

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Jest
- Git
- GitHub

---

## 19. Resumen

La HU-005 quedó enfocada exclusivamente en la **consulta del menú**.

Se implementó:

```text
✅ Consulta del menú completo
✅ Consulta de categorías
✅ Consulta de productos por categoría
✅ Consulta de un producto
✅ Filtro de categorías activas
✅ Filtro de productos activos
✅ Manejo de disponibilidad
✅ Exclusión de productos de categorías inactivas
✅ Integración con Product y Category
✅ Pruebas unitarias del Service
✅ Pruebas unitarias del Controller
```

La funcionalidad reutiliza las entidades existentes y evita duplicar información en la base de datos.