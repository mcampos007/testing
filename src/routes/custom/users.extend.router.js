import CustomRouter from './custom.router.js';
import { validateUser } from '../../utils/validateUser.js';
import {
  getAll,
  current,
  premiumUserChange,
  adminUser,
  login,
  register,
  //sendLinkToPasswordReset,
} from '../../controllers/users.controller.js';

export default class UsersExtendRouter extends CustomRouter {
  init() {
    /*====================================================
                    EJEMPLO de como se conecta con el CustomRouter
                    --> this.verboHTTP(path, policies, ...callbacks);                   
        =====================================================*/

    this.get('/', ['ADMIN'], getAll);

    this.get('/current', ['USER', 'PREMIUM','ADMIN'], current);

    this.post('/login', ['PUBLIC'], login);

    this.post('/register', ['PUBLIC'], validateUser, register);

    this.post('/premium/:uid', ['USER','PREMIUM'], premiumUserChange);

    this.get('/adminUser', ['ADMIN'], adminUser);

    //this.get('/passwordreset', ['PUBLIC', ])

    // this.post('/sendLinkToPasswordReset:/', ['PUBLIC'], sendLinkToPasswordReset)
  }
}
