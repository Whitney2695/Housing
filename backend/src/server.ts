import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './Routes/userRoutes';
import authRoutes from './Routes/authRoutes';
import developerRoutes from './Routes/developerRoutes';
import projectRoutes from './Routes/projectRoutes';
import mortgageRoutes from './Routes/mortgageRoutes';
import path from 'path';
import http from 'http';

const app = express();
export const prisma = new PrismaClient();

// CORS options
const corsOptions = {
    origin: 'http://localhost:4200',  // Angular frontend URL
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));


app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/developers', developerRoutes);
app.use('/api', projectRoutes);
app.use('/api/mortgages', mortgageRoutes);


app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the API');
});

// Serve static images from a separate folder
const imageApp = express();
imageApp.use('/images', express.static(path.join(__dirname, 'images')));


// Set up server for images to listen on port 4000
const imageServer = http.createServer(imageApp);
imageServer.listen(5000, () => {
    console.log('Image server running on http://localhost:5000');
});

// Your main API server listens on port 3000
const apiPort = 3000;
app.listen(apiPort, () => {
    console.log(`API server running on http://localhost:${apiPort}`);
});
