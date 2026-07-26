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
- GET /api/sessions → estructura inicial de sesiones# proyecto-eventos-pre-entrega-1
# proyecto-eventos-pre-entrega-1
# proyecto-eventos-pre-entrega-1-Comisi-n-101730
