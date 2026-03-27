import express from "express";
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const UserRouter = express.Router();

UserRouter.post('/registration', registrationUser)
UserRouter.post('/social-auth', socialAuth)
UserRouter.post('/activate-user', activateUser)
UserRouter.post('/login', loginUser)
UserRouter.get('/logout', isAuthenticated, logoutUser)
UserRouter.get('/refreshtoken', updateAccessToken)
UserRouter.get("/me", isAuthenticated, getUserInfo);
UserRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
UserRouter.put("/update-user-password", isAuthenticated, updatePassword);
UserRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture);
UserRouter.put("/update-role", isAuthenticated, authorizeRoles("admin"), updateUserRole);
UserRouter.get('/get-all', isAuthenticated, authorizeRoles("admin"), getAllUsers)
UserRouter.delete("/delete-user/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);



export default UserRouter