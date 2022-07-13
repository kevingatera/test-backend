import mongoose from 'mongoose';
// For pagination (Improves query performance)
import MongoPaging from 'mongo-cursor-pagination';
import getUser from './user.js';
import getTweet from './tweet.js';
export const Mongoose = new mongoose.Mongoose();

// APPLICATION DATABASE
const conn = Mongoose.createConnection();
export const mongooseConnection = conn;

MongoPaging.config.COLLATION = { locale: 'en' };

export const User = getUser(conn);
export const Tweet = getTweet(conn);