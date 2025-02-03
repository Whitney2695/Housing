import { CustomRequest } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image to Cloudinary
const uploadImageToCloudinary = async (file: Express.Multer.File): Promise<string | null> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'projects',
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

// ✅ Create a new project with GIS location
export const createProject = async (req: CustomRequest) => {
  try {
    console.log('Request Body:', req.body);

    const {
      Title,
      Description,
      MinCreditScore,
      InterestRate,
      EligibilityCriteria,
      ProgressPercentage,
      Status,
      StartDate,
      Price,
      GIS_Locations,
    } = req.body;

    if (!req.user?.id) throw new Error('Unauthorized: No User ID found in token');

    // ✅ Extract Latitude and Longitude properly
    const Latitude = GIS_Locations?.Latitude;
    const Longitude = GIS_Locations?.Longitude;

    // ✅ Validate required fields
    const missingFields = [];
    if (!Title) missingFields.push('Title');
    if (!Description) missingFields.push('Description');
    if (!MinCreditScore) missingFields.push('MinCreditScore');
    if (!InterestRate) missingFields.push('InterestRate');
    if (!EligibilityCriteria) missingFields.push('EligibilityCriteria');
    if (!ProgressPercentage) missingFields.push('ProgressPercentage');
    if (!Status) missingFields.push('Status');
    if (!StartDate) missingFields.push('StartDate');
    if (Price === undefined) missingFields.push('Price');
    if (Latitude === undefined || Longitude === undefined) missingFields.push('Latitude/Longitude');
    if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

    // ✅ Find user and developer
    const user = await prisma.user.findUnique({ where: { UserID: req.user.id } });
    if (!user) throw new Error('User does not exist');

    const developer = await prisma.developer.findUnique({ where: { UserID: req.user.id } });
    if (!developer) throw new Error('Developer not found for the provided User ID');

    // ✅ Check if a project with the same title exists
    const existingProject = await prisma.project.findFirst({
      where: { Title, DeveloperID: developer.DeveloperID },
    });
    if (existingProject) throw new Error('A project with this title already exists under the same developer');

    // ✅ Upload image to Cloudinary (if provided)
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file);
    }

    // ✅ Create the project
    const newProject = await prisma.project.create({
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
    await prisma.gISLocation.create({
      data: {
        ProjectID: newProject.ProjectID,
        Latitude,
        Longitude,
      },
    });

    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(error instanceof Error ? error.message : 'Error creating project');
  }
};

// ✅ Get all projects with GIS locations
export const getProjects = async () => {
  try {
    return await prisma.project.findMany({ include: { GIS_Locations: true } });
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Error fetching projects');
  }
};

// ✅ Get a specific project by ID
export const getProjectById = async (projectId: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: { GIS_Locations: true },
    });

    if (!project) throw new Error('Project not found');
    return project;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw new Error('Error fetching project');
  }
};

// ✅ Update an existing project (with GIS location support)
export const updateProject = async (projectId: string, data: any, file?: Express.Multer.File) => {
  try {
    const existingProject = await prisma.project.findUnique({ where: { ProjectID: projectId } });

    if (!existingProject) throw new Error('Project not found');

    // ✅ Upload new image (if provided)
    let imageUrl = existingProject.ProjectImageUrl;
    if (file) {
      const uploadedUrl = await uploadImageToCloudinary(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // ✅ Update the project
    const updatedProject = await prisma.project.update({
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
        const existingLocation = await prisma.gISLocation.findFirst({ where: { ProjectID: projectId } });

        if (existingLocation) {
          await prisma.gISLocation.update({
            where: { GISID: existingLocation.GISID }, // ✅ Use correct field
            data: { Latitude, Longitude },
          });
        } else {
          await prisma.gISLocation.create({
            data: { ProjectID: projectId, Latitude, Longitude },
          });
        }
      }
    }

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error(error instanceof Error ? error.message : 'Error updating project');
  }
};

// ✅ Delete a project (including GIS location)
export const deleteProject = async (projectId: string) => {
  try {
    const project = await prisma.project.findUnique({ where: { ProjectID: projectId } });

    if (!project) throw new Error('Project not found');

    // ✅ Delete GIS location first (if exists)
    await prisma.gISLocation.deleteMany({ where: { ProjectID: projectId } });

    // ✅ Delete the project
    await prisma.project.delete({ where: { ProjectID: projectId } });

    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error(error instanceof Error ? error.message : 'Error deleting project');
  }
};
