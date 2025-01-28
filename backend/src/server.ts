import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './Routes/userRoutes';
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

// Use the user routes
app.use('/api/users', userRoutes);

// Home route for the API
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
