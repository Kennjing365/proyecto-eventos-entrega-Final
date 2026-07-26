import { Router } from 'express'
import { getAllSessions } from '../controllers/session.controller.js'

const router = Router()

router.get('/', getAllSessions)

export default router