import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// Interface for custom request to include the user info
export interface CustomRequest extends Request {
  user?: any;
}

// Secret key for JWT signing and verification (from environment variables)
const secretKey = process.env.JWT_SECRET || 'your-default-secret-key'; // Use your actual secret key from .env

/**
 * Middleware to authenticate the user based on JWT token
 */
const authenticate = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1]; // Getting the token from the header
  // console.log('Token received:', token); // Debugging line to check if token is being passed correctly
  
  if (!token) {
    res.status(403).json({ message: 'No token provided, access denied.' });
    return;
  }

  // Verify the token using the secret key
  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      console.log('Token verification error:', err); // Debugging error
      res.status(401).json({ message: 'Token is invalid or expired' });
      return;
    }

    console.log('Decoded Token:', decodedToken); // Log the decoded token for debugging
    req.user = decodedToken; // Attach decoded token (user info) to the request object
    next(); // Proceed to the next middleware or route handler
  });
};

/**
 * Function to handle user login and generate a token
 * @param {Object} user - The user object to generate a token for
 * @returns {string} - The generated JWT token
 */
const login = (user: { id: string; email: string; role: string }): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  
  const options: SignOptions = { expiresIn: '10m' }; // Expiration time: 10 minutes
  return jwt.sign(payload, secretKey, options); // Generate the token
};

export default { authenticate, login };
