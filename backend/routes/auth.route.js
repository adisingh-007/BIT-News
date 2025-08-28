import express from "express"
import { google, signin, signup, makeAdmin, checkUserStatus } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.post("/google", google)
router.post("/make-admin", makeAdmin)
router.get("/check-user", checkUserStatus)

export default router