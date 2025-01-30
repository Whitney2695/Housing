import { Request, Response } from 'express';
import developerService from '../services/developerService';

class DeveloperController {
  // ✅ Create Developer
  async createDeveloper(req: Request, res: Response) {
    const { name, contactInfo, email, password } = req.body;
    if (!name || !contactInfo || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const developer = await developerService.createDeveloper(name, contactInfo, email, password, "developer");
      return res.status(201).json(developer);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating developer', error });
    }
  }

  // ✅ Login Developer
  async loginDeveloper(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const user = await developerService.loginDeveloper(email, password);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Return the authenticated user (You can also add JWT here for token-based authentication)
      return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in', error });
    }
  }

  // ✅ Get All Developers
  async getAllDevelopers(req: Request, res: Response) {
    try {
      const developers = await developerService.getAllDevelopers();
      return res.status(200).json(developers);
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving developers', error });
    }
  }

  // ✅ Get Developer by ID
  async getDeveloperById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const developer = await developerService.getDeveloperById(id);
      if (!developer) {
        return res.status(404).json({ message: 'Developer not found' });
      }
      return res.status(200).json(developer);
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving developer', error });
    }
  }

  // ✅ Update Developer
  async updateDeveloper(req: Request, res: Response) {
    const { id } = req.params;
    const { name, contactInfo } = req.body;

    try {
      const updatedDeveloper = await developerService.updateDeveloper(id, name, contactInfo);
      return res.status(200).json(updatedDeveloper);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating developer', error });
    }
  }

  // ✅ Delete Developer
  async deleteDeveloper(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await developerService.deleteDeveloper(id);
      return res.status(200).json({ message: 'Developer deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting developer', error });
    }
  }
}

export default new DeveloperController();
