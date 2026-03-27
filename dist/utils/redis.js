"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
require('dotenv').config();
const redisClient = () => {
    if (process.env.REDIDS_URL) {
        console.log('Resdis connected');
        return process.env.REDIDS_URL;
    }
    throw new Error('Resdis connection fail');
};
exports.redis = new ioredis_1.Redis(redisClient());
