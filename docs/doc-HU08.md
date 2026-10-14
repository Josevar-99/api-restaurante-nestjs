# HU-008 --- Consulta de Reservas

## 1. Información general

-   **Historia de usuario:** HU-008 --- Consulta de Reserva
-   **Proyecto:** API REST de restaurante
-   **Módulo:** Reservas
-   **Rama de trabajo:** `feature/hu-008-consulta-reserva`
-   **Estado funcional:** Implementación y pruebas funcionales
    verificadas; pendiente revisar Git y realizar la entrega mediante
    commit/push/PR.

## 2. Objetivo

Permitir consultar las reservas registradas, ya sea mediante un listado
o por el identificador de una reserva específica, devolviendo la
información principal, el estado actual y la mesa asignada cuando
corresponda.

## 3. Endpoints

  ----------------------------------------------------------------------------
  Método                  Endpoint                     Descripción
  ----------------------- ---------------------------- -----------------------
  `GET`                   `/api/v1/reservations`       Lista las reservas
                                                       registradas y admite
                                                       filtros implementados
                                                       en el servicio.

  `GET`                   `/api/v1/reservations/:id`   Consulta una reserva
                                                       específica por su UUID.
  ----------------------------------------------------------------------------

Ambos endpoints están expuestos en el controlador de reservas y fueron
verificados en Swagger UI.

## 4. Información devuelta

La respuesta de una reserva incluye los campos principales definidos por
la entidad, entre ellos:

-   `id`: identificador UUID de la reserva.
-   `customerName`: nombre del cliente.
-   `date` y `time`: fecha y hora de la reserva.
-   `guests`: cantidad de personas.
-   `tableId` y `table`: identificador y datos de la mesa asignada,
    según la relación cargada.
-   `status`: estado actual de la reserva.

La entidad `Reservation` tiene una relación `ManyToOne` con la entidad
de mesa y está configurada con `eager: true` para cargar esa relación
automáticamente.

## 5. Implementación

### Servicio: `findAll()`

El método `findAll(query)` consulta las reservas mediante el repositorio
de TypeORM. Admite filtros por:

-   `status`
-   `date`
-   `from`
-   `to`

Cuando se proporcionan `from` y `to`, se utiliza un rango de fechas.
También se contemplan los casos en que solo se proporciona uno de los
límites. Los resultados se ordenan por fecha y hora descendentes.

El listado no excluye automáticamente las reservas por su estado; por
ello, las reservas `CANCELLED` y `COMPLETED` pueden conservarse en el
historial.

### Servicio: `findOne(id)`

El método `findOne(id)` busca una reserva por su UUID mediante TypeORM.
Si el registro no existe, lanza `NotFoundException`, que se traduce en
una respuesta HTTP `404 Not Found`.

### Validación del identificador

El endpoint individual utiliza `ParseUUIDPipe` en el controlador. Si el
identificador no tiene un formato UUID válido, NestJS rechaza la
petición con `400 Bad Request` antes de ejecutar la búsqueda en el
servicio.

## 6. Datos de prueba en PostgreSQL

Se insertaron cuatro reservas de prueba en la base de datos
`restaurant_db`, relacionadas con mesas existentes:

  Reserva de prueba   Estado
  ------------------- -------------
  Carlos Mendoza      `PENDING`
  Laura Rodriguez     `CONFIRMED`
  Andres Martinez     `COMPLETED`
  Mariana Gonzalez    `CANCELLED`

Las fechas se configuraron como fechas futuras para los registros de
prueba. La reserva cancelada se insertó con el campo `cancelledAt`
informado.

Estos datos se utilizaron para validar las consultas contra PostgreSQL
real, no únicamente mediante mocks de pruebas unitarias.

> Los datos anteriores son datos de prueba. No representan reservas
> reales de clientes.

## 7. Pruebas realizadas

