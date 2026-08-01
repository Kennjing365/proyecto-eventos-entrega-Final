# Plataforma de Eventos e Inscripciones

## Temática
Sistema para gestión de eventos, sesiones/inscripciones y tickets, con autenticación de usuarios centralizada mediante Passport.js, JWT y cookies.

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

## Cómo ejecutar
npm runn dev

## Estructura de carpetas

src/
├── app.js # configura Express e inicializa Passport
├── server.js # levanta el servidor
├── config/
│ ├── dataBase.js # conexión a MongoDB
│ ├── env.js # variables de entorno
│ └── passport.config.js # estrategias de Passport (register, login, current)
├── routes/
│ ├── event.routes.js
│ ├── user.routes.js
│ ├── ticket.routes.js
│ └── sessions.routes.js
├── controllers/
│ ├── event.controller.js
│ ├── user.controllers.js
│ ├── ticket.controllers.js
│ └── sessions.controller.js
├── services/
│ ├── sessions.service.js
│ └── events.service.js
├── repositories/
│ ├── user.repository.js
│ └── events.repository.js
├── dao/
│ ├── users.dao.js
│ └── events.dao.js
├── models/
│ ├── event.model.js
│ ├── ticket.model.js
│ └── user.model.js
├── middlewares/
│ ├── auth.middleware.js # valida JWT de la cookie → 401 si no hay sesión
│ └── authorize.middleware.js # recibe roles permitidos → 403 si el rol no coincide
└── utils/
├── hash.js # bcrypt (hash y comparación de contraseñas)
└── jwt.js # generación y verificación de JWT

## Autenticación con Passport.js

La autenticación está centralizada en estrategias de Passport, definidas en `src/config/passport.config.js`:

- **register** (`passport-local`): valida campos obligatorios, formato de email y longitud de contraseña, normaliza el email, verifica que no exista, hashea la contraseña con bcrypt y crea el usuario.
- **login** (`passport-local`): busca el usuario por email y compara la contraseña con bcrypt. Siempre responde con un mensaje genérico si algo falla, sin indicar si el email no existe o la contraseña es incorrecta.
- **current** (`passport-jwt`): extrae el JWT desde la cookie `currentUser`, lo verifica y deja el payload disponible en `req.user`.

El controller (no las estrategias) es responsable de generar el JWT y setear la cookie tras un login exitoso.

## Roles y autorización

### Roles disponibles
- **user** (rol por defecto): puede consultar eventos publicados.
- **organizer**: puede crear eventos y modificar/cancelar los eventos que él mismo creó.
- **admin**: acceso total, incluyendo ver todos los usuarios y modificar cualquier evento.

El rol **no puede establecerse desde el body del registro público** — todo usuario nuevo se crea con `role: "user"` por defecto, sin importar qué se envíe en la petición.

### Matriz de permisos

| Acción |                           |user | organizer |admin|
|---|---|---|---|
| Consultar eventos publicados       | ✅ |     ✅    | ✅ |
| Crear eventos                      | ❌ |     ✅    | ✅ |
| Modificar/cancelar eventos propios | ❌ |     ✅    | ✅ |
| Modificar cualquier evento         | ❌ |     ❌    | ✅ |
| Ver todos los usuarios             | ❌ |     ❌    | ✅ |

### Middlewares de autenticación y autorización

- **`auth.middleware.js`**: lee el JWT desde la cookie `currentUser`, lo valida y completa `req.user`. Si no hay cookie o el token es inválido/expirado, responde **401**.
- **`authorize.middleware.js`**: recibe como parámetro un array de roles permitidos (por ejemplo `authorize(['organizer', 'admin'])`). Si el usuario autenticado no tiene uno de esos roles, responde **403**.

Ambos middlewares son reutilizables y están completamente separados de la lógica de las rutas y los controllers.

### Diferencia entre 401 y 403

- **401 — No autenticado**: no hay sesión iniciada (falta la cookie, o el token es inválido/expirado).
- **403 — Sin permisos**: el usuario sí tiene una sesión válida, pero su rol no le permite realizar la acción solicitada.

### Propiedad de recursos

Un `organizer` solo puede modificar los eventos que él mismo creó. Un `admin` puede modificar cualquier evento, sin importar quién lo haya creado. Esta validación se resuelve en `events.service.js`, comparando el campo `organizer` guardado en el evento contra el `id` del usuario autenticado (`req.user`).

## Rutas disponibles

| Método | Ruta | Descripción | Requiere sesión | Roles permitidos |
|---|---|---|---|---|
| GET | /api/health | Estado del servidor | No | — |
| GET | /api/events | Lista de eventos publicados | No | — |
| POST | /api/events | Crear un evento | Sí | organizer, admin |
| PUT | /api/events/:id | Modificar un evento | Sí | organizer (dueño) o admin |
| GET | /api/users | Lista de todos los usuarios | Sí | admin |
| GET | /api/tickets | Lista de tickets | No | — |
| POST | /api/sessions/register | Registro de usuarios | No | — |
| POST | /api/sessions/login | Login de usuarios | No | — |
| GET | /api/sessions/current | Usuario autenticado | Sí | Cualquier rol autenticado |
| POST | /api/sessions/logout | Cierra la sesión | No | — |

---

### POST /api/sessions/register

Campos esperados en el body (JSON):
- first_name (string, requerido)
- last_name (string, requerido)
- email (string, requerido, formato válido)
- password (string, requerido, mínimo 8 caracteres)

**Request:**
```json
{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }
```

**Response 201:**
```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

**Response 400** (campos faltantes o inválidos):
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
{
  "status": "success",
  "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" }
}
```

**Response 401** (sin cookie o token inválido/expirado):
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

Requiere sesión y rol `organizer` o `admin`.

**Request:**
```json
{ "name": "Congreso Tech 2026", "date": "2026-11-10", "place": "Buenos Aires", "price": 5000 }
```

**Response 201:**
```json
{
  "status": "success",
  "payload": { "id": "6690...", "name": "Congreso Tech 2026", "organizer": "665f2a..." }
}
```

**Response 401** (sin sesión):
```json
{ "status": "error", "message": "No autenticado" }
```

**Response 403** (rol `user`, sin permiso):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

---

### PUT /api/events/:id

Requiere sesión. Un `organizer` solo puede modificar sus propios eventos; un `admin` puede modificar cualquiera.

**Response 200:**
```json
{ "status": "success", "payload": { "id": "6690...", "name": "Congreso Tech 2026 (actualizado)" } }
```

**Response 403** (organizer intentando modificar un evento ajeno):
```json
{ "status": "error", "message": "No podés modificar un evento que no te pertenece" }
```

---

### GET /api/users

Requiere sesión y rol `admin`.

**Response 200:**
```json
{ "status": "success", "payload": [ /* lista de usuarios */ ] }
```

**Response 403** (rol distinto de admin):
```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

## Cómo probar el flujo completo

1. Levantar el servidor con `npm run dev`
2. Registrar un usuario (queda con rol `user` por defecto)
3. Para probar roles distintos, cambiar manualmente el campo `role` del usuario en MongoDB Compass (a `organizer` o `admin`) y volver a hacer login (el rol queda fijado en el JWT desde el momento del login)
4. Probar `POST /api/events` con un usuario `user` → 403
5. Probar `POST /api/events` con un usuario `organizer` → 201
6. Probar `GET /api/users` con un usuario `organizer` → 403
7. Probar `GET /api/users` con un usuario `admin` → 200
8. Probar cualquier ruta protegida sin cookie → 401
9. Probar que un `organizer` no pueda modificar un evento creado por otro `organizer` → 403