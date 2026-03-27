"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const order_controller_1 = require("../controllers/order.controller");
const OrderRouter = express_1.default.Router();
OrderRouter.post('/create', auth_1.isAuthenticated, order_controller_1.createOrder);
OrderRouter.get('/get-all', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), order_controller_1.getAllOrders);
exports.default = OrderRouter;
