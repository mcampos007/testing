// email.router.js
import { Router } from 'express';
import {
  sendEmail,
  sendEmailWithAttachments,
  sendRegistrationEmail
} from '../../controllers/email.controller.js';

const router = Router();

router.get('/', sendEmail);
router.get('/attachments', sendEmailWithAttachments);
router.get('/registro', sendRegistrationEmail);
//router.post('/sendMailPasswordReset', sendMailPasswordReset)    //Envia mail con enlace para reset
//router.get('/passwordReset/:token', passwordReset)              //Llamar a vista para ingreso de pass y confirm

export default router;
