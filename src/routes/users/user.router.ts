import  Express  from "express";
import { listAlluser, loginUser, registerNewUser, refreshToken, logoutUser, getAuthenticatedUser, updateUser, deleteUser } from "../../controllers/users/user.controller";
import { loginSchema, registerSchema } from "../../validator/user.joi";
import { validate } from "../../validator/validate";
import { admin, protect } from "../../middlewares/auth";
const userRouter = Express.Router()

userRouter.post("/create", validate(registerSchema),registerNewUser)
userRouter.post("/login", validate(loginSchema), loginUser);
userRouter.post("/refresh-token", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/me", protect, getAuthenticatedUser);
userRouter.patch("/update/:userId", protect, updateUser);
userRouter.delete("/delete/:userId", protect, admin, deleteUser);
userRouter.get("/", protect, admin, listAlluser);
export default userRouter