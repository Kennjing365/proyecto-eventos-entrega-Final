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
├── repositories/
│ └── user.repository.js
├── dao/
│ └── users.dao.js
├── models/
│ ├── event.model.js
│ ├── ticket.model.js
│ └── user.model.js
├── middlewares/
└── utils/
├── hash.js # bcrypt (hash y comparación de contraseñas)
└── jwt.js # generación de JWT

## Autenticación con Passport.js

La autenticación fue refactorizada para centralizar toda su lógica en estrategias de Passport, definidas en `src/config/passport.config.js`. El contrato externo de la API (rutas, métodos y formato de respuestas) **no cambió** respecto de la entrega anterior — solo cambió la organización interna.

Estrategias implementadas:

- **register** (`passport-local`): valida los campos obligatorios, el formato del email y la longitud de la contraseña, normaliza el email, verifica que no exista un usuario con ese email, hashea la contraseña con bcrypt y crea el usuario en la base de datos.
- **login** (`passport-local`): busca el usuario por email y compara la contraseña con bcrypt. Nunca revela si falló el email o la contraseña — siempre responde con un mensaje genérico.
- **current** (`passport-jwt`): extrae el JWT desde la cookie `currentUser`, lo verifica contra `JWT_SECRET` y deja el payload disponible en `req.user`.

El controller (no las estrategias) es responsable de generar el JWT y setear la cookie tras un login exitoso, y de armar las respuestas finales.

`passport.config.js` está organizado para poder sumar nuevas estrategias en el futuro (por ejemplo, login con Google o GitHub) sin necesidad de modificar `app.js`.

## Rutas disponibles

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| GET | /api/health | Estado del servidor | No |
| GET | /api/events | Lista de eventos | No |
| GET | /api/users | Lista de usuarios | No |
| GET | /api/tickets | Lista de tickets | No |
| POST | /api/sessions/register | Registro de usuarios | No |
| POST | /api/sessions/login | Login de usuarios | No |
| GET | /api/sessions/current | Usuario autenticado | Sí (cookie + estrategia Passport) |
| POST | /api/sessions/logout | Cierra la sesión | No |

---

### POST /api/sessions/register

Registra un nuevo usuario. La validación, normalización, hash de contraseña y creación del usuario ocurren dentro de la estrategia `register` de Passport.

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

La estrategia `login` de Passport valida las credenciales. Si son correctas, el controller genera un JWT (payload: id, email, role) y lo guarda en una cookie httpOnly llamada `currentUser`.

**Request:**
```json
{ "email": "ana@mail.com", "password": "Secreta123" }
```

**Response 200** (además setea la cookie `currentUser`):
```json
{ "status": "success", "message": "Login correcto" }
```

**Response 401** (credenciales incorrectas, mensaje genérico):
```json
{ "status": "error", "message": "Credenciales inválidas" }
```

---

### GET /api/sessions/current

Protegida por la estrategia `current` de Passport. Lee la cookie `currentUser`, verifica el JWT y devuelve los datos del usuario autenticado (sin password).

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

Elimina la cookie `currentUser`. No pasa por ninguna estrategia de Passport.

**Response 200:**
```json
{ "status": "success", "message": "Sesión cerrada" }
```

## Cómo probar el flujo completo

1. Levantar el servidor con `npm run dev`
2. Registrar un usuario: `POST /api/sessions/register`
3. Registrar el mismo email de nuevo → debería devolver 409
4. Hacer login: `POST /api/sessions/login` (Postman guarda la cookie automáticamente)
5. Hacer login con contraseña incorrecta → debería devolver 401
6. Consultar el usuario autenticado: `GET /api/sessions/current` → 200
7. Borrar la cookie manualmente y volver a consultar `/current` → 401
8. Cerrar sesión: `POST /api/sessions/logout`
9. Volver a consultar `GET /api/sessions/current` → 401