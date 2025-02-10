import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    console.log('Login attempt with:', { email, password }); // Log request body

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const result = await authService.login(email, password);
      console.log('Login successful:', result.user); // Log successful login response
      return res.status(200).json(result);
    } catch (error: any) {
      console.log('Login error:', error.message); // Log login error

      if (error.status === 404) {
        return res.status(404).json({ message: 'User not found. Please register.' });
      }

      return res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  }

  async hashPassword(req: Request, res: Response): Promise<Response> {
    const { password } = req.body;
    console.log('Password hashing request:', { password }); // Log received password

    if (!password) {
      console.log('Hashing failed: No password provided');
      return res.status(400).json({ message: 'Password is required' });
    }

    try {
      const hashedPassword = await authService.hashPassword(password);
      console.log('Successfully hashed password');
      return res.status(200).json({ hashedPassword });
    } catch (error: any) {
      console.log('Error hashing password:', error);
      return res.status(500).json({ message: 'Error hashing password', error });
    }
  }
}

export default new AuthController();
