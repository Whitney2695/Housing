import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './Routes/userRoutes'; 

const app = express();
export const prisma = new PrismaClient();

const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

// Use the user routes
app.use('/api/users', userRoutes);

// Define a simple home route (optional)
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the API');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
