import { Tweet } from "../models/index.js";

/**
 * Persist a Tweet document
 * @param {Object} tweetInfo Info of tweet to be created
  */
export const createTweet = async (tweetInfo) => {
  let tweet = Tweet.generate(tweetInfo);

  tweet = await tweet.save();

  return tweet;
};
