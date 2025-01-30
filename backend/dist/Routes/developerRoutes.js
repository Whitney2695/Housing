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
const express_1 = __importDefault(require("express"));
const developerController_1 = __importDefault(require("../controller/developerController"));
const router = express_1.default.Router(); // This is the correct initialization
// Define routes correctly with proper async handling
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield developerController_1.default.createDeveloper(req, res);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield developerController_1.default.getAllDevelopers(req, res);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield developerController_1.default.getDeveloperById(req, res);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield developerController_1.default.updateDeveloper(req, res);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield developerController_1.default.deleteDeveloper(req, res);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}));
exports.default = router;
