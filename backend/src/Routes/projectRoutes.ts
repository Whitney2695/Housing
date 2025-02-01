import { Router } from 'express';
import * as projectControllers from '../controller/projectController';
import authMiddleware from '../middleware/authMiddleware';  // Ensure this is the correct path

const router = Router();

// Create a new project
router.post('/projects', authMiddleware.authenticate, projectControllers.createProjectController);

// Get all projects
router.get('/projects', authMiddleware.authenticate, projectControllers.getProjectsController);

// Get a project by ID
router.get('/projects/:projectId', authMiddleware.authenticate, projectControllers.getProjectByIdController);

// Update a project
router.put('/projects/:projectId', authMiddleware.authenticate, projectControllers.updateProjectController);

// Delete a project
router.delete('/projects/:projectId', authMiddleware.authenticate, projectControllers.deleteProjectController);

export default router;
