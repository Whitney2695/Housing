import { Request, Response } from 'express';
import UsersService from '../services/userService';
import { PrismaClient } from '@prisma/client';
import { validate as validateUUID } from 'uuid';
import multer from 'multer';

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

class UsersController {
  async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await prisma.user.findUnique({
        where: { Email: email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Error: Email already in use' });
      }

      const user = await UsersService.createUser(name, email, password, role);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { userID } = req.params;
      const user = await UsersService.getUserById(userID);
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UsersService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword, resetCode } = req.body;

      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ message: 'Missing email, reset code, or new password' });
      }

      // Verify reset code
      const codeVerified = await UsersService.verifyResetCode(email, resetCode);
      if (!codeVerified) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }

      // Update the user's password
      const updatedUser = await UsersService.setNewPassword(email, newPassword);
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  }

  async requestResetCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Generate reset code and send it to the email
      await UsersService.generateResetCode(email);
      return res.status(200).json({ message: 'Reset code sent to your email' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error generating reset code', error: error.message });
    }
  }
// Reset password using code
async resetPasswordWithCode(req: Request, res: Response) {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Missing email, reset code, or new password' });
    }

    // Verify reset code
    const isValidCode = await UsersService.verifyResetCode(email, resetCode);
    if (!isValidCode) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Set new password
    const result = await UsersService.setNewPassword(email, newPassword);
    return res.status(200).json(result); // Responding with a success message
  } catch (error: any) {
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
}



async updateUser(req: Request, res: Response) {
    try {
        const { userID } = req.params;
        const { name, email, role } = req.body;
        const profileImage = req.file?.path; // Get the uploaded file path

        // Validate userID as a valid UUID
        if (!validateUUID(userID)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const updatedUser = await UsersService.updateUser(userID, name, email, role, profileImage);
        return res.status(200).json(updatedUser);
    } catch (error: any) {
        return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}



  async deleteUser(req: Request, res: Response) {
    try {
      const { userID } = req.params;

      // Validate userID as a valid UUID
      if (!validateUUID(userID)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const result = await UsersService.deleteUser(userID);
      return res.status(200).json(result); // Returning the success message
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
}

export default UsersController;
