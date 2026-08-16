# Plataforma de Eventos e Inscripciones

## Temática
API backend completa para una plataforma de gestión de eventos e inscripciones. Incluye autenticación centralizada con Passport.js, JWT y cookies httpOnly, autorización por roles, gestión completa de eventos con reglas de negocio, sistema de tickets con control de cupos y notificaciones por email, y una arquitectura profesional organizada en capas (DAO, Repository, Service, Controller, DTO).

## Tecnologías
- Node.js
- Express
- MongoDB / Mongoose
- dotenv
- bcrypt
- jsonwebtoken
- cookie-parser
- passport
- passport-local
- passport-jwt
- nodemailer

## Instalación
1. Cloná el repositorio
2. Ejecutá `npm install`
3. Copiá `.env.example` como `.env` y completá los valores

## Variables de entorno
- `PORT`: puerto donde corre el servidor
- `NODE_ENV`: entorno de ejecución (development/production)
- `MONGO_URL`: cadena de conexión a MongoDB
- `JWT_SECRET`: clave secreta para firmar los JWT
- `JWT_EXPIRES_IN`: tiempo de expiración del JWT (ej: 1h)
- `MAIL_HOST`: host SMTP para el envío de emails
- `MAIL_PORT`: puerto SMTP
- `MAIL_USER`: usuario/casilla de email
- `MAIL_PASS`: contraseña de aplicación (nunca la contraseña normal de la cuenta)
- `MAIL_FROM`: dirección remitente de los emails

## Cómo ejecutar

npm run dev


## Usuarios de prueba / cómo crear roles distintos

El registro público (`POST /api/sessions/register`) siempre crea usuarios con rol `user` por defecto — no es posible asignar `organizer` o `admin` desde el body, por diseño de seguridad.

Para probar funcionalidades de `organizer` o `admin`, seguí estos pasos:

1. Registrá un usuario normal:
```json
POST /api/sessions/register
{ "first_name": "Carlos", "last_name": "Ruiz", "email": "carlos@mail.com", "password": "Secreta123" }
```

2. Conectate a la base de datos (por ejemplo con MongoDB Compass) y ubicá ese usuario en la colección `users`.

3. Editá manualmente el campo `role`, cambiándolo de `"user"` a `"organizer"` o `"admin"` según lo que necesites probar.

4. Volvé a iniciar sesión con ese usuario (`POST /api/sessions/login`). Esto es necesario porque el rol queda fijado dentro del JWT en el momento del login — un cambio de rol en la base no se refleja hasta el próximo inicio de sesión.

### Usuarios sugeridos para probar el flujo completo

| Usuario | Rol | Uso |
|---|---|---|
| organizer@mail.com | organizer | Crear y administrar eventos |
| user@mail.com | user | Inscribirse a eventos |
| admin@mail.com | admin | Acceso total, incluyendo ver todos los usuarios |

## Estructura de carpetas

src/
├── app.js
├── server.js
├── config/
│ ├── dataBase.js
│ ├── env.js
│ └── passport.config.js
├── routes/
│ ├── event.routes.js
│ ├── user.routes.js
│ ├── ticket.routes.js
│ └── sessions.routes.js
├── controllers/
│ ├── event.controller.js
│ ├── user.controller.js
│ ├── ticket.controller.js
│ └── sessions.controller.js
├── services/
│ ├── sessions.service.js
│ ├── events.service.js
│ ├── tickets.service.js
│ └── users.service.js
├── repositories/
│ ├── user.repository.js
│ ├── event.repository.js
│ └── tickets.repository.js
├── dao/
│ ├── user.dao.js
│ ├── event.dao.js
│ └── tickets.dao.js
├── dto/
│ ├── user.dto.js
│ ├── event.dto.js
│ └── ticket.dto.js
├── models/
│ ├── event.model.js
│ ├── ticket.model.js
│ └── user.model.js
├── middlewares/
│ ├── auth.middleware.js
│ └── authorize.middleware.js
└── utils/
├── hash.js
├── jwt.js
├── reservationCode.js
├── mailer.js
└── errorHandler.js


