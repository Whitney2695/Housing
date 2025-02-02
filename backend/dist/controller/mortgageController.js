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
exports.deleteMortgageController = exports.updateMortgageController = exports.getAllMortgagesController = exports.getMortgageByIdController = exports.createMortgageController = void 0;
const mortgageService_1 = __importDefault(require("../services/mortgageService")); // Assuming this is where the service is located
const createMortgageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageDetails = req.body;
        // Create mortgage
        const newMortgage = yield mortgageService_1.default.createMortgage(mortgageDetails);
        // Respond with success message and mortgage details
        res.status(201).json({
            message: 'Mortgage created successfully',
            mortgage: newMortgage, // Return the mortgage details
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating mortgage', error });
    }
});
exports.createMortgageController = createMortgageController;
const getMortgageByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageId = req.params.id;
        // Your logic to fetch mortgage by ID
        res.status(200).json({ mortgageId });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching mortgage', error });
    }
});
exports.getMortgageByIdController = getMortgageByIdController;
// Added the getAllMortgagesController
const getAllMortgagesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgages = yield mortgageService_1.default.getAllMortgages(); // Fetch all mortgages from the service
        res.status(200).json(mortgages); // Return all mortgages
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching mortgages', error });
    }
});
exports.getAllMortgagesController = getAllMortgagesController;
const updateMortgageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageId = req.params.id;
        // Your logic for updating mortgage
        res.status(200).json({ message: 'Mortgage updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating mortgage', error });
    }
});
exports.updateMortgageController = updateMortgageController;
const deleteMortgageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mortgageId = req.params.id;
        // Your logic for deleting a mortgage
        res.status(200).json({ message: 'Mortgage deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting mortgage', error });
    }
});
exports.deleteMortgageController = deleteMortgageController;
