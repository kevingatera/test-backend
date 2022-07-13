import { tweetToJSON } from "../tweet";

/**
 * Convert a Tweet model to a safe JSON representation for the UI
 * @param {Object} tweet Tweet model to extract data from
 * @param {...string} extraProps Extra Tweet properties to include in returned JSON
 */
const tweetDTO = async (tweet, ...extraProps) => {
  try {
    return {
      ...tweetToJSON(tweet, extraProps)
    };
  } catch (err) {
    // TODO: Place logging here
    return null;
  }
};

export default tweetDTO;
