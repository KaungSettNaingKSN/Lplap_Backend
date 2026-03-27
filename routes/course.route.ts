import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { addAnswer, addQuestion, addReplyToReview, addReview, deleteCourse, editCourse, getAllCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";
const CourseRouter = express.Router();

CourseRouter.post('/create', isAuthenticated, authorizeRoles("admin"), uploadCourse)
CourseRouter.get('/get-all', isAuthenticated, authorizeRoles("admin"), getAllCourse)
CourseRouter.get('/get', getAllCourses)
CourseRouter.put('/add-comment',isAuthenticated, addQuestion)
CourseRouter.put('/add-answer',isAuthenticated, addAnswer)
CourseRouter.put('/add-reply', isAuthenticated, authorizeRoles("admin"), addReplyToReview)
CourseRouter.put('/add-review/:id',isAuthenticated, addReview)
CourseRouter.put('/update/:id', isAuthenticated, authorizeRoles("admin"), editCourse)
CourseRouter.get('/get-content/:id',isAuthenticated, getCourseByUser)
CourseRouter.get('/get-single/:id', getSingleCourse)
CourseRouter.delete("/delete-course/:id", isAuthenticated, authorizeRoles("admin"), deleteCourse);

export default CourseRouter