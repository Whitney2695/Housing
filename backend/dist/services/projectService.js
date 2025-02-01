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
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const imageService_1 = require("./imageService"); // Ensure correct import path
const prisma = new client_1.PrismaClient();
// Function to create a new project
const createProject = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { Title, Description, MinCreditScore, InterestRate, EligibilityCriteria, ProgressPercentage, Status, StartDate, Latitude, Longitude, } = req.body;
        const tokenDeveloperID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // DeveloperID from the token
        // Ensure the DeveloperID from the token is available and valid
        if (!tokenDeveloperID) {
            console.error('Unauthorized: No Developer ID found in token');
            throw new Error('Unauthorized: No Developer ID found in token');
        }
        // Ensure required fields are present in the request
        if (!Title || !Description || !MinCreditScore || !InterestRate || !EligibilityCriteria || !ProgressPercentage || !Status || !StartDate) {
            console.error('Missing required fields');
            throw new Error('Missing required fields');
        }
        let imageUrl = null;
        if (req.file) {
            // Upload the project image to S3 if provided
            imageUrl = yield (0, imageService_1.uploadImageToS3)(req.file);
        }
        // Create the new project in the database
        const newProject = yield prisma.project.create({
            data: {
                Title,
                Description,
                MinCreditScore,
                InterestRate,
                EligibilityCriteria: JSON.stringify(EligibilityCriteria),
                ProgressPercentage,
                Status,
                StartDate,
                ProjectImageUrl: imageUrl,
                Developer: {
                    connect: {
                        DeveloperID: tokenDeveloperID, // Automatically connect the developer using the ID from the token
                    },
                },
            },
        });
        // If latitude and longitude are provided, store them in GIS_Locations table
        if (Latitude && Longitude) {
            yield prisma.gISLocation.create({
                data: {
                    ProjectID: newProject.ProjectID,
                    Latitude,
                    Longitude,
                },
            });
        }
        // Return the created project data
        return newProject;
    }
    catch (error) {
        console.error('Error creating project:', error);
        throw new Error('Error creating project');
    }
});
exports.createProject = createProject;
// Get all projects
const getProjects = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield prisma.project.findMany({
            include: {
                GIS_Locations: true,
            },
        });
        return projects;
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Error fetching projects');
    }
});
exports.getProjects = getProjects;
// Get a specific project by ID
const getProjectById = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield prisma.project.findUnique({
            where: { ProjectID: projectId },
            include: {
                GIS_Locations: true,
            },
        });
        if (!project)
            throw new Error('Project not found');
        return project;
    }
    catch (error) {
        console.error('Error fetching project by ID:', error);
        throw new Error('Error fetching project');
    }
});
exports.getProjectById = getProjectById;
// Update an existing project
const updateProject = (projectId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedProject = yield prisma.project.update({
            where: {
                ProjectID: projectId,
            },
            data: {
                Title: data.Title,
                Description: data.Description,
                Status: data.Status,
                ProgressPercentage: data.ProgressPercentage,
                EligibilityCriteria: JSON.stringify(data.EligibilityCriteria),
                MinCreditScore: data.MinCreditScore,
                InterestRate: data.InterestRate,
                StartDate: data.StartDate,
            },
        });
        if (data.image) {
            const imageUrl = yield (0, imageService_1.uploadImageToS3)(data.image);
            yield prisma.project.update({
                where: { ProjectID: projectId },
                data: { ProjectImageUrl: imageUrl },
            });
        }
        return updatedProject;
    }
    catch (error) {
        console.error('Error updating project:', error);
        throw new Error('Error updating project');
    }
});
exports.updateProject = updateProject;
// Delete a project by ID
const deleteProject = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.project.delete({
            where: { ProjectID: projectId },
        });
        return { message: 'Project deleted successfully' };
    }
    catch (error) {
        console.error('Error deleting project:', error);
        throw new Error('Error deleting project');
    }
});
exports.deleteProject = deleteProject;
