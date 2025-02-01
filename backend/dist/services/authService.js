"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from a .env file
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-default-jwt-secret-key'; // Use environment variable for secret key
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { Email: email }, // Match your schema's "Email" field
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.Password); // Match "Password"
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
        });
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.UserID,
            email: user.Email,
            role: user.Role,
        }, this.jwtSecret, // Consistent secret key
        { expiresIn: '1h' } // Token expiration (1 hour)
        );
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            return bcrypt_1.default.hash(password, saltRounds);
        });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (err) {
            throw new Error('Invalid or expired token');
        }
    }
}
exports.default = new AuthService();
