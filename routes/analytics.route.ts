import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics, getOrderAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";
const AnalyticsRouter = express.Router();

AnalyticsRouter.get('/user', isAuthenticated, authorizeRoles("admin"), getUsersAnalytics)
AnalyticsRouter.get('/course', isAuthenticated, authorizeRoles("admin"), getCourseAnalytics)
AnalyticsRouter.get('/order', isAuthenticated, authorizeRoles("admin"), getOrderAnalytics)

export default AnalyticsRouter