"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthMiddleware {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    }
    verifyToken(req, res, next) {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            req.user = decoded; // Attach the decoded user to the request object
            next();
        }
        catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    }
    authorizeRoles(...roles) {
        return (req, res, next) => {
            var _a;
            const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            // Ensure the role is defined before checking if it's included
            if (!userRole || !roles.includes(userRole)) {
                return res.status(403).json({ message: 'Access denied' });
            }
            next();
        };
    }
}
exports.default = new AuthMiddleware();
