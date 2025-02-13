import { CustomRequest } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageToCloudinary = async (file: Express.Multer.File): Promise<string | null> => {
  try {
    console.log('Uploading image to Cloudinary...');
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'projects',
      resource_type: 'image',
    });
    console.log('Image uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

// ✅ Create a new project
export const createProject = async (req: CustomRequest) => {
  try {
    console.log('Creating a new project with data:', req.body);
    const { Title, Description, MinCreditScore, InterestRate, EligibilityCriteria, 
            ProgressPercentage, Status, StartDate, Price, Location, GIS_Locations } = req.body;

    if (!req.user?.id) throw new Error('Unauthorized: No User ID found in token');
    console.log('User ID:', req.user.id);

    const user = await prisma.user.findUnique({ where: { UserID: req.user.id } });
    if (!user) throw new Error('User does not exist');

    const developer = await prisma.developer.findUnique({ where: { UserID: req.user.id } });
    if (!developer) throw new Error('Developer not found for the provided User ID');

    console.log('Developer found:', developer.DeveloperID);

    // Case-insensitive check for duplicate project title
    const existingProject = await prisma.project.findFirst({
      where: {
        Title: { equals: Title, mode: 'insensitive' },
        DeveloperID: developer.DeveloperID,
      },
    });

    if (existingProject) throw new Error('A project with this title already exists');

    let imageUrl: string | null = null;
    if (req.file) {
      console.log('Uploading project image...');
      imageUrl = await uploadImageToCloudinary(req.file);
    }

    console.log('Saving new project to database...');
    const newProject = await prisma.project.create({
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
          create: GIS_Locations?.map((loc: { Latitude: number; Longitude: number }) => ({
            Latitude: loc.Latitude,
            Longitude: loc.Longitude,
          })) || [],
        },
      },
      include: { GIS_Locations: true },
    });

    console.log('Project created successfully:', newProject);
    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(error instanceof Error ? error.message : 'Error creating project');
  }
};

// ✅ Get all projects
export const getProjects = async () => {
  try {
    console.log('Fetching all projects...');
    const projects = await prisma.project.findMany({ include: { GIS_Locations: true } });
    console.log('Projects fetched successfully:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Error fetching projects');
  }
};

// ✅ Get a project by ID
export const getProjectById = async (projectId: string) => {
  try {
    console.log('Fetching project with ID:', projectId);
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: { GIS_Locations: true },
    });

    if (!project) throw new Error('Project not found');
    console.log('Project fetched successfully:', project);
    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Error fetching project');
  }
};

// ✅ Update a project
export const updateProject = async (projectId: string, data: any, file?: Express.Multer.File) => {
  try {
    console.log('Updating project with ID:', projectId);
    const existingProject = await prisma.project.findUnique({ where: { ProjectID: projectId } });
    if (!existingProject) throw new Error('Project not found');

    let imageUrl = existingProject.ProjectImageUrl;
    if (file) {
      console.log('Uploading new project image...');
      imageUrl = await uploadImageToCloudinary(file) || imageUrl;
    }

    console.log('Updating project in database...');
    const updatedProject = await prisma.project.update({
      where: { ProjectID: projectId },
      data: {
        ...data,
        ProjectImageUrl: imageUrl,
        GIS_Locations: {
          deleteMany: {}, // Clear old locations before updating
          create: data.GIS_Locations?.map((loc: { Latitude: number; Longitude: number }) => ({
            Latitude: loc.Latitude,
            Longitude: loc.Longitude,
          })) || [],
        },
      },
      include: { GIS_Locations: true },
    });

    console.log('Project updated successfully:', updatedProject);
    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Error updating project');
  }
};

// ✅ Delete project
export const deleteProject = async (projectId: string) => {
  try {
    console.log('Deleting project with ID:', projectId);
    await prisma.gISLocation.deleteMany({ where: { ProjectID: projectId } });
    await prisma.project.delete({ where: { ProjectID: projectId } });
    console.log('Project deleted successfully');
    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Error deleting project');
  }
};
