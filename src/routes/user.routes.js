import { Router } from "express"
import { getAllUser } from "../controllers/user.controller.js"
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js"

const router = Router();

router.get("/", auth, authorize(['admin']), getAllUser );

export default router;