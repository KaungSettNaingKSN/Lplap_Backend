"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_service_1 = require("../services/order.service");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const redis_1 = require("../utils/redis"); // ✅ was missing
exports.createOrder = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler_1.default("You have already purchased this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const data = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        };
        // ✅ Fixed: mailData was being double-wrapped as { order: mailData }
        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData, // ✅ pass mailData directly, not { order: mailData }
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        // ✅ Fixed: push courseId correctly matching schema { _id: courseId }
        user?.courses.push({ courseId: courseId });
        await user?.save();
        // ✅ Invalidate user cache so updated courses list reflects immediately
        if (user?._id) {
            await redis_1.redis.set(user._id.toString(), JSON.stringify(user), "EX", 604800);
        }
        await notification_model_1.default.create({
            title: "New Order",
            userId: user?._id?.toString(),
            message: `You have a new order from ${course.name}`,
        });
        // ✅ Increment purchased count
        course.purchased = (course.purchased || 0) + 1;
        await course.save();
        // ✅ Invalidate course cache so purchased count updates
        await redis_1.redis.del(courseId);
        await redis_1.redis.del("allCourses");
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getAllOrders = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
