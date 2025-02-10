import { Router } from 'express';
import UsersController from '../controller/userController';
import multer from 'multer';

const router = Router();
const usersController = new UsersController();

// ✅ Configure multer for local file uploads before sending to Cloudinary
const upload = multer({ dest: 'uploads/' });

// ✅ Helper function to wrap async methods and handle errors
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  fn(req, res, next).catch(next);
};

// ✅ Define user routes
router.post('/register', asyncHandler(usersController.createUser));
router.get('/:userID', asyncHandler(usersController.getUserById));
router.get('/', asyncHandler(usersController.getAllUsers));
router.post('/request-reset-code', asyncHandler(usersController.requestResetCode));
router.put('/reset-password', asyncHandler(usersController.resetPassword));
router.put('/:userID/reset-password', asyncHandler(usersController.resetPassword));

// ✅ Apply multer middleware for profile image uploads when updating a user
router.put('/:userID', upload.single('profileImage'), asyncHandler(usersController.updateUser));

router.delete('/:userID', asyncHandler(usersController.deleteUser));

export default router;
