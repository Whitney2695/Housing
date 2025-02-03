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
const authRoutes_1 = __importDefault(require("./Routes/authRoutes"));
const developerRoutes_1 = __importDefault(require("./Routes/developerRoutes"));
const projectRoutes_1 = __importDefault(require("./Routes/projectRoutes"));
const mortgageRoutes_1 = __importDefault(require("./Routes/mortgageRoutes"));
const feedbackRoutes_1 = __importDefault(require("./Routes/feedbackRoutes"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// CORS options
const corsOptions = {
    origin: 'http://localhost:4200', // Angular frontend URL
    credentials: true,
};
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/developers', developerRoutes_1.default);
app.use('/api', projectRoutes_1.default);
app.use('/api/mortgages', mortgageRoutes_1.default);
app.use('/api/feedback', feedbackRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});
// Serve static images from a separate folder
const imageApp = (0, express_1.default)();
imageApp.use('/images', express_1.default.static(path_1.default.join(__dirname, 'images')));
// Set up server for images to listen on port 4000
const imageServer = http_1.default.createServer(imageApp);
imageServer.listen(5000, () => {
    console.log('Image server running on http://localhost:5000');
});
// Your main API server listens on port 3000
const apiPort = 3000;
app.listen(apiPort, () => {
    console.log(`API server running on http://localhost:${apiPort}`);
});
