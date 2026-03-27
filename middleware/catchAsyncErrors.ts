import { NextFunction, Request, Response } from "express"

export const CatchAsyncError = (theFun: any) => (res:Request, req:Response, next:NextFunction) => {
    Promise.resolve(theFun(res, req, next)).catch(next)
}