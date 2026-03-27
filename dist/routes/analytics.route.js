"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const AnalyticsRouter = express_1.default.Router();
AnalyticsRouter.get('/user', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getUsersAnalytics);
AnalyticsRouter.get('/course', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getCourseAnalytics);
AnalyticsRouter.get('/order', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getOrderAnalytics);
exports.default = AnalyticsRouter;
