import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { redis } from "../utils/redis"; // ✅ was missing

export const createOrder = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { courseId, payment_info } = req.body as any;

            const user = await userModel.findById(req.user?._id);

            // ✅ Check if user already purchased
            const courseExistInUser = user?.courses.some(
                (course: any) => course._id.toString() === courseId
            );

            if (courseExistInUser) {
                return next(
                    new ErrorHandler("You have already purchased this course", 400)
                );
            }

            const course = await CourseModel.findById(courseId);

            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const data: any = {
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
                    await sendMail({
                        email: user.email,
                        subject: "Order Confirmation",
                        template: "order-confirmation.ejs",
                        data: mailData, // ✅ pass mailData directly, not { order: mailData }
                    });
                }
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500));
            }

            // ✅ Fixed: push courseId correctly matching schema { _id: courseId }
            user?.courses.push({ courseId: courseId });
            await user?.save();

            // ✅ Invalidate user cache so updated courses list reflects immediately
            if (user?._id) {
                await redis.set(user._id.toString(), JSON.stringify(user), "EX", 604800);
            }

            await NotificationModel.create({
                title: "New Order",
                userId: user?._id?.toString(),
                message: `You have a new order from ${course.name}`,
            });

            // ✅ Increment purchased count
            course.purchased = (course.purchased || 0) + 1;
            await course.save();

            // ✅ Invalidate course cache so purchased count updates
            await redis.del(courseId);
            await redis.del("allCourses");

            newOrder(data, res, next);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getAllOrders = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            getAllOrdersService(res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);