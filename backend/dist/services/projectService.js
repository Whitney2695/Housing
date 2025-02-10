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
// ✅ Create a new project
const createProject = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { Title, Description, MinCreditScore, InterestRate, EligibilityCriteria, ProgressPercentage, Status, StartDate, Price, Location, GIS_Locations } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            throw new Error('Unauthorized: No User ID found in token');
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
            throw new Error('A project with this title already exists');
        // ✅ Upload image to Cloudinary (if provided)
        let imageUrl = null;
        if (req.file)
            imageUrl = yield uploadImageToCloudinary(req.file);
        // ✅ Create the project
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
                Location, // 🔹 Store location separately
                ProjectImageUrl: imageUrl,
                DeveloperID: developer.DeveloperID,
            },
        });
        // ✅ Insert GIS location if provided
        if ((GIS_Locations === null || GIS_Locations === void 0 ? void 0 : GIS_Locations.Latitude) && (GIS_Locations === null || GIS_Locations === void 0 ? void 0 : GIS_Locations.Longitude)) {
            yield prisma.gISLocation.create({
                data: {
                    ProjectID: newProject.ProjectID,
                    Latitude: GIS_Locations.Latitude,
                    Longitude: GIS_Locations.Longitude,
                },
            });
        }
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
        return yield prisma.project.findMany({
            include: { GIS_Locations: true },
        });
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
        const project = yield prisma.project.findUnique({
            where: { ProjectID: projectId },
            include: { GIS_Locations: true },
        });
        if (!project)
            throw new Error('Project not found');
        return project;
    }
    catch (error) {
        console.error('Error fetching project:', error);
        throw new Error('Error fetching project');
    }
});
exports.getProjectById = getProjectById;
// ✅ Update project
const updateProject = (projectId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const existingProject = yield prisma.project.findUnique({ where: { ProjectID: projectId } });
        if (!existingProject)
            throw new Error('Project not found');
        let imageUrl = existingProject.ProjectImageUrl;
        if (file)
            imageUrl = (yield uploadImageToCloudinary(file)) || imageUrl;
        const updatedProject = yield prisma.project.update({
            where: { ProjectID: projectId },
            data: Object.assign(Object.assign({}, data), { ProjectImageUrl: imageUrl }),
        });
        if (((_a = data.GIS_Locations) === null || _a === void 0 ? void 0 : _a.Latitude) && ((_b = data.GIS_Locations) === null || _b === void 0 ? void 0 : _b.Longitude)) {
            const existingLocation = yield prisma.gISLocation.findFirst({ where: { ProjectID: projectId } });
            if (existingLocation) {
                yield prisma.gISLocation.update({
                    where: { GISID: existingLocation.GISID },
                    data: { Latitude: data.GIS_Locations.Latitude, Longitude: data.GIS_Locations.Longitude },
                });
            }
            else {
                yield prisma.gISLocation.create({
                    data: { ProjectID: projectId, Latitude: data.GIS_Locations.Latitude, Longitude: data.GIS_Locations.Longitude },
                });
            }
        }
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
        yield prisma.gISLocation.deleteMany({ where: { ProjectID: projectId } });
        yield prisma.project.delete({ where: { ProjectID: projectId } });
        return { message: 'Project deleted successfully' };
    }
    catch (error) {
        console.error('Error deleting project:', error);
        throw new Error('Error deleting project');
    }
});
exports.deleteProject = deleteProject;
