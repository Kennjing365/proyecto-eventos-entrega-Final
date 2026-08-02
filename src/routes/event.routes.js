import { Router } from "express"
import {
    createEventController,
    getAllEventsController,
    getEventByIdController,
    updateEventController,
    updateEventStatusController
} from "../controllers/event.controller.js"
import { createTicketController, getEventTicketsController } from "../controllers/ticket.controller.js"
import { auth } from "../middlewares/auth.middleware.js"
import { authorize } from "../middlewares/authorize.middleware.js"

const router = Router()

router.get("/", getAllEventsController)
router.get("/:id", getEventByIdController)
router.post("/", auth, authorize(['organizer', 'admin']), createEventController)
router.put("/:id", auth, authorize(['organizer', 'admin']), updateEventController)
router.patch("/:id/status", auth, authorize(['organizer', 'admin']), updateEventStatusController)

// rutas anidadas de tickets
router.post("/:eid/tickets", auth, createTicketController)
router.get("/:eid/tickets", auth, authorize(['organizer', 'admin']), getEventTicketsController)

export default router