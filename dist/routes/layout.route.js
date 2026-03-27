"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const layout_controller_1 = require("../controllers/layout.controller");
const LayoutRouter = express_1.default.Router();
LayoutRouter.post('/create', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layout_controller_1.createLayout);
LayoutRouter.put("/edit", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layout_controller_1.editLayout);
LayoutRouter.get("/get/:type", layout_controller_1.getLayout);
exports.default = LayoutRouter;
