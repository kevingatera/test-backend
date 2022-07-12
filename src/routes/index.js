import express from 'express';
import expressHealthcheck from 'express-healthcheck';

import { mongooseConnection } from '../models/index.js';

import setupAuthRoutes from './auth.js';
import setupUserRoutes from './users.js';

function setupRoutes(app) {
  const test = (done) => {
    const hasError = mongooseConnection.readyState !== 1;
    done(hasError && { state: 'unhealthy' });
  };

  // Extra method I added to check the health of the app by checking if it's connected to the database
  app.use('/healthcheck', expressHealthcheck({ test }));

  const authRouter = express.Router();
  setupAuthRoutes(authRouter);
  app.use('/api/auth', authRouter);

  const userRouter = express.Router();
  setupUserRoutes(userRouter);
  app.use('/api/users', userRouter);

}

export default setupRoutes;
