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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DeveloperService {
    // ✅ Create Developer
    createDeveloper(name, contactInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.create({
                data: { Name: name, ContactInfo: contactInfo },
            });
        });
    }
    // ✅ Get All Developers
    getAllDevelopers() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.findMany({
                include: { Projects: true }, // Include projects if needed
            });
        });
    }
    // ✅ Get Developer by ID
    getDeveloperById(developerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.developer.findUnique({
                where: { DeveloperID: developerId },
                include: { Projects: true }, // Include projects if needed
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
