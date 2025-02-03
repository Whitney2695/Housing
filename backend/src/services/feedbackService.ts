import { PrismaClient } from '@prisma/client';
import { CustomRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// ✅ Create a new feedback entry
export const createFeedback = async (req: CustomRequest) => {
  try {
    const { ProjectID, Comments, Rating } = req.body;

    if (!req.user?.id) throw new Error('Unauthorized: No User ID found in token');
    if (!ProjectID || !Comments || Rating === undefined) throw new Error('Missing required fields');

    if (Rating < 1 || Rating > 5) throw new Error('Rating must be between 1 and 5');

    // ✅ Check if the project exists
    const project = await prisma.project.findUnique({ where: { ProjectID } });
    if (!project) throw new Error('Project not found');

    // ✅ Create feedback
    const newFeedback = await prisma.feedback.create({
      data: {
        UserID: req.user.id,
        ProjectID,
        Comments,
        Rating,
      },
    });

    return newFeedback;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw new Error(error instanceof Error ? error.message : 'Error creating feedback');
  }
};

// ✅ Get all feedbacks
export const getAllFeedbacks = async () => {
  try {
    return await prisma.feedback.findMany({
      include: { User: true, Project: true },
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw new Error('Error fetching feedbacks');
  }
};

// ✅ Get all feedback for a specific project
export const getFeedbacksForProject = async (projectId: string) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { ProjectID: projectId },
      include: { User: true },
    });

    if (!feedbacks.length) throw new Error('No feedback found for this project');

    return feedbacks;
  } catch (error) {
    console.error('Error fetching project feedback:', error);
    throw new Error('Error fetching project feedback');
  }
};

// ✅ Get a specific feedback by ID
export const getFeedbackById = async (feedbackId: string) => {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { FeedbackID: feedbackId },
      include: { User: true, Project: true },
    });

    if (!feedback) throw new Error('Feedback not found');

    return feedback;
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    throw new Error('Error fetching feedback');
  }
};

// ✅ Update feedback
export const updateFeedback = async (feedbackId: string, userId: string, data: any) => {
  try {
    const existingFeedback = await prisma.feedback.findUnique({
      where: { FeedbackID: feedbackId },
    });

    if (!existingFeedback) throw new Error('Feedback not found');
    if (existingFeedback.UserID !== userId) throw new Error('Unauthorized: Cannot update this feedback');

    // ✅ Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { FeedbackID: feedbackId },
      data: {
        Comments: data.Comments,
        Rating: data.Rating,
      },
    });

    return updatedFeedback;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error(error instanceof Error ? error.message : 'Error updating feedback');
  }
};

// ✅ Delete feedback
export const deleteFeedback = async (feedbackId: string, userId: string) => {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { FeedbackID: feedbackId },
    });

    if (!feedback) throw new Error('Feedback not found');
    if (feedback.UserID !== userId) throw new Error('Unauthorized: Cannot delete this feedback');

    await prisma.feedback.delete({ where: { FeedbackID: feedbackId } });

    return { message: 'Feedback deleted successfully' };
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error(error instanceof Error ? error.message : 'Error deleting feedback');
  }
};
