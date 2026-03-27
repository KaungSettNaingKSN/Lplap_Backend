import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayout } from "../controllers/layout.controller";
const LayoutRouter = express.Router();

LayoutRouter.post('/create', isAuthenticated, authorizeRoles("admin"), createLayout)
LayoutRouter.put("/edit", isAuthenticated, authorizeRoles("admin"), editLayout);
LayoutRouter.get("/get/:type", getLayout);

export default LayoutRouter