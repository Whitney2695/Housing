import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

class DeveloperService {
  // ✅ Create Developer
  async createDeveloper(name: string, contactInfo: string, email: string, password: string, role: string) {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    
    return prisma.developer.create({
      data: {
        Name: name,
        ContactInfo: contactInfo,
        User: {
          create: {
            Name: name,
            Email: email,
            Password: hashedPassword, // Save the hashed password
            Role: role as UserRole, // Explicitly cast role to UserRole enum
          },
        },
      },
      include: {
        User: true, // Include user details in the response
      },
    });
  }

  // ✅ Login Developer (Authenticate)
  async loginDeveloper(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { Email: email },
    });

    // If no user is found or password does not match, return null
    if (!user) {
      return null;
    }

    // Compare entered password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return null; // Invalid credentials
    }

    return user; // Return the user if credentials are valid
  }

  // ✅ Get All Developers
  async getAllDevelopers() {
    return prisma.developer.findMany({
      include: { Projects: true, User: true }, // Include projects and user details if needed
    });
  }

  // ✅ Get Developer by ID
  async getDeveloperById(developerId: string) {
    return prisma.developer.findUnique({
      where: { DeveloperID: developerId },
      include: { Projects: true, User: true }, // Include projects and user details
    });
  }

  // ✅ Update Developer
  async updateDeveloper(developerId: string, name: string, contactInfo: string) {
    return prisma.developer.update({
      where: { DeveloperID: developerId },
      data: { Name: name, ContactInfo: contactInfo },
    });
  }

  // ✅ Delete Developer
  async deleteDeveloper(developerId: string) {
    return prisma.developer.delete({
      where: { DeveloperID: developerId },
    });
  }
}

export default new DeveloperService();
