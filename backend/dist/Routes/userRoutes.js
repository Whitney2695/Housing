"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controller/userController"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const usersController = new userController_1.default();
// ✅ Configure multer for local file uploads before sending to Cloudinary
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// ✅ Helper function to wrap async methods and handle errors
const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
// ✅ Define user routes
router.post('/register', asyncHandler(usersController.createUser));
router.get('/:userID', asyncHandler(usersController.getUserById));
router.get('/', asyncHandler(usersController.getAllUsers));
router.post('/request-reset-code', asyncHandler(usersController.requestResetCode));
router.put('/reset-password', asyncHandler(usersController.resetPassword));
router.put('/:userID/reset-password', asyncHandler(usersController.resetPassword));
// ✅ Apply multer middleware for profile image uploads when updating a user
router.put('/:userID', upload.single('profileImage'), asyncHandler(usersController.updateUser));
router.delete('/:userID', asyncHandler(usersController.deleteUser));
exports.default = router;
