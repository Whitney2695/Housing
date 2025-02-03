"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeedback = exports.updateFeedback = exports.getFeedbackById = exports.getFeedbacksForProject = exports.getAllFeedbacks = exports.createFeedback = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Create a new feedback entry
const createFeedback = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ProjectID, Comments, Rating } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error('Unauthorized: No User ID found in token');
        if (!ProjectID || !Comments || Rating === undefined)
            throw new Error('Missing required fields');
        if (Rating < 1 || Rating > 5)
            throw new Error('Rating must be between 1 and 5');
        // ✅ Check if the project exists
        const project = yield prisma.project.findUnique({ where: { ProjectID } });
        if (!project)
            throw new Error('Project not found');
        // ✅ Create feedback
        const newFeedback = yield prisma.feedback.create({
            data: {
                UserID: req.user.id,
                ProjectID,
                Comments,
                Rating,
            },
        });
        return newFeedback;
    }
    catch (error) {
        console.error('Error creating feedback:', error);
        throw new Error(error instanceof Error ? error.message : 'Error creating feedback');
    }
});
exports.createFeedback = createFeedback;
// ✅ Get all feedbacks
const getAllFeedbacks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma.feedback.findMany({
            include: { User: true, Project: true },
        });
    }
    catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw new Error('Error fetching feedbacks');
    }
});
exports.getAllFeedbacks = getAllFeedbacks;
// ✅ Get all feedback for a specific project
const getFeedbacksForProject = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedbacks = yield prisma.feedback.findMany({
            where: { ProjectID: projectId },
            include: { User: true },
        });
        if (!feedbacks.length)
            throw new Error('No feedback found for this project');
        return feedbacks;
    }
    catch (error) {
        console.error('Error fetching project feedback:', error);
        throw new Error('Error fetching project feedback');
    }
});
exports.getFeedbacksForProject = getFeedbacksForProject;
// ✅ Get a specific feedback by ID
const getFeedbackById = (feedbackId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield prisma.feedback.findUnique({
            where: { FeedbackID: feedbackId },
            include: { User: true, Project: true },
        });
        if (!feedback)
            throw new Error('Feedback not found');
        return feedback;
    }
    catch (error) {
        console.error('Error fetching feedback by ID:', error);
        throw new Error('Error fetching feedback');
    }
});
exports.getFeedbackById = getFeedbackById;
// ✅ Update feedback
const updateFeedback = (feedbackId, userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingFeedback = yield prisma.feedback.findUnique({
            where: { FeedbackID: feedbackId },
        });
        if (!existingFeedback)
            throw new Error('Feedback not found');
        if (existingFeedback.UserID !== userId)
            throw new Error('Unauthorized: Cannot update this feedback');
        // ✅ Update feedback
        const updatedFeedback = yield prisma.feedback.update({
            where: { FeedbackID: feedbackId },
            data: {
                Comments: data.Comments,
                Rating: data.Rating,
            },
        });
        return updatedFeedback;
    }
    catch (error) {
        console.error('Error updating feedback:', error);
        throw new Error(error instanceof Error ? error.message : 'Error updating feedback');
    }
});
exports.updateFeedback = updateFeedback;
// ✅ Delete feedback
const deleteFeedback = (feedbackId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield prisma.feedback.findUnique({
            where: { FeedbackID: feedbackId },
        });
        if (!feedback)
            throw new Error('Feedback not found');
        if (feedback.UserID !== userId)
            throw new Error('Unauthorized: Cannot delete this feedback');
        yield prisma.feedback.delete({ where: { FeedbackID: feedbackId } });
        return { message: 'Feedback deleted successfully' };
    }
    catch (error) {
        console.error('Error deleting feedback:', error);
        throw new Error(error instanceof Error ? error.message : 'Error deleting feedback');
    }
});
exports.deleteFeedback = deleteFeedback;
