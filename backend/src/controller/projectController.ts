import { Request, Response } from 'express';
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../services/projectService';  // Ensure this path is correct

// Create a new project
export const createProjectController = async (req: Request, res: Response) => {
  try {
    const newProject = await createProject(req); // Call the service to create a project
    res.status(201).json(newProject); // Respond with the created project
  } catch (error) {
    console.error('Error in createProjectController:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
};

// Get all projects
export const getProjectsController = async (req: Request, res: Response) => {
  try {
    const projects = await getProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error in getProjectsController:', error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

// Get a project by ID
export const getProjectByIdController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await getProjectById(projectId);
    res.status(200).json(project);
  } catch (error) {
    console.error('Error in getProjectByIdController:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
};

// Update a project
export const updateProjectController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const updatedProject = await updateProject(projectId, req.body);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error in updateProjectController:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
};

// Delete a project
export const deleteProjectController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await deleteProject(projectId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteProjectController:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
};
