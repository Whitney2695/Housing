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

// ✅ Create a new project
export const createProject = async (req: CustomRequest) => {
  try {
    const { Title, Description, MinCreditScore, InterestRate, EligibilityCriteria, 
            ProgressPercentage, Status, StartDate, Price, Location, GIS_Locations } = req.body;

    if (!req.user?.id) throw new Error('Unauthorized: No User ID found in token');

    const user = await prisma.user.findUnique({ where: { UserID: req.user.id } });
    if (!user) throw new Error('User does not exist');

    const developer = await prisma.developer.findUnique({ where: { UserID: req.user.id } });
    if (!developer) throw new Error('Developer not found for the provided User ID');

    // ✅ Check if a project with the same title exists
    const existingProject = await prisma.project.findFirst({
      where: { Title, DeveloperID: developer.DeveloperID },
    });
    if (existingProject) throw new Error('A project with this title already exists');

    // ✅ Upload image to Cloudinary (if provided)
    let imageUrl: string | null = null;
    if (req.file) imageUrl = await uploadImageToCloudinary(req.file);

    // ✅ Create the project
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
        Location, // 🔹 Store location separately
        ProjectImageUrl: imageUrl,
        DeveloperID: developer.DeveloperID,
      },
    });

    // ✅ Insert GIS location if provided
    if (GIS_Locations?.Latitude && GIS_Locations?.Longitude) {
      await prisma.gISLocation.create({
        data: {
          ProjectID: newProject.ProjectID,
          Latitude: GIS_Locations.Latitude,
          Longitude: GIS_Locations.Longitude,
        },
      });
    }

    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(error instanceof Error ? error.message : 'Error creating project');
  }
};

// ✅ Get all projects
export const getProjects = async () => {
  try {
    return await prisma.project.findMany({
      include: { GIS_Locations: true },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Error fetching projects');
  }
};

// ✅ Get a project by ID
export const getProjectById = async (projectId: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: { GIS_Locations: true },
    });

    if (!project) throw new Error('Project not found');
    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Error fetching project');
  }
};

// ✅ Update project
export const updateProject = async (projectId: string, data: any, file?: Express.Multer.File) => {
  try {
    const existingProject = await prisma.project.findUnique({ where: { ProjectID: projectId } });
    if (!existingProject) throw new Error('Project not found');

    let imageUrl = existingProject.ProjectImageUrl;
    if (file) imageUrl = await uploadImageToCloudinary(file) || imageUrl;

    const updatedProject = await prisma.project.update({
      where: { ProjectID: projectId },
      data: {
        ...data,
        ProjectImageUrl: imageUrl,
      },
    });

    if (data.GIS_Locations?.Latitude && data.GIS_Locations?.Longitude) {
      const existingLocation = await prisma.gISLocation.findFirst({ where: { ProjectID: projectId } });

      if (existingLocation) {
        await prisma.gISLocation.update({
          where: { GISID: existingLocation.GISID },
          data: { Latitude: data.GIS_Locations.Latitude, Longitude: data.GIS_Locations.Longitude },
        });
      } else {
        await prisma.gISLocation.create({
          data: { ProjectID: projectId, Latitude: data.GIS_Locations.Latitude, Longitude: data.GIS_Locations.Longitude },
        });
      }
    }

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Error updating project');
  }
};

// ✅ Delete project
export const deleteProject = async (projectId: string) => {
  try {
    await prisma.gISLocation.deleteMany({ where: { ProjectID: projectId } });
    await prisma.project.delete({ where: { ProjectID: projectId } });
    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Error deleting project');
  }
};
