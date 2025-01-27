import { Router } from 'express';
import UsersController from '../controller/userController';

const router = Router();
const usersController = new UsersController();

// Helper function to wrap async methods and handle errors
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  fn(req, res, next).catch(next);
};

// Define user routes
router.post('/register', asyncHandler(usersController.createUser));
router.get('/:userID', asyncHandler(usersController.getUserById));
router.get('/', asyncHandler(usersController.getAllUsers));
router.post('/request-reset-code', asyncHandler(usersController.requestResetCode));
router.put('/reset-password', asyncHandler(usersController.resetPassword));
router.put('/:userID/reset-password', asyncHandler(usersController.resetPassword));
router.put('/:userID', asyncHandler(usersController.updateUser));
router.delete('/:userID', asyncHandler(usersController.deleteUser));

export default router;
