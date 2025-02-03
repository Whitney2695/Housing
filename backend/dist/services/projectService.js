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
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Function to upload an image to Cloudinary
const uploadImageToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(file.path, {
            folder: 'projects',
            resource_type: 'image',
        });
        return result.secure_url;
    }
    catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
});
// ✅ Create a new project with GIS location
const createProject = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Request Body:', req.body);
        const { Title, Description, MinCreditScore, InterestRate, EligibilityCriteria, ProgressPercentage, Status, StartDate, Price, GIS_Locations, } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error('Unauthorized: No User ID found in token');
        // ✅ Extract Latitude and Longitude properly
        const Latitude = GIS_Locations === null || GIS_Locations === void 0 ? void 0 : GIS_Locations.Latitude;
        const Longitude = GIS_Locations === null || GIS_Locations === void 0 ? void 0 : GIS_Locations.Longitude;
        // ✅ Validate required fields
        const missingFields = [];
        if (!Title)
            missingFields.push('Title');
        if (!Description)
            missingFields.push('Description');
        if (!MinCreditScore)
            missingFields.push('MinCreditScore');
        if (!InterestRate)
            missingFields.push('InterestRate');
        if (!EligibilityCriteria)
            missingFields.push('EligibilityCriteria');
        if (!ProgressPercentage)
            missingFields.push('ProgressPercentage');
        if (!Status)
            missingFields.push('Status');
        if (!StartDate)
            missingFields.push('StartDate');
        if (Price === undefined)
            missingFields.push('Price');
        if (Latitude === undefined || Longitude === undefined)
            missingFields.push('Latitude/Longitude');
        if (missingFields.length > 0)
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        // ✅ Find user and developer
        const user = yield prisma.user.findUnique({ where: { UserID: req.user.id } });
        if (!user)
            throw new Error('User does not exist');
        const developer = yield prisma.developer.findUnique({ where: { UserID: req.user.id } });
        if (!developer)
            throw new Error('Developer not found for the provided User ID');
        // ✅ Check if a project with the same title exists
        const existingProject = yield prisma.project.findFirst({
            where: { Title, DeveloperID: developer.DeveloperID },
        });
        if (existingProject)
            throw new Error('A project with this title already exists under the same developer');
        // ✅ Upload image to Cloudinary (if provided)
        let imageUrl = null;
        if (req.file) {
            imageUrl = yield uploadImageToCloudinary(req.file);
        }
        // ✅ Create the project
        const newProject = yield prisma.project.create({
            data: {
                Title,
                Description,
                MinCreditScore,
                InterestRate,
                EligibilityCriteria: EligibilityCriteria, // Store as JSON
                ProgressPercentage,
                Status,
                StartDate,
                Price,
                ProjectImageUrl: imageUrl,
                DeveloperID: developer.DeveloperID,
            },
        });
        // ✅ Insert GIS location if provided
        yield prisma.gISLocation.create({
            data: {
                ProjectID: newProject.ProjectID,
                Latitude,
                Longitude,
            },
        });
        return newProject;
    }
    catch (error) {
        console.error('Error creating project:', error);
        throw new Error(error instanceof Error ? error.message : 'Error creating project');
    }
});
exports.createProject = createProject;
// ✅ Get all projects with GIS locations
const getProjects = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield prisma.project.findMany({ include: { GIS_Locations: true } });
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Error fetching projects');
    }
});
exports.getProjects = getProjects;
// ✅ Get a specific project by ID
const getProjectById = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield prisma.project.findUnique({
            where: { ProjectID: projectId },
            include: { GIS_Locations: true },
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
// ✅ Update an existing project (with GIS location support)
const updateProject = (projectId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingProject = yield prisma.project.findUnique({ where: { ProjectID: projectId } });
        if (!existingProject)
            throw new Error('Project not found');
        // ✅ Upload new image (if provided)
        let imageUrl = existingProject.ProjectImageUrl;
        if (file) {
            const uploadedUrl = yield uploadImageToCloudinary(file);
            if (uploadedUrl)
                imageUrl = uploadedUrl;
        }
        // ✅ Update the project
        const updatedProject = yield prisma.project.update({
            where: { ProjectID: projectId },
            data: {
                Title: data.Title,
                Description: data.Description,
                Status: data.Status,
                ProgressPercentage: data.ProgressPercentage,
                EligibilityCriteria: data.EligibilityCriteria,
                MinCreditScore: data.MinCreditScore,
                InterestRate: data.InterestRate,
                StartDate: data.StartDate,
                Price: data.Price,
                ProjectImageUrl: imageUrl,
            },
        });
        // ✅ Update GIS location if provided
        if (data.GIS_Locations) {
            const { Latitude, Longitude } = data.GIS_Locations;
            if (Latitude !== undefined && Longitude !== undefined) {
                const existingLocation = yield prisma.gISLocation.findFirst({ where: { ProjectID: projectId } });
                if (existingLocation) {
                    yield prisma.gISLocation.update({
                        where: { GISID: existingLocation.GISID }, // ✅ Use correct field
                        data: { Latitude, Longitude },
                    });
                }
                else {
                    yield prisma.gISLocation.create({
                        data: { ProjectID: projectId, Latitude, Longitude },
                    });
                }
            }
        }
        return updatedProject;
    }
    catch (error) {
        console.error('Error updating project:', error);
        throw new Error(error instanceof Error ? error.message : 'Error updating project');
    }
});
exports.updateProject = updateProject;
// ✅ Delete a project (including GIS location)
const deleteProject = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield prisma.project.findUnique({ where: { ProjectID: projectId } });
        if (!project)
            throw new Error('Project not found');
        // ✅ Delete GIS location first (if exists)
        yield prisma.gISLocation.deleteMany({ where: { ProjectID: projectId } });
        // ✅ Delete the project
        yield prisma.project.delete({ where: { ProjectID: projectId } });
        return { message: 'Project deleted successfully' };
    }
    catch (error) {
        console.error('Error deleting project:', error);
        throw new Error(error instanceof Error ? error.message : 'Error deleting project');
    }
});
exports.deleteProject = deleteProject;
