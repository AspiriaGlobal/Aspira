import { Router } from "express";
import { logoutController, refreshController, signupController, loginController } from "./auth.controller";


const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/refresh", refreshController)
router.post("/logout", logoutController)

export default router;