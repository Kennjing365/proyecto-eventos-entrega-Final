# Plataforma de Eventos e Inscripciones

## Temática
Sistema para gestión de eventos e inscripciones, con autenticación centralizada mediante Passport.js, JWT y cookies, autorización por roles, entidad Events con reglas de negocio, y sistema de Tickets con control de cupos y notificaciones por email.

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
- PORT: puerto donde corre el servidor
- NODE_ENV: entorno de ejecución (development/production)
- MONGO_URL: cadena de conexión a MongoDB
- JWT_SECRET: clave secreta para firmar los JWT
- JWT_EXPIRES_IN: tiempo de expiración del JWT (ej: 1h)
- MAIL_HOST: host SMTP para el envío de emails
- MAIL_PORT: puerto SMTP
- MAIL_USER: usuario/casilla de email
- MAIL_PASS: contraseña de aplicación (nunca la contraseña normal de la cuenta)
- MAIL_FROM: dirección remitente de los emails

## Cómo ejecutar

npm run dev


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
│ ├── user.controllers.js
│ ├── ticket.controller.js
│ └── sessions.controller.js
├── services/
│ ├── sessions.service.js
│ ├── events.service.js
│ └── tickets.service.js
├── repositories/
│ ├── user.repository.js
│ ├── events.repository.js
│ └── tickets.repository.js
├── dao/
│ ├── users.dao.js
│ ├── events.dao.js
│ └── tickets.dao.js
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
└── mailer.js


## Autenticación con Passport.js

- **register**: valida campos, normaliza email, hashea contraseña, verifica duplicados.
- **login**: valida credenciales con bcrypt, mensaje genérico ante fallos.
- **current**: extrae y verifica el JWT desde la cookie `currentUser`.

El controller genera el JWT y setea la cookie tras un login exitoso.

## Roles y autorización

### Roles disponibles
- **user** (default): consulta eventos publicados y gestiona sus propias inscripciones.
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
- **`auth.middleware.js`**: valida el JWT de la cookie. Sin sesión válida → **401**.
- **`authorize.middleware.js`**: recibe roles permitidos. Rol no autorizado → **403**.

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
{ "status": "success", "data": [ /* eventos */ ], "page": 2, "limit": 5, "total": 23, "totalPages": 5 }
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
- Un usuario no puede tener más de una inscripción activa para el mismo evento.
- Cancelar cambia `status` a `cancelled` y completa `cancelledAt`; el documento nunca se elimina.
- Al confirmarse una inscripción, se envía un email de confirmación con Nodemailer (no bloqueante: si el envío falla, la inscripción igual queda registrada).

### Notificaciones por email
Las credenciales de envío (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`) se leen exclusivamente desde variables de entorno, nunca están hardcodeadas en el código. Cualquier persona que clone el repositorio puede usar sus propias credenciales (por ejemplo, una contraseña de aplicación de Gmail o un inbox de Mailtrap) sin modificar el código fuente.

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
    "user": "665f2a...",
    "event": "6690...",
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

**Response 400** (evento no disponible, sin cupo, inscripción duplicada o cantidad inválida):
```json
{ "status": "error", "message": "No hay cupos suficientes disponibles" }
```

---

### GET /api/tickets/my-tickets

**Response 200:**
```json
{
  "status": "success",
  "payload": [
    {
      "id": "6690...",
      "status": "confirmed",
      "quantity": 1,
      "reservationCode": "RES-M5X2K1-A9B3F7",
      "event": { "title": "Congreso Tech 2026", "date": "2026-12-01", "location": "Buenos Aires" }
    }
  ]
}
```

---

### PATCH /api/tickets/:tid/cancel

**Response 200:**
```json
{ "status": "success", "payload": { "id": "6690...", "status": "cancelled", "cancelledAt": "2026-08-02T..." } }
```

**Response 403** (ticket ajeno):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

---

### GET /api/events/:eid/tickets

**Response 200:**
```json
{
  "status": "success",
  "payload": [
    { "id": "6690...", "quantity": 1, "status": "confirmed", "user": { "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com" } }
  ]
}
```

**Response 403** (no es el dueño del evento ni admin):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

## Cómo probar el flujo completo

1. Levantar el servidor con `npm run dev`
2. Registrar un organizer y un usuario común (cambiar el rol del organizer manualmente en MongoDB Compass)
3. Crear un evento y publicarlo (`PATCH /api/events/:id/status`)
4. Inscribirse al evento con el usuario común → 201 + email de confirmación
5. Probar inscripción sin sesión → 401
6. Probar inscripción a evento inexistente → 404
7. Cancelar el evento y probar inscribirse → 400
8. Crear un evento con poco cupo e intentar pedir más cantidad de la disponible → 400
9. Inscribirse dos veces al mismo evento con el mismo usuario → segunda vez 400
10. Consultar `GET /api/tickets/my-tickets` → 200 con datos del evento vía populate
11. Cancelar el ticket propio y volver a inscribirse → cupo liberado, 201
12. Intentar cancelar un ticket ajeno como user → 403
13. Consultar `GET /api/events/:eid/tickets` como user común → 403
14. Consultar como organizer de otro evento → 403
15. Consultar como el organizer dueño del evento → 200

## Evidencia

Captura del email de confirmación recibido tras una inscripción exitosa:

![Email de confirmación](docs/email-confirmacion.png)