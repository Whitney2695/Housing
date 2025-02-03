"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const feedbackService = __importStar(require("../services/feedbackService"));
// ✅ Create feedback
const createFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield feedbackService.createFeedback(req);
        res.status(201).json({
            message: 'Feedback created successfully',
            data: feedback,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.createFeedback = createFeedback;
// ✅ Get all feedbacks
const getAllFeedbacks = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedbacks = yield feedbackService.getAllFeedbacks();
        res.json({
            message: 'Feedbacks retrieved successfully',
            data: feedbacks,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.getAllFeedbacks = getAllFeedbacks;
// ✅ Get feedbacks for a specific project
const getFeedbacksForProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedbacks = yield feedbackService.getFeedbacksForProject(req.params.projectId);
        res.json({
            message: 'Feedbacks for project retrieved successfully',
            data: feedbacks,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.getFeedbacksForProject = getFeedbacksForProject;
// ✅ Get feedback by ID
const getFeedbackById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield feedbackService.getFeedbackById(req.params.feedbackId);
        res.json({
            message: 'Feedback retrieved successfully',
            data: feedback,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.getFeedbackById = getFeedbackById;
// ✅ Update feedback
const updateFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield feedbackService.updateFeedback(req.params.feedbackId, req.user.id, req.body);
        res.json({
            message: 'Feedback updated successfully',
            data: feedback,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.updateFeedback = updateFeedback;
// ✅ Delete feedback
const deleteFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield feedbackService.deleteFeedback(req.params.feedbackId, req.user.id);
        res.json({
            message: 'Feedback deleted successfully',
            data: message,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});
exports.deleteFeedback = deleteFeedback;
