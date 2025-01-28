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
const userService_1 = __importDefault(require("../services/userService"));
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class UsersController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, role } = req.body;
                const existingUser = yield prisma.user.findUnique({
                    where: { Email: email },
                });
                if (existingUser) {
                    return res.status(400).json({ message: 'Error: Email already in use' });
                }
                const user = yield userService_1.default.createUser(name, email, password, role);
                return res.status(201).json(user);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error creating user', error: error.message });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                const user = yield userService_1.default.getUserById(userID);
                if (user) {
                    return res.status(200).json(user);
                }
                else {
                    return res.status(404).json({ message: 'User not found' });
                }
            }
            catch (error) {
                return res.status(500).json({ message: 'Error fetching user', error: error.message });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userService_1.default.getAllUsers();
                return res.status(200).json(users);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error fetching users', error: error.message });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword, resetCode } = req.body;
                if (!email || !resetCode || !newPassword) {
                    return res.status(400).json({ message: 'Missing email, reset code, or new password' });
                }
                // Verify reset code
                const codeVerified = yield userService_1.default.verifyResetCode(email, resetCode);
                if (!codeVerified) {
                    return res.status(400).json({ message: 'Invalid or expired reset code' });
                }
                // Update the user's password
                const updatedUser = yield userService_1.default.setNewPassword(email, newPassword);
                return res.status(200).json(updatedUser);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error resetting password', error: error.message });
            }
        });
    }
    requestResetCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ message: 'Email is required' });
                }
                // Generate reset code and send it to the email
                yield userService_1.default.generateResetCode(email);
                return res.status(200).json({ message: 'Reset code sent to your email' });
            }
            catch (error) {
                return res.status(500).json({ message: 'Error generating reset code', error: error.message });
            }
        });
    }
    // Reset password using code
    resetPasswordWithCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, resetCode, newPassword } = req.body;
                if (!email || !resetCode || !newPassword) {
                    return res.status(400).json({ message: 'Missing email, reset code, or new password' });
                }
                // Verify reset code
                const isValidCode = yield userService_1.default.verifyResetCode(email, resetCode);
                if (!isValidCode) {
                    return res.status(400).json({ message: 'Invalid or expired reset code' });
                }
                // Set new password
                const result = yield userService_1.default.setNewPassword(email, newPassword);
                return res.status(200).json(result); // Responding with a success message
            }
            catch (error) {
                return res.status(500).json({ message: 'Error resetting password', error: error.message });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                const { name, email, role } = req.body;
                // Validate userID as a valid UUID
                if (!(0, uuid_1.validate)(userID)) {
                    return res.status(400).json({ message: 'Invalid user ID format' });
                }
                const updatedUser = yield userService_1.default.updateUser(userID, name, email, role);
                return res.status(200).json(updatedUser);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error updating user', error: error.message });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                // Validate userID as a valid UUID
                if (!(0, uuid_1.validate)(userID)) {
                    return res.status(400).json({ message: 'Invalid user ID format' });
                }
                const result = yield userService_1.default.deleteUser(userID);
                return res.status(200).json(result); // Returning the success message
            }
            catch (error) {
                return res.status(500).json({ message: 'Error deleting user', error: error.message });
            }
        });
    }
}
exports.default = UsersController;
