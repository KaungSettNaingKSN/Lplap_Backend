import {Redis} from 'ioredis'
require('dotenv').config();

const redisClient = () => {
    if (process.env.REDIDS_URL) {
        console.log('Resdis connected')   
        return process.env.REDIDS_URL
    }
    throw new Error('Resdis connection fail')   
}

export const redis = new Redis(redisClient())