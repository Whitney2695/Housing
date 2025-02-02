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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
class DeveloperService {
    // ✅ Create Developer
    createDeveloper(name, contactInfo, email, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            // Hash the password before saving it
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10); // 10 is the salt rounds
            // First create the user and then create the developer with the user ID
            const user = yield prisma.user.create({
                data: {
                    Name: name,
                    Email: email,
                    Password: hashedPassword, // Save the hashed password
                    Role: role, // Explicitly cast role to UserRole enum
                },
            });
            // Now create the developer with the user ID
            const developer = yield prisma.developer.create({
                data: {
                    Name: name,
                    ContactInfo: contactInfo,
                    UserID: user.UserID, // Link UserID from the user table
                },
                include: {
                    User: true, // Include user details in the response
                },
            });
            return developer; // Return the created developer object with user info
        });
    }
    // ✅ Login Developer (Authenticate)
    loginDeveloper(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user by email
            const user = yield prisma.user.findUnique({
                where: { Email: email },
            });
            // If no user is found or password does not match, return null
            if (!user) {
                return null;
            }
            // Compare entered password with stored hashed password
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.Password);
            if (!isPasswordValid) {
                return null; // Invalid credentials
            }
            return user; // Return the user if credentials are valid
        });
    }
    // ✅ Get All Developers
    getAllDevelopers() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.findMany({
                include: { Projects: true, User: true }, // Include projects and user details if needed
            });
        });
    }
    // ✅ Get Developer by ID
    getDeveloperById(developerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.findUnique({
                where: { DeveloperID: developerId },
                include: { Projects: true, User: true }, // Include projects and user details
            });
        });
    }
    // ✅ Update Developer
    updateDeveloper(developerId, name, contactInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.update({
                where: { DeveloperID: developerId },
                data: { Name: name, ContactInfo: contactInfo },
            });
        });
    }
    // ✅ Delete Developer
    deleteDeveloper(developerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.delete({
                where: { DeveloperID: developerId },
            });
        });
    }
}
exports.default = new DeveloperService();
