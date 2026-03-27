import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCourseService } from "../services/course.service";
import courseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "node:path";
import sendMail from "../utils/sendMail";
import userModel from "../models/user.model";

export const uploadCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const thumbnail = data.thumbnail;

            if (thumbnail) {
                const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });

                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }

            await createCourse(data, res, next);
            await redis.del("allCourses");
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const editCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const courseId = req.params.id;

            const course = await courseModel.findById(courseId);

            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const thumbnail = data.thumbnail;

            if (thumbnail) {
                if (course.thumbnail?.public_id) {
                    await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
                }

                const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });

                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }

            const updatedCourse = await courseModel.findByIdAndUpdate(
                courseId,
                { $set: data },
                // { new: true }
                { returnDocument: "after" }
            );

            await redis.set(courseId.toString(), JSON.stringify(updatedCourse), "EX", 604800);
            await redis.del("allCourses");

            res.status(200).json({
                success: true,
                course: updatedCourse,
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getSingleCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courseId = req.params.id as string;
            const isCacheExist = await redis.get(courseId)
            if (isCacheExist) {
                const course = JSON.parse(isCacheExist);
                res.status(200).json({
                    success: true,
                    course,
                });
            } else {
                const course = await courseModel.findById(req.params.id);
                await redis.set(courseId, JSON.stringify(course), "EX", 604800);
                res.status(200).json({
                    success: true,
                    course,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getAllCourses = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isCacheExist = await redis.get("allCourses")
            if (isCacheExist) {
                const courses = JSON.parse(isCacheExist);
                res.status(200).json({
                    success: true,
                    courses,
                });
            } else {
                const courses = await courseModel.find().select(
                    "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
                );

                await redis.set("allCourses", JSON.stringify(courses), "EX", 3600);

                res.status(200).json({
                    success: true,
                    courses,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getCourseByUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCourseList = req.user?.courses;
            const courseId = req.params.id;

            const courseExists = userCourseList?.find(
                (course: any) => course.courseId.toString() === courseId
            );

            if (!courseExists) {
                return next(
                    new ErrorHandler("You are not eligible to access this course", 404)
                );
            }

            const course = await courseModel.findById(courseId);

            const content = course?.courseData;

            res.status(200).json({
                success: true,
                content,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { question, courseId, contentId }: IAddQuestionData = req.body;
            const course = await courseModel.findById(courseId);

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const couseContent = course?.courseData?.find((item: any) =>
                item._id.equals(contentId)
            );

            if (!couseContent) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const newQuestion: any = {
                user: req.user,
                question,
                questionReplies: [],
            };

            couseContent.questions.push(newQuestion);

            await course?.save();
            await redis.set(courseId, JSON.stringify(course), "EX", 604800);
            await redis.del("allCourses");

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { answer, courseId, contentId, questionId }: IAddAnswerData =
                req.body;

            const course = await courseModel.findById(courseId);

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const courseContent = course?.courseData?.find((item: any) =>
                item._id.equals(contentId)
            );

            if (!courseContent) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const question = courseContent?.questions?.find((item: any) =>
                item._id.equals(questionId)
            );

            if (!question) {
                return next(new ErrorHandler("Invalid question id", 400));
            }
            const newAnswer: any = {
                user: req.user,
                answer,
            };

            question.questionReplies.push(newAnswer);

            await course?.save();
            await redis.set(courseId, JSON.stringify(course), "EX", 604800);
            await redis.del("allCourses");

            if (req.user?._id === question.user?._id) {

            } else {
                const data = {
                    name: question.user.name,
                    title: courseContent.title
                }
                const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);
                try {
                    await sendMail({
                        email: question.user.email,
                        subject: "Question reply",
                        template: 'question-reply.ejs',
                        data,
                    });
                } catch (error: any) {
                    return next(new ErrorHandler(error.message, 400));
                }
            }

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

interface IAddReviewData {
  review: string;
  rating: number;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      // ✅ Always fetch fresh user from DB instead of relying on req.user cache
      const user = await userModel.findById(req.user?._id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const courseExists = user.courses.some(
        (course: any) => course.courseId.toString() === courseId.toString()
      );

      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404)
        );
      }

      const course = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };

      course.reviews.push(reviewData);

      let avg = 0;
      course.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      course.ratings = course.reviews.length ? avg / course.reviews.length : 0;

      await course.save();

      await redis.set(courseId.toString(), JSON.stringify(course), "EX", 604800);
      await redis.del("allCourses");

      const notification = {
        title: "New review added",
        message: `${req.user?.name} has given a review in ${course.name}`,
      };

      return res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      review.commentReplies.push(replyData);

      await course?.save();
      await redis.set(courseId, JSON.stringify(course), "EX", 604800);
      await redis.del("allCourses");

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllCourse =  CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllCourseService(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const course = await courseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("course not found", 404));
      }

      await course.deleteOne({ id });

      await redis.del(id.toString());
      await redis.del("allCourses");

      res.status(200).json({
        success: true,
        message: "course deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);