## Arquitectura en capas

El proyecto está organizado en capas con responsabilidades bien separadas y desacopladas:

- **DAO** (`src/dao/`): únicos archivos del proyecto que importan modelos de Mongoose directamente. Exponen operaciones de acceso a datos puras (`create`, `findById`, `update`, `count`, etc.), sin lógica de negocio.
- **Repository** (`src/repositories/`): usan el DAO correspondiente; nunca importan modelos directamente. Exponen métodos orientados al dominio (`getByEmail`, `listEvents`, `countActiveTicketsForEvent`, etc.).
- **Service** (`src/services/`): consumen repositories, nunca DAOs ni modelos. Concentran toda la lógica de negocio: validaciones, permisos sobre recursos propios, cálculo de cupos, reglas de estado, envío de email.
- **Controller** (`src/controllers/`): solo coordinan request/response. Extraen datos de `body`/`params`/`query`, llaman al service correspondiente y devuelven la respuesta ya formateada con el DTO correspondiente. No importan modelos ni contienen lógica de negocio.
- **DTO** (`src/dto/`): funciones que filtran qué campos de un documento se exponen en cada respuesta. Existen para usuario, evento y ticket. Ninguna respuesta de la API expone la contraseña del usuario, ni siquiera hasheada — incluso cuando un documento viene con `populate`, el DTO correspondiente filtra los datos del documento relacionado antes de responder.

### Manejo de errores

Todos los errores de negocio pasan por un único punto centralizado: `src/utils/errorHandler.js`. Mapea un código de error interno a su respuesta HTTP correspondiente (status + mensaje), garantizando un formato consistente en toda la API:

- **400**: datos inválidos (campos faltantes, fecha pasada, capacidad/precio inválidos, estado inválido, etc.)
- **401**: no autenticado (sin cookie o token inválido/expirado)
- **403**: autenticado, pero sin permisos para la acción o el recurso solicitado
- **404**: recurso no encontrado (evento o ticket inexistente)
- **409**: conflicto (email ya registrado, inscripción duplicada, sin cupo disponible)
- **500**: error interno no esperado

## Autenticación con Passport.js

- **register**: valida campos, normaliza email, hashea contraseña, verifica duplicados. La lógica vive en `registerUserService` (`sessions.service.js`); la estrategia de Passport solo delega.
- **login**: valida credenciales con bcrypt. La lógica vive en `loginUserService`; mensaje genérico ante fallos, sin indicar si el email no existe o la contraseña es incorrecta.
- **current**: extrae y verifica el JWT desde la cookie `currentUser`.

El controller (no las estrategias) es responsable de generar el JWT y setear la cookie tras un login exitoso.

## Roles y autorización

### Roles disponibles
- **user** (rol por defecto): consulta eventos publicados y gestiona sus propias inscripciones.
- **organizer**: crea y administra sus propios eventos.
- **admin**: acceso total.

El rol no puede establecerse desde el body del registro público.

### Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Inscribirse a eventos | ✅ | ✅ | ✅ |
| Ver inscriptos de sus propios eventos | ❌ | ✅ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

### Middlewares
- **`auth.middleware.js`**: lee el JWT de la cookie `currentUser`, lo valida y completa `req.user`. Sin sesión válida → **401**.
- **`authorize.middleware.js`**: recibe un array de roles permitidos. Rol no autorizado → **403**.

Ambos son reutilizables y están completamente separados de la lógica de rutas y controllers.

### Diferencia entre 401 y 403
- **401**: no hay sesión iniciada.
- **403**: hay sesión, pero el rol o la propiedad del recurso no habilita la acción.

## Entidad Events

### Modelo
- `title`, `description`, `category`, `location` (string, requeridos)
- `date` (date, requerido)
- `capacity` (number, requerido, > 0)
- `price` (number, requerido, >= 0)
- `status` (enum: `draft`, `published`, `cancelled`, `finished` — default: `draft`)
- `organizer` (referencia a User)

