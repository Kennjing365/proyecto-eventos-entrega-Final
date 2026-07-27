import express from 'express'

import userRouter from './routes/user.routes.js'
import tikectRouter from './routes/ticket.routes.js'
import eventRouter from './routes/event.routes.js'
import sessionsRouter from './routes/sessions.routes.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'servidor activo' })
})

app.use('/api/user', userRouter)
app.use('/api/tickets', tikectRouter)
app.use('/api/events', eventRouter)
app.use('/api/sessions', sessionsRouter)
export default app