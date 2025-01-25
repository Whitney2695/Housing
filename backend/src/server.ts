import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';


const app = express();
export const prisma = new PrismaClient();

const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});