Las siguientes verificaciones se realizaron en Postman:

  ----------------------------------------------------------------------------
  Prueba                       Resultado esperado      Resultado observado
  ---------------------------- ----------------------- -----------------------
  Listar reservas:             `200 OK`                `200 OK`
  `GET /api/v1/reservations`                           

  Consultar una reserva        `200 OK` con sus datos  `200 OK`; se confirmó
  existente por UUID                                   que incluye los datos
                                                       de `table`

  Consultar un UUID válido que `404 Not Found`         `404 Not Found`
  no existe                                            

  Consultar con un             `400 Bad Request`       `400 Bad Request`
  identificador inválido, por                          
  ejemplo `123`                                        

  Filtrar por                  `200 OK` con reservas   `200 OK`
  `status=COMPLETED`           completadas             

  Filtrar por                  `200 OK` con reservas   `200 OK`
  `status=CONFIRMED`           confirmadas             

  Filtrar por                  `200 OK` con reservas   `200 OK`; la reserva
  `status=CANCELLED`           canceladas              cancelada apareció en
                                                       la respuesta

  Consultar el listado y       Deben seguir            Se verificó que ambas
  conservar reservas           disponibles en el       aparecen en el listado
  `COMPLETED` y `CANCELLED`    historial               
  ----------------------------------------------------------------------------

También se confirmó que las pruebas unitarias del proyecto terminaron
correctamente y que los endpoints se encuentran visibles en Swagger UI.

## 8. Criterios de aceptación

-   [x] Consultar una reserva específica mediante su identificador.
-   [x] Devolver los datos principales, el estado actual y la mesa
    asignada.
-   [x] Responder con `404 Not Found` cuando el UUID tiene formato
    válido, pero la reserva no existe.
-   [x] Permitir listar las reservas registradas.
-   [x] Mantener las reservas `CANCELLED` y `COMPLETED` disponibles para
    consulta e historial.
-   [x] Validar el formato del UUID y responder con `400 Bad Request` si
    es inválido.
-   [x] Verificar la existencia del registro antes de devolver una
    reserva.
-   [x] Exponer y documentar los endpoints en el controlador y Swagger
    UI.
-   [x] Ejecutar las pruebas unitarias y las pruebas funcionales
    descritas.

## 9. Consideraciones

-   La autenticación/autorización para el listado aparece en la HU como
    opcional/recomendada. No se añadió un guard nuevo como parte de esta
    implementación.
-   Las reservas utilizadas para probar se insertaron directamente en
    PostgreSQL; esa operación se hizo para preparar datos de prueba y no
    ejercita las validaciones de creación del servicio.
-   El resultado HTTP `200 OK` por sí solo no garantiza que un filtro
    esté correcto; también se debe comprobar que el contenido de la
    respuesta coincida con el estado solicitado.
-   No se debe considerar terminada la entrega de Git hasta revisar el
    estado de la rama, confirmar los archivos del cambio y realizar el
    commit, push y proceso de revisión correspondiente.

## 10. Pendientes de entrega

-   [ ] Revisar la rama actual con `git branch --show-current`.
-   [ ] Revisar los archivos modificados con `git status` y `git diff`.
-   [ ] Confirmar que no se incluyan cambios ajenos a esta HU.
-   [ ] Crear el commit con un mensaje descriptivo.
-   [ ] Hacer push de `feature/hu-008-consulta-reserva`.
-   [ ] Crear o actualizar el pull request según el flujo del equipo.
-   [ ] Marcar la HU como terminada cuando el equipo valide la entrega.

## 11. Resumen

La funcionalidad de consulta de reservas está implementada y se validó
con PostgreSQL, Postman, pruebas unitarias y Swagger UI. Los endpoints
permiten listar las reservas y consultar una por UUID, gestionan
correctamente los casos `400` y `404`, y mantienen visibles las reservas
completadas y canceladas para el historial.

La entrega técnica en Git (revisión final, commit, push y pull request)
queda pendiente de realizar.
