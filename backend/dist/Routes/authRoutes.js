"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controller/authController"));
const asyncHandler_1 = require("../utils/asyncHandler"); // Import the utility
const router = express_1.default.Router();
router.post('/login', (0, asyncHandler_1.asyncHandler)(authController_1.default.login));
router.post('/hash-password', (0, asyncHandler_1.asyncHandler)(authController_1.default.hashPassword));
exports.default = router;
