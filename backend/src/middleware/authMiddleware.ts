import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Extend the Express Request type inline
interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

class AuthMiddleware {
  private jwtSecret: string = process.env.JWT_SECRET || 'your_jwt_secret_key';

  verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      req.user = decoded; // Attach the decoded user to the request object
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  authorizeRoles(...roles: UserRole[]) {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;

      // Ensure the role is defined before checking if it's included
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    };
  }
}

export default new AuthMiddleware();
