# Plataforma de Eventos e Inscripciones

## Temática
Sistema para gestión de eventos, sesiones/inscripciones y tickets, con autenticación de usuarios mediante JWT y cookies.

## Tecnologías
- Node.js
- Express
- MongoDB / Mongoose
- dotenv
- bcrypt
- jsonwebtoken
- cookie-parser

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
npm run dev


## Estructura de carpetas

src/
├── app.js # configura Express (no levanta el server)
├── server.js # levanta el servidor
├── config/
│ ├── dataBase.js # conexión a MongoDB
│ └── env.js # variables de entorno
├── routes/
│ ├── event.routes.js
│ ├── user.routes.js
│ ├── ticket.routes.js
│ └── sessions.router.js
├── controllers/
│ ├── event.controller.js
│ ├── user.controllers.js
│ ├── ticket.controllers.js
│ └── sessions.controller.js
├── services/
│ └── sessions.service.js
├── repositories/
│ └── users.repository.js
├── dao/
│ └── users.dao.js
├── models/
│ ├── event.model.js
│ ├── ticket.model.js
│ └── user.model.js
├── middlewares/
│ └── auth.middleware.js
└── utils/
├── hash.js # bcrypt (hash y comparación de contraseñas)
└── jwt.js # generación y verificación de JWT

## Rutas disponibles

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| GET | /api/health | Estado del servidor | No |
| GET | /api/events | Lista de eventos | No |
| GET | /api/users | Lista de usuarios | No |
| GET | /api/tickets | Lista de tickets | No |
| POST | /api/sessions/register | Registro de usuarios | No |
| POST | /api/sessions/login | Login de usuarios | No |
| GET | /api/sessions/current | Usuario autenticado | Sí (cookie) |
| POST | /api/sessions/logout | Cierra la sesión | No |

---

### POST /api/sessions/register

Registra un nuevo usuario. Valida campos obligatorios, formato de email y longitud de contraseña, normaliza el email (trim + lowercase) y rechaza duplicados. La contraseña se guarda hasheada con bcrypt y nunca se devuelve en la respuesta.

Campos esperados en el body (JSON):
- first_name (string, requerido)
- last_name (string, requerido)
- email (string, requerido, formato válido)
- password (string, requerido, mínimo 8 caracteres)

**Request:**
```json
{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }
```

**Response 201** (usuario creado, sin password):
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

Valida email y contraseña. Si son correctos, genera un JWT (payload: id, email, role) y lo guarda en una cookie httpOnly llamada `currentUser`. Si algo falla, siempre responde el mismo mensaje genérico, sin indicar si el email no existe o la contraseña es incorrecta.

**Request:**
```json
{ "email": "ana@mail.com", "password": "Secreta123" }
```

**Response 200** (además setea la cookie `currentUser`):
```json
{ "status": "success", "message": "Login correcto" }
```

**Response 401** (credenciales incorrectas):
```json
{ "status": "error", "message": "Credenciales inválidas" }
```

---

### GET /api/sessions/current

Ruta protegida por el middleware `auth`. Lee la cookie `currentUser`, verifica el JWT y devuelve los datos del usuario autenticado (sin password).

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

Elimina la cookie `currentUser`, cerrando la sesión del usuario.

**Response 200:**
```json
{ "status": "success", "message": "Sesión cerrada" }
```

## Cómo probar el flujo completo

1. Levantar el servidor con `npm run dev`
2. Registrar un usuario: `POST /api/sessions/register`
3. Hacer login: `POST /api/sessions/login` (Postman guarda la cookie automáticamente)
4. Consultar el usuario autenticado: `GET /api/sessions/current`
5. Cerrar sesión: `POST /api/sessions/logout`
6. Volver a consultar `GET /api/sessions/current` → debería devolver 401# proyecto-eventos-pre-entrega-3
