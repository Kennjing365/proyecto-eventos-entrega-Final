import { Router } from "express"
import { getAllTickets } from "../controllers/ticket.controller.js"

const router = Router();

router.get("/", getAllTickets );

export default router;