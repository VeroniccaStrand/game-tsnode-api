import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createUserSchema, loginUserSchema } from '../validators/userValidator.js';

const router = express.Router();

// Endpoint för att skapa en användare
router.post('/create', validateRequest(createUserSchema), UserController.createUser);
router.post('/login', UserController.loginUser);
router.get('/profile', authenticate, UserController.getUserProfile);

export default router;
