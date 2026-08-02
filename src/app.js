//todo
import express from 'express'

import userRouter from './routes/user.routes.js'
import tikectRouter from './routes/ticket.routes.js'
import eventRouter from './routes/event.routes.js'

import sessionsRouter from './routes/sessions.routes.js'
import cookieParser from 'cookie-parser'
import passport, { initPassport } from './config/passport.config.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

initPassport()
app.use(passport.initialize())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'servidor activo' })
})

//rutas
app.use('/api/users', userRouter)
app.use('/api/tickets', tikectRouter)
app.use('/api/events', eventRouter)
app.use('/api/sessions', sessionsRouter)


//middleware de manejo de errores de Passport
app.use((err, req, res, next) => {
    if (err && err.message) {
        const messageMap = {
            campos_faltantes: { status: 400, message: 'Faltan campos obligatorios' },
            email_invalido: { status: 400, message: 'El formato del email no es válido' },
            password_invalido: { status: 400, message: 'La contraseña debe tener al menos 8 caracteres' },
            email_existente: { status: 409, message: 'El email ya está registrado' },
            credenciales_invalidas: { status: 401, message: 'Credenciales inválidas' }
        }

        const known = messageMap[err.message]
        if (known) {
            return res.status(known.status).json({ status: 'error', message: known.message })
        }
    }

    console.log(err)
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
})

export default app