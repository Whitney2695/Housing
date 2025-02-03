import { Request, Response } from 'express';
import * as feedbackService from '../services/feedbackService';
import { CustomRequest } from '../middleware/authMiddleware';

// ✅ Create feedback
export const createFeedback = async (req: CustomRequest, res: Response) => {
  try {
    const feedback = await feedbackService.createFeedback(req);
    res.status(201).json({
      message: 'Feedback created successfully',
      data: feedback,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

// ✅ Get all feedbacks
export const getAllFeedbacks = async (_req: Request, res: Response) => {
  try {
    const feedbacks = await feedbackService.getAllFeedbacks();
    res.json({
      message: 'Feedbacks retrieved successfully',
      data: feedbacks,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

// ✅ Get feedbacks for a specific project
export const getFeedbacksForProject = async (req: Request, res: Response) => {
  try {
    const feedbacks = await feedbackService.getFeedbacksForProject(req.params.projectId);
    res.json({
      message: 'Feedbacks for project retrieved successfully',
      data: feedbacks,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

// ✅ Get feedback by ID
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.feedbackId);
    res.json({
      message: 'Feedback retrieved successfully',
      data: feedback,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

// ✅ Update feedback
export const updateFeedback = async (req: CustomRequest, res: Response) => {
  try {
    const feedback = await feedbackService.updateFeedback(req.params.feedbackId, req.user.id, req.body);
    res.json({
      message: 'Feedback updated successfully',
      data: feedback,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

// ✅ Delete feedback
export const deleteFeedback = async (req: CustomRequest, res: Response) => {
  try {
    const message = await feedbackService.deleteFeedback(req.params.feedbackId, req.user.id);
    res.json({
      message: 'Feedback deleted successfully',
      data: message,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};
