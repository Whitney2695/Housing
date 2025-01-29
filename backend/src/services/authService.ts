import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AuthService {
  private jwtSecret: string = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use environment variables

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { Email: email }, // Match your schema's "Email" field
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password); // Match "Password"
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

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
      this.jwtSecret,
      { expiresIn: '1h' }
    );
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}

export default new AuthService();
