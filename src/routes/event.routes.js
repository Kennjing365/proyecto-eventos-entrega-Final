import { Router } from "express"
import { getAll, createEventController, updateEventController } from "../controllers/event.controller.js"
import { auth } from "../middlewares/auth.middleware.js"
import { authorize } from "../middlewares/authorize.middleware.js"

const router = Router()

// Cualquiera puede ver los eventos publicados (no requiere sesión)
router.get("/", getAll)

// Solo organizer o admin pueden crear eventos
router.post("/", auth, authorize(['organizer', 'admin']), createEventController)

// Solo organizer (dueño) o admin pueden modificar — la validación de dueño vive en el service
router.put("/:id", auth, authorize(['organizer', 'admin']), updateEventController)

export default router