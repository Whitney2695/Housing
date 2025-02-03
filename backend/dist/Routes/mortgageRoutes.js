"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware")); // Assuming the path is correct
const mortgageController_1 = require("../controller/mortgageController");
const router = express_1.default.Router();
// Define routes
router.post('/create', authMiddleware_1.default.authenticate, mortgageController_1.createMortgageController);
router.get('/', mortgageController_1.getAllMortgagesController); // Added route for getting all mortgages
router.get('/:id', mortgageController_1.getMortgageByIdController);
router.put('/:id', authMiddleware_1.default.authenticate, mortgageController_1.updateMortgageController);
router.delete('/:id', authMiddleware_1.default.authenticate, mortgageController_1.deleteMortgageController);
router.get('/user/:userId', authMiddleware_1.default.authenticate, mortgageController_1.getMortgagesByUserController);
exports.default = router;
