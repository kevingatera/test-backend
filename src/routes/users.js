import { required } from '../middleware';
import controller from '../controllers/user.js';

function setupRoutes(router) {
  router.post('/register', required.body('username', 'password'), controller.register);
}


export default setupRoutes;
