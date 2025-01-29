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
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            try {
                const result = yield authService_1.default.login(email, password);
                return res.status(200).json(result);
            }
            catch (error) {
                return res.status(401).json({ message: error.message || 'Invalid credentials' });
            }
        });
    }
    hashPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ message: 'Password is required' });
            }
            try {
                const hashedPassword = yield authService_1.default.hashPassword(password);
                return res.status(200).json({ hashedPassword });
            }
            catch (error) {
                return res.status(500).json({ message: 'Error hashing password', error });
            }
        });
    }
}
exports.default = new AuthController();
