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
const authService_1 = __importDefault(require("../services/authService"));
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            console.log('Login attempt with:', { email, password }); // Log request body
            if (!email || !password) {
                console.log('Login failed: Missing email or password');
                return res.status(400).json({ message: 'Email and password are required' });
            }
            try {
                const result = yield authService_1.default.login(email, password);
                console.log('Login successful:', result.user); // Log successful login response
                return res.status(200).json(result);
            }
            catch (error) {
                console.log('Login error:', error.message); // Log login error
                if (error.status === 404) {
                    return res.status(404).json({ message: 'User not found. Please register.' });
                }
                return res.status(401).json({ message: error.message || 'Invalid credentials' });
            }
        });
    }
    hashPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password } = req.body;
            console.log('Password hashing request:', { password }); // Log received password
            if (!password) {
                console.log('Hashing failed: No password provided');
                return res.status(400).json({ message: 'Password is required' });
            }
            try {
                const hashedPassword = yield authService_1.default.hashPassword(password);
                console.log('Successfully hashed password');
                return res.status(200).json({ hashedPassword });
            }
            catch (error) {
                console.log('Error hashing password:', error);
                return res.status(500).json({ message: 'Error hashing password', error });
            }
        });
    }
}
exports.default = new AuthController();
