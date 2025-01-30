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
const developerService_1 = __importDefault(require("../services/developerService"));
class DeveloperController {
    // ✅ Create Developer
    createDeveloper(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, contactInfo } = req.body;
            if (!name || !contactInfo) {
                return res.status(400).json({ message: 'Name and contactInfo are required' });
            }
            try {
                const developer = yield developerService_1.default.createDeveloper(name, contactInfo);
                return res.status(201).json(developer);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error creating developer', error });
            }
        });
    }
    // ✅ Get All Developers
    getAllDevelopers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const developers = yield developerService_1.default.getAllDevelopers();
                return res.status(200).json(developers);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error retrieving developers', error });
            }
        });
    }
    // ✅ Get Developer by ID
    getDeveloperById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const developer = yield developerService_1.default.getDeveloperById(id);
                if (!developer) {
                    return res.status(404).json({ message: 'Developer not found' });
                }
                return res.status(200).json(developer);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error retrieving developer', error });
            }
        });
    }
    // ✅ Update Developer
    updateDeveloper(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, contactInfo } = req.body;
            try {
                const updatedDeveloper = yield developerService_1.default.updateDeveloper(id, name, contactInfo);
                return res.status(200).json(updatedDeveloper);
            }
            catch (error) {
                return res.status(500).json({ message: 'Error updating developer', error });
            }
        });
    }
    // ✅ Delete Developer
    deleteDeveloper(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield developerService_1.default.deleteDeveloper(id);
                return res.status(200).json({ message: 'Developer deleted successfully' });
            }
            catch (error) {
                return res.status(500).json({ message: 'Error deleting developer', error });
            }
        });
    }
}
exports.default = new DeveloperController();
