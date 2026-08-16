//todo
import express from 'express'

import userRouter from './routes/user.routes.js'
import ticketRouter from './routes/ticket.routes.js'
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
app.use('/api/tickets', ticketRouter)
app.use('/api/events', eventRouter)
app.use('/api/sessions', sessionsRouter)

export default app