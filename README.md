# Plataforma de Eventos e Inscripciones

## Temática
Sistema para gestión de eventos, sesiones/inscripciones y tickets.

## Tecnologías
- Node.js
- Express
- Mongoose / MongoDB
- dotenv

## Instalación
1. Cloná el repositorio
2. Ejecutá `npm install`
3. Copiá `.env.example` como `.env` y completá los valores

## Variables de entorno
- PORT: puerto donde corre el servidor
- NODE_ENV: entorno de ejecución (development/production)
- MONGO_URL: cadena de conexión a MongoDB
- JWT_SECRET: clave secreta para tokens JWT (se usará en próximas entregas)

## Cómo ejecutar

npm start

o en modo desarrollo:

npm run dev


## Estructura de carpetas
- src/config: configuración de base de datos y variables de entorno
- src/routes: definición de rutas
- src/controllers: lógica de manejo de requests
- src/services: lógica de negocio (a implementar)
- src/repositories: acceso a datos (a implementar)
- src/dao: acceso directo a la base de datos (a implementar)
- src/models: modelos de datos (User, Event, Ticket)
- src/middlewares: funciones intermedias (a implementar)
- src/utils: funciones auxiliares

## Rutas disponibles
- GET /api/health → estado del servidor
- GET /api/events → lista de eventos
- GET /api/users → lista de usuarios
- GET /api/tickets → lista de tickets
- GET /api/sessions → estructura inicial de sesiones
- POST /api/sessions/register → registro de usuarios

## Registro de usuarios

### POST /api/sessions/register

Campos esperados en el body (JSON):
- first_name (string, requerido)
- last_name (string, requerido)
- email (string, requerido, formato válido)
- password (string, requerido, mínimo 8 caracteres)

Ejemplo de request:
\`\`\`json
{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }
\`\`\`

Respuestas posibles:
- 201: usuario creado exitosamente (la respuesta no incluye la contraseña)
- 400: campos faltantes o email/contraseña con formato inválido
- 409: el email ya está registrado

### Cómo probarlo
1. Levantar el servidor con `npm run dev`
2. Hacer un POST a `http://localhost:3000/api/sessions/register` con el body de ejemplo (Postman, Thunder Client o curl)
3. Verificar que la respuesta no incluya el campo `password`
4. Verificar en MongoDB que la contraseña se guarda hasheada (no en texto plano)# proyecto-eventos-pre-entrega-2
# proyecto-eventos-pre-entrega-2
# proyecto-eventos-pre-entrega-2
# proyecto-eventos-pre-entrega-2