### Rutas

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/events | organizer, admin |
| GET | /api/events | público |
| GET | /api/events/:id | público |
| PUT | /api/events/:id | dueño del evento o admin |
| PATCH | /api/events/:id/status | dueño del evento o admin |

### Filtros, paginación y orden (GET /api/events)

Query params: `status`, `category`, `location`, `dateFrom`, `dateTo`, `page`, `limit`, `sort`.

Ejemplo:

GET /api/events?status=published&category=workshop&page=2&limit=5


Respuesta:
```json
{ "status": "success", "data": [ { "id": "...", "title": "Congreso Tech 2026", "status": "published" } ], "page": 2, "limit": 5, "total": 27, "totalPages": 6 }
```

### Reglas de negocio
- No se permite crear con fecha pasada.
- No se permite publicar un evento `finished` o `cancelled`.
- `capacity` > 0; `price` >= 0.
- Un `organizer` solo modifica sus propios eventos; `admin` modifica cualquiera.
- Un evento `cancelled` no puede modificarse.
- Cancelar cambia `status` a `cancelled`; nunca se elimina físicamente.

## Entidad Tickets (inscripciones)

### Modelo Ticket
- `user` (referencia a User)
- `event` (referencia a Event)
- `status` (enum: `confirmed`, `pending`, `cancelled` — default: `confirmed`)
- `quantity` (number, requerido, > 0)
- `reservationCode` (string, único, autogenerado)
- `createdAt` (automático)
- `cancelledAt` (date, se completa al cancelar)

### Rutas

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/events/:eid/tickets | autenticado |
| GET | /api/tickets/my-tickets | autenticado (propios) |
| GET | /api/events/:eid/tickets | organizer dueño del evento, o admin |
| PATCH | /api/tickets/:tid/cancel | dueño del ticket o admin |

### Reglas de negocio (capa services)
- El evento debe existir, estar `published`, y no estar `cancelled` ni `finished`.
- `quantity` debe ser un número mayor a 0.
- Los cupos disponibles se calculan sumando la `quantity` de los tickets **activos** (no `cancelled`). Un ticket cancelado libera su cupo automáticamente.
- Un usuario no puede tener más de una inscripción activa para el mismo evento (**409** si ya existe una).
- Si no hay cupo suficiente para la cantidad solicitada, se responde **409**.
- Cancelar cambia `status` a `cancelled` y completa `cancelledAt`; el documento nunca se elimina.
- Al confirmarse una inscripción, se envía un email de confirmación con Nodemailer (no bloqueante: si el envío falla, la inscripción igual queda registrada).

