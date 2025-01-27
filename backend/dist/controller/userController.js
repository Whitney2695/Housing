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
const userService_1 = __importDefault(require("../services/userService")); // Assuming your service file is named usersService.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UsersController {
    constructor() {
        // Explicitly specify the return type as Promise<void>
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, role } = req.body;
                // Check if email already exists
                const existingUser = yield prisma.user.findUnique({
                    where: { Email: email },
                });
                if (existingUser) {
                    // Do not return the response, just call res.status()
                    res.status(400).json({ message: 'Error: Email already in use' });
                    return; // End the function here, no need to return the response object
                }
                // Proceed with creating the user
                const user = yield userService_1.default.createUser(name, email, password, role);
                res.status(201).json(user); // Send the response without return
            }
            catch (error) {
                res.status(500).json({ message: 'Error creating user', error: error.message });
            }
        });
    }
    // Get user by ID
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                const user = yield userService_1.default.getUserById(userID);
                if (user) {
                    res.status(200).json(user);
                }
                else {
                    res.status(404).json({ message: 'User not found' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching user', error: error.message });
            }
        });
    }
    // Get all users
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userService_1.default.getAllUsers();
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching users', error: error.message });
            }
        });
    }
    // Reset user password (steps to generate, verify, and set new password)
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                const { newPassword } = req.body;
                const updatedUser = yield userService_1.default.resetPassword(userID, newPassword);
                res.status(200).json(updatedUser);
            }
            catch (error) {
                res.status(500).json({ message: 'Error resetting password', error: error.message });
            }
        });
    }
    // Update user details (excluding password)
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                const { name, email, role } = req.body;
                const updatedUser = yield userService_1.default.updateUser(userID, name, email, role);
                res.status(200).json(updatedUser);
            }
            catch (error) {
                res.status(500).json({ message: 'Error updating user', error: error.message });
            }
        });
    }
    // Delete user
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userID } = req.params;
                const result = yield userService_1.default.deleteUser(userID);
                res.status(200).json(result); // Returning the success message
            }
            catch (error) {
                res.status(500).json({ message: 'Error deleting user', error: error.message });
            }
        });
    }
}
exports.default = new UsersController();
