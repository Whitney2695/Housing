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
const cloudinary_1 = require("cloudinary");
const prisma = new client_1.PrismaClient();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImageToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Uploading image to Cloudinary...');
        const result = yield cloudinary_1.v2.uploader.upload(file.path, {
            folder: 'projects',
            resource_type: 'image',
        });
        console.log('Image uploaded successfully:', result.secure_url);
        return result.secure_url;
    }
    catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
});
// ✅ Create a new project
const createProject = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Creating a new project with data:', req.body);
        const { Title, Description, MinCreditScore, InterestRate, EligibilityCriteria, ProgressPercentage, Status, StartDate, Price, Location, GIS_Locations } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error('Unauthorized: No User ID found in token');
        console.log('User ID:', req.user.id);
        const user = yield prisma.user.findUnique({ where: { UserID: req.user.id } });
        if (!user)
            throw new Error('User does not exist');
        const developer = yield prisma.developer.findUnique({ where: { UserID: req.user.id } });
        if (!developer)
            throw new Error('Developer not found for the provided User ID');
        console.log('Developer found:', developer.DeveloperID);
        // Case-insensitive check for duplicate project title
        const existingProject = yield prisma.project.findFirst({
            where: {
                Title: { equals: Title, mode: 'insensitive' },
                DeveloperID: developer.DeveloperID,
            },
        });
        if (existingProject)
            throw new Error('A project with this title already exists');
        let imageUrl = null;
        if (req.file) {
            console.log('Uploading project image...');
            imageUrl = yield uploadImageToCloudinary(req.file);
        }
        console.log('Saving new project to database...');
        const newProject = yield prisma.project.create({
            data: {
                Title,
                Description,
                MinCreditScore,
                InterestRate,
                EligibilityCriteria,
                ProgressPercentage,
                Status,
                StartDate,
                Price,
                Location,
                ProjectImageUrl: imageUrl,
                DeveloperID: developer.DeveloperID,
                GIS_Locations: {
                    create: (GIS_Locations === null || GIS_Locations === void 0 ? void 0 : GIS_Locations.map((loc) => ({
                        Latitude: loc.Latitude,
                        Longitude: loc.Longitude,
                    }))) || [],
                },
            },
            include: { GIS_Locations: true },
        });
        console.log('Project created successfully:', newProject);
        return newProject;
    }
    catch (error) {
        console.error('Error creating project:', error);
        throw new Error(error instanceof Error ? error.message : 'Error creating project');
    }
});
exports.createProject = createProject;
// ✅ Get all projects
const getProjects = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching all projects...');
        const projects = yield prisma.project.findMany({ include: { GIS_Locations: true } });
        console.log('Projects fetched successfully:', projects);
        return projects;
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Error fetching projects');
    }
});
exports.getProjects = getProjects;
// ✅ Get a project by ID
const getProjectById = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching project with ID:', projectId);
        const project = yield prisma.project.findUnique({
            where: { ProjectID: projectId },
            include: { GIS_Locations: true },
        });
        if (!project)
            throw new Error('Project not found');
        console.log('Project fetched successfully:', project);
        return project;
    }
    catch (error) {
        console.error('Error fetching project:', error);
        throw new Error('Error fetching project');
    }
});
exports.getProjectById = getProjectById;
// ✅ Update a project
const updateProject = (projectId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Updating project with ID:', projectId);
        const existingProject = yield prisma.project.findUnique({ where: { ProjectID: projectId } });
        if (!existingProject)
            throw new Error('Project not found');
        let imageUrl = existingProject.ProjectImageUrl;
        if (file) {
            console.log('Uploading new project image...');
            imageUrl = (yield uploadImageToCloudinary(file)) || imageUrl;
        }
        console.log('Updating project in database...');
        const updatedProject = yield prisma.project.update({
            where: { ProjectID: projectId },
            data: Object.assign(Object.assign({}, data), { ProjectImageUrl: imageUrl, GIS_Locations: {
                    deleteMany: {}, // Clear old locations before updating
                    create: ((_a = data.GIS_Locations) === null || _a === void 0 ? void 0 : _a.map((loc) => ({
                        Latitude: loc.Latitude,
                        Longitude: loc.Longitude,
                    }))) || [],
                } }),
            include: { GIS_Locations: true },
        });
        console.log('Project updated successfully:', updatedProject);
        return updatedProject;
    }
    catch (error) {
        console.error('Error updating project:', error);
        throw new Error('Error updating project');
    }
});
exports.updateProject = updateProject;
// ✅ Delete project
const deleteProject = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Deleting project with ID:', projectId);
        yield prisma.gISLocation.deleteMany({ where: { ProjectID: projectId } });
        yield prisma.project.delete({ where: { ProjectID: projectId } });
        console.log('Project deleted successfully');
        return { message: 'Project deleted successfully' };
    }
    catch (error) {
        console.error('Error deleting project:', error);
        throw new Error('Error deleting project');
    }
});
exports.deleteProject = deleteProject;
