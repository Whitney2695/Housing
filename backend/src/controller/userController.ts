import { Request, Response, RequestHandler } from 'express';
import UsersService from '../services/userService'; // Assuming your service file is named usersService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class UsersController {
  // Explicitly specify the return type as Promise<void>
  createUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { Email: email },
      });
      
      if (existingUser) {
        // Do not return the response, just call res.status()
        res.status(400).json({ message: 'Error: Email already in use' });
        return; // End the function here, no need to return the response object
      }

      // Proceed with creating the user
      const user = await UsersService.createUser(name, email, password, role);
      res.status(201).json(user); // Send the response without return
    } catch (error: any) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  };

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const user = await UsersService.getUserById(userID);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error: any) { 
      res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UsersService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) { 
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  }

  // Reset user password (steps to generate, verify, and set new password)
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { userID } = req.params;
      const { newPassword } = req.body;
      const updatedUser = await UsersService.resetPassword(userID, newPassword);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  }

  // Update user details (excluding password)
  async updateUser(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const { name, email, role } = req.body;
      const updatedUser = await UsersService.updateUser(userID, name, email, role);
      res.status(200).json(updatedUser);
    } catch (error: any) { 
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const result = await UsersService.deleteUser(userID);
      res.status(200).json(result); // Returning the success message
    } catch (error: any) { 
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
}

export default new UsersController();
