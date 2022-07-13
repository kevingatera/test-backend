import { required } from '../middleware';
import userController from '../controllers/user.js';
import tweetController from '../controllers/tweet.js';

function setupRoutes(router) {
  router.post('/register', required.body('username', 'password'), userController.register);

  // Tweets Per user
  router.post('/:userId/tweets/create', required.auth, required.body('username', 'message'), tweetController.create);
  router.put('/:userId/tweets/:tweetId/update', required.auth, required.params('userId', 'tweetId'), required.body('message'), tweetController.update);
  router.delete('/:userId/tweets/:tweetId/delete', required.params('userId', 'tweetId'), tweetController.deleteById);
  router.get('/:userId/tweets/:tweetId', required.params('userId', 'tweetId'), tweetController.getById);
  router.get('/:userId/tweets/', required.params('userId'), tweetController.get);
}


export default setupRoutes;
