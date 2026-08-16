import { Router } from 'express'
import passport from 'passport'
import { register, login, current, logout } from '../controllers/sessions.controller.js'
import { auth } from '../middlewares/auth.middleware.js'
import { handleError } from '../utils/errorHandler.js'

const router = Router()

router.post('/register', (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
        if (err) return handleError(res, 'error_interno')
        if (!user) return handleError(res, info?.message || 'campos_faltantes')
        req.user = user
        next()
    })(req, res, next)
}, register)

router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) return handleError(res, 'error_interno')
        if (!user) return handleError(res, 'credenciales_invalidas')
        req.user = user
        next()
    })(req, res, next)
}, login)

router.get('/current', auth, current)
router.post('/logout', logout)

export default router