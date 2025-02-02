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
    return null; // Return null if upload fails  
  }  
};  

// Create a new project  
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
      Latitude,
      Longitude,
    } = req.body;

    // Check if User ID and Developer ID are present in the token
    console.log('User ID from token:', req.user?.id);
    if (!req.user?.id) throw new Error('Unauthorized: No User ID found in token');

    // Check if required fields are present
    if (!Title || !Description || !MinCreditScore || !InterestRate || !EligibilityCriteria || !ProgressPercentage || !Status || !StartDate) {
      const missingFields = [];
      if (!Title) missingFields.push('Title');
      if (!Description) missingFields.push('Description');
      if (!MinCreditScore) missingFields.push('MinCreditScore');
      if (!InterestRate) missingFields.push('InterestRate');
      if (!EligibilityCriteria) missingFields.push('EligibilityCriteria');
      if (!ProgressPercentage) missingFields.push('ProgressPercentage');
      if (!Status) missingFields.push('Status');
      if (!StartDate) missingFields.push('StartDate');
      console.error('Missing required fields:', missingFields.join(', '));
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    let imageUrl: string | null = null;
    if (req.file) {
      console.log('Uploading image to Cloudinary...');
      imageUrl = await uploadImageToCloudinary(req.file);
      if (imageUrl) {
        console.log('Image URL:', imageUrl);
      } else {
        console.log('Image upload failed');
      }
    }

    // Check if the User exists in the database
    const user = await prisma.user.findUnique({
      where: { UserID: req.user.id }, // Look for the user by UserID
    });

    if (!user) {
      throw new Error('User does not exist');
    }

    // Check if the Developer associated with the User exists
    const developer = await prisma.developer.findUnique({
      where: { UserID: req.user.id }, // Find Developer by the UserID associated with the token's UserID
    });

    if (!developer) {
      throw new Error('Developer not found for the provided User ID');
    }

    console.log('Creating new project in the database...');
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
        DeveloperID: developer.DeveloperID, // Use the DeveloperID found from the Developer model
      },
    });

    if (Latitude && Longitude) {
      await prisma.gISLocation.create({
        data: {
          ProjectID: newProject.ProjectID,
          Latitude,
          Longitude,
        },
      });
    }

    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Error creating project');
  }
};


// Get all projects  
export const getProjects = async () => {  
  try {  
    return await prisma.project.findMany({ include: { GIS_Locations: true } });  
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
      include: { GIS_Locations: true },  
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
      where: { ProjectID: projectId },  
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
      const imageUrl = await uploadImageToCloudinary(data.image);  
      if (imageUrl) {
        await prisma.project.update({  
          where: { ProjectID: projectId },  
          data: { ProjectImageUrl: imageUrl },  
        });  
      } else {
        console.log('Image upload failed during update');
      }
    }  

    return updatedProject;  
  } catch (error) {  
    console.error('Error updating project:', error);  
    throw new Error('Error updating project');  
  }  
};  

// Delete a project  
export const deleteProject = async (projectId: string) => {  
  try {  
    await prisma.project.delete({ where: { ProjectID: projectId } });  
    return { message: 'Project deleted successfully' };  
  } catch (error) {  
    console.error('Error deleting project:', error);  
    throw new Error('Error deleting project');  
  }  
};  
