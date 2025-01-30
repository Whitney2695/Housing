import express from 'express';
import authController from '../controller/authController';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/hash-password', async (req, res, next) => {
  try {
    await authController.hashPassword(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
