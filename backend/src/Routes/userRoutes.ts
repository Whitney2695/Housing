import { Router } from 'express';
import UsersController from '../controller/userController';

const router = Router();

// Define user routes
router.post('/register', UsersController.createUser); 
router.get('/:userID', UsersController.getUserById);
router.get('/', UsersController.getAllUsers);
router.put('/:userID/reset-password', UsersController.resetPassword);
router.put('/:userID', UsersController.updateUser);
router.delete('/:userID', UsersController.deleteUser);

export default router;
