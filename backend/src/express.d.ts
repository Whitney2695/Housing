// src/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string }; // Customize as per your user structure
    }
  }
}
