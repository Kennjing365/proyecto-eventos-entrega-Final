import { Router } from 'express'
import passport from 'passport'
import { register, login, current, logout } from '../controllers/sessions.controller.js'
import { auth } from '../middlewares/auth.middleware.js'

const router = Router()

const errorMap = {
    campos_faltantes: { status: 400, message: 'Faltan campos obligatorios' },
    email_invalido: { status: 400, message: 'El formato del email no es válido' },
    password_invalido: { status: 400, message: 'La contraseña debe tener al menos 8 caracteres' },
    email_existente: { status: 409, message: 'El email ya está registrado' },
    credenciales_invalidas: { status: 401, message: 'Credenciales inválidas' }
}

router.post('/register', (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
        }
        if (!user) {
            const known = errorMap[info?.message] || { status: 400, message: 'Faltan campos obligatorios' }
            return res.status(known.status).json({ status: 'error', message: known.message })
        }
        req.user = user
        next()
    })(req, res, next)
}, register)

router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor' })
        }
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' })
        }
        req.user = user
        next()
    })(req, res, next)
}, login)

router.get('/current', auth, current)

router.post('/logout', logout)

export default router