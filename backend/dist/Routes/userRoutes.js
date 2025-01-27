"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controller/userController"));
const router = (0, express_1.Router)();
// Define user routes
router.post('/register', userController_1.default.createUser);
router.get('/:userID', userController_1.default.getUserById);
router.get('/', userController_1.default.getAllUsers);
router.put('/:userID/reset-password', userController_1.default.resetPassword);
router.put('/:userID', userController_1.default.updateUser);
router.delete('/:userID', userController_1.default.deleteUser);
exports.default = router;
