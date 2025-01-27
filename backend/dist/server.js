"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const userRoutes_1 = __importDefault(require("./Routes/userRoutes"));
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,
};
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
// Use the user routes
app.use('/api/users', userRoutes_1.default);
// Define a simple home route (optional)
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
