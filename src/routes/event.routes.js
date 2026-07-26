import { Router } from "express"
import { getAll } from "../controllers/event.controller.js"

const router = Router();

router.get("/", getAll );

export default router;