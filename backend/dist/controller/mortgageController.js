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
exports.getMortgagesByUserController = exports.deleteMortgageController = exports.updateMortgageController = exports.getAllMortgagesController = exports.getMortgageByIdController = exports.createMortgageController = void 0;
const mortgageService_1 = __importDefault(require("../services/mortgageService"));
// Create Mortgage Controller
const createMortgageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageDetails = req.body;
        const newMortgage = yield mortgageService_1.default.createMortgage(mortgageDetails);
        res.status(201).json({
            message: 'Mortgage created successfully',
            mortgage: newMortgage,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating mortgage', error });
    }
});
exports.createMortgageController = createMortgageController;
// Get Mortgage by ID Controller (No Authorization)
const getMortgageByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageId = req.params.id;
        const mortgage = yield mortgageService_1.default.getMortgageById(mortgageId);
        if (!mortgage) {
            res.status(404).json({ message: 'Mortgage not found' });
            return;
        }
        res.status(200).json(mortgage);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching mortgage', error });
    }
});
exports.getMortgageByIdController = getMortgageByIdController;
// Get All Mortgages Controller (No Authorization)
const getAllMortgagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgages = yield mortgageService_1.default.getAllMortgages();
        res.status(200).json(mortgages);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching mortgages', error });
    }
});
exports.getAllMortgagesController = getAllMortgagesController;
// Update Mortgage Controller (Authorization Required)
const updateMortgageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageId = req.params.id;
        const mortgageDetails = req.body;
        const updatedMortgage = yield mortgageService_1.default.updateMortgage(mortgageId, mortgageDetails);
        res.status(200).json(updatedMortgage); // Includes success message and updated mortgage details
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating mortgage', error });
    }
});
exports.updateMortgageController = updateMortgageController;
// Delete Mortgage Controller (Authorization Required)
const deleteMortgageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageId = req.params.id;
        yield mortgageService_1.default.deleteMortgage(mortgageId);
        res.status(200).json({ message: 'Mortgage deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting mortgage', error });
    }
});
exports.deleteMortgageController = deleteMortgageController;
// Get Mortgages for a Specific User Controller
const getMortgagesByUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const mortgages = yield mortgageService_1.default.getMortgagesByUser(userId);
        res.status(200).json(mortgages);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user mortgages', error });
    }
});
exports.getMortgagesByUserController = getMortgagesByUserController;
