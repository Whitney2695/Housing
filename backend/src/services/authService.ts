import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

const prisma = new PrismaClient();

class AuthService {
  private jwtSecret: string = process.env.JWT_SECRET || 'your-default-jwt-secret-key'; // Use environment variable for secret key

  async login(email: string, password: string) {
    console.log(`Login request received for email: ${email}`); // Log received email

    const user = await prisma.user.findUnique({
      where: { Email: email }, // Match your schema's "Email" field
    });

    console.log('User retrieved from database:', user); // Log retrieved user

    if (!user) {
      console.log('No user found with this email');
      const error: any = new Error('User not found');
      error.status = 404;  // ✅ Explicitly setting error status for 404
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password); // Match "Password"
    console.log('Password validation result:', isPasswordValid); // Log password validation result

    if (!isPasswordValid) {
      console.log('Password does not match');
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    console.log('Generated JWT Token:', token); // Log generated token

    return {
      message: 'Logged in successfully',
      user: {
        id: user.UserID, // Match "UserID"
        name: user.Name, // Match "Name"
        email: user.Email, // Match "Email"
        role: user.Role, // Match "Role"
      },
      token,
    };
  }

  private generateToken(user: any) {
    return jwt.sign(
      {
        id: user.UserID,
        email: user.Email,
        role: user.Role,
      },
      this.jwtSecret, // Consistent secret key
      { expiresIn: '1h' } // Token expiration (1 hour)
    );
  }

  async hashPassword(password: string): Promise<string> {
    console.log('Hashing password:', password); // Log password before hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Generated hashed password:', hashedPassword); // Log hashed password
    return hashedPassword;
  }

  verifyToken(token: string) {
    try {
      console.log('Verifying token:', token);
      return jwt.verify(token, this.jwtSecret);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log('Token verification failed:', err.message); // ✅ Fix: TypeScript recognizes err as an Error
        throw new Error('Invalid or expired token');
      } else {
        console.log('Unknown error during token verification:', err);
        throw new Error('An unknown error occurred during token verification');
      }
    }
  }
}

export default new AuthService();
