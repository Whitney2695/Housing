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
exports.deleteProjectController = exports.updateProjectController = exports.getProjectByIdController = exports.getProjectsController = exports.createProjectController = void 0;
const projectService_1 = require("../services/projectService"); // Ensure this path is correct
// Create a new project
const createProjectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newProject = yield (0, projectService_1.createProject)(req); // Call the service to create a project
        res.status(201).json(newProject); // Respond with the created project
    }
    catch (error) {
        console.error('Error in createProjectController:', error);
        res.status(500).json({ error: 'Error creating project' });
    }
});
exports.createProjectController = createProjectController;
// Get all projects
const getProjectsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield (0, projectService_1.getProjects)();
        res.status(200).json(projects);
    }
    catch (error) {
        console.error('Error in getProjectsController:', error);
        res.status(500).json({ error: 'Error fetching projects' });
    }
});
exports.getProjectsController = getProjectsController;
// Get a project by ID
const getProjectByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const project = yield (0, projectService_1.getProjectById)(projectId);
        res.status(200).json(project);
    }
    catch (error) {
        console.error('Error in getProjectByIdController:', error);
        res.status(500).json({ error: 'Error fetching project' });
    }
});
exports.getProjectByIdController = getProjectByIdController;
// Update a project
const updateProjectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const updatedProject = yield (0, projectService_1.updateProject)(projectId, req.body);
        res.status(200).json(updatedProject);
    }
    catch (error) {
        console.error('Error in updateProjectController:', error);
        res.status(500).json({ error: 'Error updating project' });
    }
});
exports.updateProjectController = updateProjectController;
// Delete a project
const deleteProjectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const result = yield (0, projectService_1.deleteProject)(projectId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in deleteProjectController:', error);
        res.status(500).json({ error: 'Error deleting project' });
    }
});
exports.deleteProjectController = deleteProjectController;
