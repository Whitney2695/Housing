import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  }

  async hashPassword(req: Request, res: Response): Promise<Response> {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    try {
      const hashedPassword = await authService.hashPassword(password);
      return res.status(200).json({ hashedPassword });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error hashing password', error });
    }
  }
}

export default new AuthController();
