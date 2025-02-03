import express, { Request, Response, NextFunction } from 'express';
import authMiddleware from '../middleware/authMiddleware'; // Assuming the path is correct
import { createMortgageController, getMortgageByIdController, getAllMortgagesController, updateMortgageController, deleteMortgageController, getMortgagesByUserController } from '../controller/mortgageController';

const router = express.Router();

// Define routes
router.post('/create', authMiddleware.authenticate, createMortgageController);
router.get('/',  getAllMortgagesController); // Added route for getting all mortgages
router.get('/:id',  getMortgageByIdController);
router.put('/:id', authMiddleware.authenticate, updateMortgageController);
router.delete('/:id', authMiddleware.authenticate, deleteMortgageController);
router.get('/user/:userId', authMiddleware.authenticate, getMortgagesByUserController);



export default router;
