import {Router} from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from 
"../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router =Router()

router.route("/register-User").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1 
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ])
    ,registerUser)

router.route("/login-User").post(loginUser)

router.route("/logOut-User").post(verifyJWT,logoutUser)

router.route("/refreshToken-User").post(refreshAccessToken)

export default router