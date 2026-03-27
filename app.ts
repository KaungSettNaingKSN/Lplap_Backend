import express, { NextFunction, Request, Response } from 'express'
require('dotenv').config();
export const app = express();
import cors from "cors"
import cookieParser from 'cookie-parser';
import { ErrorMiddleware } from './middleware/error';
import UserRouter from './routes/user.route';
import CourseRouter from './routes/course.route';
import OrderRouter from './routes/order.route';
import NotificationRouter from './routes/notification.route';
import AnalyticsRouter from './routes/analytics.route';
import LayoutRouter from './routes/layout.route';

app.use(express.json({limit:"50mb"}))
app.use(cookieParser())

app.use(cors({
  origin:"http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use('/api/v1/user', UserRouter)
app.use('/api/v1/course', CourseRouter)
app.use('/api/v1/order', OrderRouter)
app.use('/api/v1/notification', NotificationRouter)
app.use('/api/v1/analytics', AnalyticsRouter)
app.use('/api/v1/layout', LayoutRouter)

app.all(/.*/, (req, res, next)=>{
    const err = new Error(`Route ${req.originalUrl} not found`) as any
    err.statusCode = 404
    next(err)
})

app.use(ErrorMiddleware)