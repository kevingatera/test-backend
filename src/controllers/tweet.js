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

  return res.status(201).json({ tweet: tweetObject })
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
    throw new HttpException(404, "TWEET_NOTFOUND");
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


const deleteById = async (req, res) => {
  const { userId, tweetId } = req.params;

  // Prevent unauthorized update of a tweet
  if (userId != req.authUser.id) {
    throw new HttpException(401, "UNAUTHORIZED");
  }

  let tweet = await Tweet.findOne({
    _id: mongoose.Types.ObjectId(tweetId),
    createdBy: mongoose.Types.ObjectId(userId)
  }).lean();

  // Return a standard 404 if the user doesn't exist
  if (!tweet || tweet.deleted) {
    throw new HttpException(404, "TWEET_NOTFOUND");
  }

  // we are performing a soft-delete
  await Tweet.updateOne({
    _id: mongoose.Types.ObjectId(userId)
  }, {
    $set: {
      deleted: true
    }
  });


  return res.json({ tweetId: tweet._id.toString() });
};

const getById = async (req, res) => {
  const { userId, tweetId } = req.params;

  let tweet = await Tweet.findOne({
    _id: mongoose.Types.ObjectId(tweetId),
    createdBy: mongoose.Types.ObjectId(userId)
  }).lean();

  // Return a standard 404 if the user doesn't exist
  if (!tweet || tweet.deleted) {
    throw new HttpException(404, "TWEET_NOTFOUND");
  }

  const tweetObject = await tweetDTO(tweet, null);

  return res.json({ tweet: tweetObject })
};

const get = async (req, res) => {
  const { userId } = req.params;

  let tweets = await Tweet.find({
    createdBy: mongoose.Types.ObjectId(userId),
    deleted: false
  }).lean();

  const tweetObjects = [];
  for (const tweet of tweets) {
    tweetObjects.push(await tweetDTO(tweet, null));
  }

  return res.json({ tweets: tweetObjects });
};

export default {
  create,
  update,
  deleteById,
  getById,
  get
};
