import express from 'express';
import * as feedbackController from '../controller/feedbackController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware.authenticate, feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/project/:projectId', feedbackController.getFeedbacksForProject);
router.get('/:feedbackId', feedbackController.getFeedbackById);
router.put('/:feedbackId', authMiddleware.authenticate, feedbackController.updateFeedback);
router.delete('/:feedbackId', authMiddleware.authenticate, feedbackController.deleteFeedback);

export default router;
