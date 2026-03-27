import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} layout already exists`, 400));
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        await LayoutModel.create({
          type,
          banner: {
            image: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            },
            title,
            subTitle,
          },
        });
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = await Promise.all(
            faq.map(async(item: any) => {
                return{
                    question: item.question,
                    answer: item.answer
                }
            })
        )
        await LayoutModel.create({
          type,
          faq: faqItems,
        });
      }

      if (type === "Categories") {
        const { categories } = req.body;
        const catItems = await Promise.all(
            categories.map(async(item: any) => {
                return{
                    title: item.title,
                }
            })
        )
        await LayoutModel.create({
          type,
          categories: catItems,
        });
      }

      res.status(200).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        const bannerData = await LayoutModel.findOne({ type: "Banner" });

        if (bannerData) {
          await cloudinary.v2.uploader.destroy(
            bannerData.banner.image.public_id
          );
        }

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        await LayoutModel.findOneAndUpdate(
          { type: "Banner" },
          {
            type,
            banner: {
              image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              },
              title,
              subTitle,
            },
          },
          { upsert: true, new: true }
        );
      }

      if (type === "FAQ") {
        const { faq } = req.body;

        const faqItems = faq.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));

        await LayoutModel.findOneAndUpdate(
          { type: "FAQ" },
          { type, faq: faqItems },
          { upsert: true, new: true }
        );
      }

      if (type === "Categories") {
        const { categories } = req.body;

        const categoriesItems = categories.map((item: any) => ({
          title: item.title,
        }));

        await LayoutModel.findOneAndUpdate(
          { type: "Categories" },
          { type, categories: categoriesItems },
          { upsert: true, new: true }
        );
      }

      res.status(200).json({
        success: true,
        message: "Layout updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;

      const layout = await LayoutModel.findOne({ type });

      if (!layout) {
        return next(new ErrorHandler(`${type} layout not found`, 404));
      }

      res.status(200).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);