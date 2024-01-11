import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"

const router =Router()

router.route("/register-User",registerUser)

export default router