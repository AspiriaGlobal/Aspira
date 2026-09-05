import { Router } from "express";
import { logoutController, refreshController, signupController, loginController, googleLoginController } from "./auth.controller";


const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/refresh", refreshController)
router.post("/logout", logoutController)
router.post("/google", googleLoginController);
    
export default router;