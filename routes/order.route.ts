import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controllers/order.controller";
const OrderRouter = express.Router();

OrderRouter.post('/create', isAuthenticated, createOrder)
OrderRouter.get('/get-all', isAuthenticated, authorizeRoles("admin"), getAllOrders)

export default OrderRouter