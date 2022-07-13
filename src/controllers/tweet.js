import mongoose from 'mongoose';
import Joi from 'joi';

import { createTweet } from '../utils/tweet.js';

import { HttpException } from '../middleware/errors.js';

import { Tweet } from '../models/index.js';
import tweetDTO from '../models/dtos/tweetDTO.js';

// controller methods
/**
 * Create handler that validates and creates a tweet
 */
const create = async (req, res) => {
  const { userId } = req.params;

  const bodySchema = Joi.object({
    username: Joi.string().required(),
    message: Joi.string().required(),
  }).required();

  const { error, value } = bodySchema.validate(req.body);

  if (error) {
    throw new HttpException(400, "BAD_REQUEST", error.message);
  }

  let { username, message } = value;

  const newTweet = {
    _id: mongoose.Types.ObjectId(),
    username,
    message,
    createdBy: mongoose.Types.ObjectId(req.authUser.id)
  };

  // Prevent unauthorized creation of a tweet
  if (userId != req.authUser.id || username != req.authUser.username) {
    throw new HttpException(401, "UNAUTHORIZED");
  }

  // Create tweet in database
  const tweet = await createTweet(newTweet);

  const tweetObject = await tweetDTO(tweet, null);

  return res.json({ data: tweetObject })
};

const update = async (req, res) => {
  const { userId, tweetId } = req.params;

  const bodySchema = Joi.object({
    message: Joi.string().required(),
  }).required();
  const { error, value } = bodySchema.validate(req.body);

  if (error) {
    throw new HttpException(400, "BAD_REQUEST", error.message);
  }

  // Prevent unauthorized update of a tweet
  if (userId != req.authUser.id) {
    throw new HttpException(401, "UNAUTHORIZED");
  }

  let { message } = value;

  let tweet = await Tweet.findOne({
    _id: mongoose.Types.ObjectId(tweetId),
    createdBy: mongoose.Types.ObjectId(userId)
  }).lean();

  // Return a standard 401 if the tweet doesn't exist 
  if (!tweet || tweet.deleted) {
    return done(null, false, { errorKey: 'TWEET_NOTFOUND' });
  }

  // Update tweet in database
  await Tweet.updateOne({
    _id: mongoose.Types.ObjectId(tweetId)
  }, {
    $set: {
      message: message
    }
  });

  return res.json({ tweetId: tweet._id.toString() });
};
export default {
  create,
  update
};
