"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsyncError = void 0;
const CatchAsyncError = (theFun) => (res, req, next) => {
    Promise.resolve(theFun(res, req, next)).catch(next);
};
exports.CatchAsyncError = CatchAsyncError;
