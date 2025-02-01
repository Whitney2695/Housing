import { CustomRequest } from '../middleware/authMiddleware';  // Ensure correct import path
import { PrismaClient } from '@prisma/client';
import { uploadImageToS3 } from './imageService'; // Ensure correct import path

const prisma = new PrismaClient();

// Function to create a new project
export const createProject = async (req: CustomRequest) => {
  try {
    const {
      Title,
      Description,
      MinCreditScore,
      InterestRate,
      EligibilityCriteria,
      ProgressPercentage,
      Status,
      StartDate,
      Latitude,
      Longitude,
    } = req.body;

    const tokenDeveloperID = req.user?.id; // DeveloperID from the token

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

    let imageUrl: string | null = null;
    if (req.file) {
      // Upload the project image to S3 if provided
      imageUrl = await uploadImageToS3(req.file);
    }

    // Create the new project in the database
    const newProject = await prisma.project.create({
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
      await prisma.gISLocation.create({
        data: {
          ProjectID: newProject.ProjectID,
          Latitude,
          Longitude,
        },
      });
    }

    // Return the created project data
    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Error creating project');
  }
};

// Get all projects
export const getProjects = async () => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        GIS_Locations: true,
      },
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Error fetching projects');
  }
};

// Get a specific project by ID
export const getProjectById = async (projectId: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectId },
      include: {
        GIS_Locations: true,
      },
    });

    if (!project) throw new Error('Project not found');
    return project;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw new Error('Error fetching project');
  }
};

// Update an existing project
export const updateProject = async (projectId: string, data: any) => {
  try {
    const updatedProject = await prisma.project.update({
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
      const imageUrl = await uploadImageToS3(data.image);
      await prisma.project.update({
        where: { ProjectID: projectId },
        data: { ProjectImageUrl: imageUrl },
      });
    }

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Error updating project');
  }
};

// Delete a project by ID
export const deleteProject = async (projectId: string) => {
  try {
    await prisma.project.delete({
      where: { ProjectID: projectId },
    });
    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Error deleting project');
  }
};