### Notificaciones por email
Las credenciales de envío (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`) se leen exclusivamente desde variables de entorno, nunca están hardcodeadas en el código.

## Rutas disponibles (resumen general)

| Método | Ruta | Descripción | Sesión | Roles |
|---|---|---|---|---|
| GET | /api/health | Estado del servidor | No | — |
| POST | /api/sessions/register | Registro | No | — |
| POST | /api/sessions/login | Login | No | — |
| GET | /api/sessions/current | Usuario autenticado | Sí | cualquiera |
| POST | /api/sessions/logout | Logout | No | — |
| GET | /api/events | Listado con filtros | No | — |
| GET | /api/events/:id | Detalle de evento | No | — |
| POST | /api/events | Crear evento | Sí | organizer, admin |
| PUT | /api/events/:id | Modificar evento | Sí | dueño, admin |
| PATCH | /api/events/:id/status | Cambiar estado | Sí | dueño, admin |
| POST | /api/events/:eid/tickets | Inscribirse | Sí | cualquiera |
| GET | /api/events/:eid/tickets | Ver inscriptos | Sí | dueño del evento, admin |
| GET | /api/tickets/my-tickets | Mis inscripciones | Sí | cualquiera |
| PATCH | /api/tickets/:tid/cancel | Cancelar inscripción | Sí | dueño, admin |
| GET | /api/users | Listado de usuarios | Sí | admin |

---

### POST /api/sessions/register

**Request:**
```json
{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }
```

**Response 201** (sin password, filtrada por userDTO):
```json
{
  "status": "success",
  "payload": { "id": "665f2a...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" }
}
```

**Response 400** (campos faltantes / email inválido / password corta):
```json
{ "status": "error", "message": "Faltan campos obligatorios" }
```

**Response 409** (email ya registrado):
```json
{ "status": "error", "message": "El email ya está registrado" }
```

---

### POST /api/sessions/login

**Request:**
```json
{ "email": "ana@mail.com", "password": "Secreta123" }
```

**Response 200** (setea la cookie `currentUser`):
```json
{ "status": "success", "message": "Login correcto" }
```

**Response 401:**
```json
{ "status": "error", "message": "Credenciales inválidas" }
```

---

### GET /api/sessions/current

**Response 200:**
```json
{ "status": "success", "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" } }
```

**Response 401:**
```json
{ "status": "error", "message": "No autenticado" }
```

---

### POST /api/sessions/logout

**Response 200:**
```json
{ "status": "success", "message": "Sesión cerrada" }
```

---

### POST /api/events

**Request:**
```json
{
  "title": "Congreso Tech 2026",
  "description": "Charlas sobre tecnología y desarrollo",
  "category": "conference",
  "date": "2026-12-01",
  "location": "Buenos Aires",
  "capacity": 100,
  "price": 5000
}
```

**Response 201** (filtrada por eventDTO):
```json
{
  "status": "success",
  "payload": {
    "id": "6690...",
    "title": "Congreso Tech 2026",
    "description": "Charlas sobre tecnología y desarrollo",
    "category": "conference",
    "date": "2026-12-01T00:00:00.000Z",
    "location": "Buenos Aires",
    "capacity": 100,
    "price": 5000,
    "status": "draft",
    "organizer": "665f2a..."
  }
}
```

**Response 400 / 401 / 403** según el caso.

---

### GET /api/events

Listado público con filtros, paginación y ordenamiento.

**Response 200:**
```json
{
  "status": "success",
  "data": [ { "id": "...", "title": "Congreso Tech 2026", "status": "published" } ],
  "page": 2,
  "limit": 5,
  "total": 27,
  "totalPages": 6
}
```

---

### GET /api/events/:id

**Response 200:**
```json
{ "status": "success", "payload": { "id": "6690...", "title": "Congreso Tech 2026", "..." : "..." } }
```

**Response 404:**
```json
{ "status": "error", "message": "Evento no encontrado" }
```

---

### PUT /api/events/:id

**Response 200:**
```json
{ "status": "success", "payload": { "id": "6690...", "price": 6000 } }
```

**Response 403** (organizer intentando modificar un evento ajeno):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

**Response 400** (evento cancelado, fecha pasada, capacity/price inválido):
```json
{ "status": "error", "message": "No se puede modificar un evento cancelado" }
```

---

### PATCH /api/events/:id/status

**Request:**
```json
{ "status": "cancelled" }
```

**Response 200:**
```json
{ "status": "success", "payload": { "id": "6690...", "status": "cancelled" } }
```

---

### POST /api/events/:eid/tickets

**Request:**
```json
{ "quantity": 2 }
```

**Response 201:**
```json
{
  "status": "success",
  "payload": {
    "id": "6690...",
    "event": "6690...",
    "user": "665f2a...",
    "quantity": 2,
    "status": "confirmed",
    "reservationCode": "RES-M5X2K1-A9B3F7"
  }
}
```

**Response 401** (sin sesión):
```json
{ "status": "error", "message": "No autenticado" }
```

**Response 404** (evento inexistente):
```json
{ "status": "error", "message": "Evento no encontrado" }
```

**Response 409** (inscripción duplicada o sin cupo):
```json
{ "status": "error", "message": "Ya tenés una inscripción activa a este evento" }
```

---

### GET /api/tickets/my-tickets

**Response 200** (evento filtrado por eventDTO cuando viene populado):
```json
{
  "status": "success",
  "payload": [
    {
      "id": "6690...",
      "status": "confirmed",
      "quantity": 1,
      "reservationCode": "RES-M5X2K1-A9B3F7",
      "event": { "id": "...", "title": "Congreso Tech 2026", "date": "2026-12-01", "location": "Buenos Aires" }
    }
  ]
}
```

---

### GET /api/events/:eid/tickets

**Response 200** (usuario filtrado por userDTO, sin password):
```json
{
  "status": "success",
  "payload": [
    { "id": "6690...", "quantity": 1, "status": "confirmed", "user": { "id": "...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" } }
  ]
}
```

**Response 403** (no es el dueño del evento ni admin):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

---

### PATCH /api/tickets/:tid/cancel

**Response 200:**
```json
{ "status": "success", "payload": { "id": "6690...", "status": "cancelled", "cancelledAt": "2026-08-10T..." } }
```

**Response 403** (ticket ajeno):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

**Response 400** (ya estaba cancelado):
```json
{ "status": "error", "message": "Este ticket ya fue cancelado" }
```

---

### GET /api/users

Requiere sesión y rol `admin`.

**Response 200:**
```json
{ "status": "success", "payload": [ { "id": "...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" } ] }
```

**Response 403:**
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

## Flujo de autenticación e inscripción (paso a paso)

1. **Registro**: `POST /api/sessions/register` con `first_name`, `last_name`, `email`, `password`. El usuario se crea con rol `user`, la contraseña se hashea con bcrypt y nunca se devuelve en la respuesta.
2. **Login**: `POST /api/sessions/login` con `email` y `password`. Si son válidos, se genera un JWT (payload: `id`, `email`, `role`) y se guarda en una cookie `httpOnly` llamada `currentUser`.
3. **Consultar sesión activa**: `GET /api/sessions/current` lee la cookie, valida el JWT y devuelve los datos del usuario autenticado.
4. **Crear un evento** (requiere rol `organizer` o `admin`): `POST /api/events`. El campo `organizer` se asigna automáticamente desde el usuario autenticado.
5. **Publicar el evento**: `PATCH /api/events/:id/status` con `{ "status": "published" }`. Solo un evento `published` admite inscripciones.
6. **Inscribirse**: `POST /api/events/:eid/tickets` con `{ "quantity": N }`. Se valida que el evento exista, esté publicado, tenga cupo disponible, y que el usuario no tenga ya una inscripción activa. Si todo es correcto, se genera un `reservationCode` único y se envía un email de confirmación.
7. **Consultar mis inscripciones**: `GET /api/tickets/my-tickets`, con los datos básicos del evento incluidos vía `populate`.
8. **Cancelar una inscripción**: `PATCH /api/tickets/:tid/cancel`. El ticket cambia a `status: cancelled` (nunca se elimina), liberando el cupo automáticamente para nuevas inscripciones.
9. **Cerrar sesión**: `POST /api/sessions/logout`, elimina la cookie. A partir de ahí, `GET /api/sessions/current` vuelve a responder `401`.

## Cómo probar el flujo completo

1. Levantar el servidor con `npm run dev`
2. Registrar un `organizer` y un `user` (cambiar el rol del organizer manualmente en MongoDB Compass, y volver a loguear)
3. Crear un evento y publicarlo
4. Inscribirse al evento con el usuario `user` → 201 + email de confirmación
5. Intentar inscribirse de nuevo al mismo evento → 409 (duplicado)
6. Intentar inscribirse pidiendo más cupo del disponible → 409
7. Cancelar la inscripción propia → cupo liberado, nueva inscripción funciona
8. Intentar cancelar un ticket ajeno → 403
9. Intentar modificar un evento ajeno como `organizer` → 403
10. Modificar ese mismo evento como `admin` → éxito
11. Confirmar que `/current`, el ticket con populate, y la lista de usuarios nunca incluyan `password`
12. Probar el listado paginado: `GET /api/events?status=published&page=2&limit=5`

## Evidencia

Capturas del flujo completo verificado (registro, login, roles, eventos, tickets, cupos, errores 401/403/409, paginación): ver carpeta `docs/evidencia/`.