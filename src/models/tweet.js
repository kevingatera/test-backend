import mongoose from 'mongoose';
import lodash from 'lodash';
import moment from 'moment';
import mongoose_delete from './utils/soft-delete.cjs';

const { isEmpty } = lodash;

/**
 * Gets the Tweet Model
 * @param {mongoose.Connection} connection the mongoose connection
 * @returns {mongoose.Model} — The compiled model
 */
const getTweet = connection => {
  const { Schema } = mongoose;
  const { ObjectId } = Schema.Types;

  const schemaOptions = {
    timestamps: true,
    runSettersOnQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
  const schema = new Schema(
    {
      username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
      },
      message: {
        type: String,
      },
      createdBy: {
        type: ObjectId,
        ref: 'User',
        required: true,
      },
    },
    schemaOptions);


  function generate(data) {
    if (isEmpty(data)) {
      throw new Error('Tweet data is required');
    }

    try {
      const tweet = new this();
      ['_id', 'username', 'message', 'createdBy'].forEach(x => {
        if (data.hasOwnProperty(x)) {
          tweet[x] = data[x];
        }
      });

      return tweet;
    } catch (err) {
      throw err;
    }
  }

  schema.statics.generate = generate;

  schema.plugin(mongoose_delete, {
    deletedAt: true,
    indexFields: 'all',
    overrideMethods: 'all',
    deletedBy: true,
  });

  return connection.model('Tweet', schema, 'tweets');
};

/**
 * Convert a Tweet model to a JSON representation
 * Use tweet-dto to return the tweet externally.
 * @param {Object} tweet Tweet model to extract data from
 * @param {...string} extraProps Extra Tweet properties to include in returned JSON
 */
export const tweetToJSON = (tweet, ...extraProps) => {

  return {
    id: tweet._id.toString(),
    createdAt: moment(tweet.createdAt),
    updatedAt: moment(tweet.updatedAt),
    username: tweet.username,
    message: tweet.message,
    ...extraProps.reduce((acc, prop) => ({ ...acc, [prop]: tweet[prop] }), {}),
  };
};


export default getTweet;
