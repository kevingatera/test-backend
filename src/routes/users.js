import { required } from '../middleware';
import userController from '../controllers/user.js';
import tweetController from '../controllers/tweet.js';

function setupRoutes(router) {
  router.post('/register', required.body('username', 'password'), userController.register);

  // Tweets
  router.post('/:userId/tweets/create', required.auth, required.body('username', 'message'), tweetController.create);
  router.put('/:userId/tweets/:tweetId/update', required.auth, required.params('id'), required.body('message'), tweetController.update);
  // router.delete('/:id', required.auth, required.params('id'), required.body('username'), controller.delete);
}


export default setupRoutes;
