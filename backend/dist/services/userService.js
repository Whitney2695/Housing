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
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
class UsersService {
    constructor() {
        this.brevoApiKey = process.env.BREVO_API_KEY; // Ensure this is set in your .env file
        this.brevoSenderEmail = process.env.BREVO_SENDER_EMAIL; // Sender email for Brevo
    }
    createUser(name_1, email_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (name, email, password, role = client_1.UserRole.user) {
            console.log('Starting user creation process'); // Log the start of the process
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            console.log(`Hashed password for ${email}`);
            const user = yield prisma.user.create({
                data: {
                    Name: name,
                    Email: email,
                    Password: hashedPassword,
                    Role: role,
                },
            });
            console.log(`User created successfully: ${user.Email}`); // Log successful creation
            // Send email after successful registration
            console.log(`Sending registration email to ${email}`);
            yield this.sendEmail(email, 'Registration Successful', `Hello ${name},\n\nYou have successfully registered!`);
            console.log('Registration email sent'); // Log email sent status
            return user;
        });
    }
    sendEmail(to, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
                    sender: { email: this.brevoSenderEmail },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: `<p>${content.replace(/\n/g, '<br>')}</p>`,
                }, {
                    headers: {
                        'api-key': this.brevoApiKey,
                        'Content-Type': 'application/json',
                    },
                });
                console.log(`Email sent successfully: ${response.status}`);
            }
            catch (error) {
                // General error handling
                const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message || 'Unknown error occurred';
                console.error('Failed to send email:', errorMessage);
                throw new Error(`Email sending failed: ${errorMessage}`);
            }
        });
    }
    // Get user by ID
    getUserById(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Fetching user with ID: ${userID}`);
            const user = yield prisma.user.findUnique({
                where: {
                    UserID: userID,
                },
            });
            console.log(user ? `User found: ${user.Email}` : 'User not found');
            return user;
        });
    }
    // Get all users
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching all users');
            const users = yield prisma.user.findMany();
            console.log(`Found ${users.length} users`);
            return users;
        });
    }
    // Reset user password
    resetPassword(userID, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Resetting password for user ID: ${userID}`);
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            const updatedUser = yield prisma.user.update({
                where: {
                    UserID: userID,
                },
                data: {
                    Password: hashedPassword,
                },
            });
            console.log(`Password updated for user ID: ${userID}`);
            return updatedUser;
        });
    }
    // Update user details (excluding password)
    updateUser(userID, name, email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Updating user ID: ${userID}`);
            const updatedUser = yield prisma.user.update({
                where: {
                    UserID: userID,
                },
                data: {
                    Name: name,
                    Email: email,
                    Role: role,
                },
            });
            console.log(`User updated: ${updatedUser.Email}`);
            return updatedUser;
        });
    }
    // Delete user
    deleteUser(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Deleting user ID: ${userID}`);
            yield prisma.user.delete({
                where: {
                    UserID: userID,
                },
            });
            console.log(`User ID: ${userID} deleted successfully`);
            return { message: 'User deleted successfully' };
        });
    }
    // Step 1: Generate reset code and send email
    generateResetCode(email) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Generating reset code for email: ${email}`);
            const user = yield prisma.user.findUnique({ where: { Email: email } });
            if (!user) {
                throw new Error('User not found');
            }
            const resetCode = crypto_1.default.randomBytes(3).toString('hex'); // 6-character code
            const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
            console.log(`Generated reset code: ${resetCode}`);
            yield prisma.user.update({
                where: { Email: email },
                data: {
                    ResetCode: resetCode,
                    ResetCodeExpiry: expiryTime,
                },
            });
            // Send email with the reset code
            console.log(`Sending reset code to ${email}`);
            yield this.sendEmail(email, 'Password Reset Code', `Your password reset code is: ${resetCode}`);
            console.log('Password reset email sent');
            return resetCode;
        });
    }
    // Step 2: Verify the reset code
    verifyResetCode(email, code) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Verifying reset code for email: ${email}`);
            const user = yield prisma.user.findUnique({ where: { Email: email } });
            if (!user || user.ResetCode !== code || (user.ResetCodeExpiry && new Date() > user.ResetCodeExpiry)) {
                console.log('Reset code invalid or expired');
                return false;
            }
            console.log('Reset code verified successfully');
            return true;
        });
    }
    // Step 3: Reset the password
    setNewPassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Setting new password for email: ${email}`);
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            const updatedUser = yield prisma.user.update({
                where: { Email: email },
                data: {
                    Password: hashedPassword,
                    ResetCode: null, // Clear the reset code
                    ResetCodeExpiry: null,
                },
            });
            // Send success email after password reset
            console.log(`Sending password reset confirmation email to ${email}`);
            yield this.sendEmail(email, 'Password Reset Successful', `Your password has been successfully updated.`);
            console.log('Password reset confirmation email sent');
            return updatedUser;
        });
    }
}
exports.default = new UsersService();
