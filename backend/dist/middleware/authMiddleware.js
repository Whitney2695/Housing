"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from a .env file
dotenv_1.default.config();
// Secret key for JWT signing and verification (from environment variables)
const secretKey = process.env.JWT_SECRET || 'your-default-secret-key'; // Use your actual secret key from .env
/**
 * Middleware to authenticate the user based on JWT token
 */
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Getting the token from the header
    // console.log('Token received:', token); // Debugging line to check if token is being passed correctly
    if (!token) {
        res.status(403).json({ message: 'No token provided, access denied.' });
        return;
    }
    // Verify the token using the secret key
    jsonwebtoken_1.default.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            console.log('Token verification error:', err); // Debugging error
            res.status(401).json({ message: 'Token is invalid or expired' });
            return;
        }
        console.log('Decoded Token:', decodedToken); // Log the decoded token for debugging
        req.user = decodedToken; // Attach decoded token (user info) to the request object
        next(); // Proceed to the next middleware or route handler
    });
};
/**
 * Function to handle user login and generate a token
 * @param {Object} user - The user object to generate a token for
 * @returns {string} - The generated JWT token
 */
const login = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    const options = { expiresIn: '10m' }; // Expiration time: 10 minutes
    return jsonwebtoken_1.default.sign(payload, secretKey, options); // Generate the token
};
exports.default = { authenticate, login };
