import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DeveloperService {
  // ✅ Create Developer
  async createDeveloper(name: string, contactInfo: string) {
    return prisma.developer.create({
      data: { Name: name, ContactInfo: contactInfo },
    });
  }

  // ✅ Get All Developers
  async getAllDevelopers() {
    return prisma.developer.findMany({
      include: { Projects: true }, // Include projects if needed
    });
  }

  // ✅ Get Developer by ID
  async getDeveloperById(developerId: string) {
    return prisma.developer.findUnique({
      where: { DeveloperID: developerId },
      include: { Projects: true }, // Include projects if needed
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
