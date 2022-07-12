/**
 * Middleware used to override the default expiry date of the cookie session
 */
 export const sessionExpiry = (req, res, next) => {
  const { user } = req;

  // Pass through if no user is attached to the request
  if (!user) {
    return next();
  }

  // Fetch the expiry value and reset the cookie's maxAge if it exists
  const { sessionExpiry } = user.appConfig || {};

  if (sessionExpiry && req.session.cookie) {
    req.session.cookie.maxAge = sessionExpiry;
  }

  next();
};

export default {
  sessionExpiry,
};
