import { Response } from "express";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";

export const getUserById = async (id: any, res: Response) => {
    const userJson = await redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    }
};

export const getAllUsersService = async (res: Response) => {
    const users = await userModel.find().sort({ createdAt: -1 });

    res.status(201).json({
        success: true,
        users,
    });
};

export const updateUserRoleService = async (res: Response, id: string, role: string) => {
    const user = await userModel.findByIdAndUpdate(
        id,
        { role },
        { new: true }
    );

    res.status(201).json({
        success: true,
        user,
    });
};