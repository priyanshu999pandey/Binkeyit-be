import {Router} from "express";
import { forgotPasswordController, loginUserController, logoutUserController, refreshTokenController, registerUserController, resetPassword, updateUserProfile, uploadAvatar, userDetail, verifyEmailController, verifyFogotPassword } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register",registerUserController)
userRouter.post("/verify-email",verifyEmailController)
userRouter.post("/login",loginUserController)
userRouter.post("/logout",auth,logoutUserController)
userRouter.put("/upload-avatar",auth,upload.single("avatar"),uploadAvatar)
userRouter.put("/update-profile",auth,updateUserProfile);
userRouter.put("/forgot-password",forgotPasswordController);
userRouter.put("/verify-forgot-password",verifyFogotPassword);
userRouter.put("/reset-password",resetPassword);
userRouter.post("/refresh-token",auth,refreshTokenController);
userRouter.get("/user-detail",auth,userDetail);








export default userRouter;