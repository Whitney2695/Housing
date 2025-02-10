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
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
class UsersService {
    constructor() {
        this.brevoApiKey = process.env.BREVO_API_KEY; // Ensure this is set in your .env file
        this.brevoSenderEmail = process.env.BREVO_SENDER_EMAIL; // Sender email for Brevo
        this.companyName = 'Haven Builders'; // Company name for email customization
        this.logoUrl = 'http://localhost:5000/images/house.jpg';
    }
    // Create a new user
    createUser(name_1, email_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (name, email, password, role = client_1.UserRole.user) {
            console.log('Starting user creation process');
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
            console.log(`User created successfully: ${user.Email}`);
            // Send registration email
            console.log(`Sending registration email to ${email}`);
            yield this.sendEmail(email, 'Welcome to HavenHomes!', `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; text-align: center; width: 100%; margin: 0px; border-radius: 8px;">
        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 20px;">
          <span style="color: #e63946;">W</span>
          <span style="color: #f4a261;">E</span>
          <span style="color: #2a9d8f;">L</span>
          <span style="color: #457b9d;">C</span>
          <span style="color: #1d3557;">O</span>
          <span style="color: #6a0572;">M</span>
          <span style="color: #ff9f1c;">E</span>
        </div>
        <h2 style="color: #2a9d8f; font-size: 1.8rem;">Hello ${name},</h2>
        <p style="color: #555; font-size: 1.2rem;">You have successfully registered with <strong>${this.companyName}</strong>.</p>
        <p style="color: #555; font-size: 1.2rem;">We are excited to have you onboard!</p>
        <p style="color: #555; font-size: 1.2rem;">Best regards,<br /><strong>${this.companyName} Team</strong></p>
      </div>`);
            console.log('Registration email sent');
            return user;
        });
    }
    // Send an email using Brevo
    sendEmail(to, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
                    sender: { email: this.brevoSenderEmail },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: content,
                }, {
                    headers: {
                        'api-key': this.brevoApiKey,
                        'Content-Type': 'application/json',
                    },
                });
                console.log(`Email sent successfully: ${response.status}`);
            }
            catch (error) {
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
    updateUser(userID, name, email, role, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Updating user ID: ${userID}`);
            let imageUrl = undefined;
            // Check if profileImage is provided (local file path)
            if (profileImage) {
                const imagePath = path_1.default.resolve(__dirname, '..', 'uploads', profileImage); // Ensure the 'uploads' folder exists
                // Check if the file exists locally
                if (!fs_1.default.existsSync(imagePath)) {
                    console.error(`File not found: ${imagePath}`);
                    throw new Error(`Profile image file not found`);
                }
                try {
                    // Upload to Cloudinary
                    const uploadResponse = yield cloudinary_1.default.uploader.upload(imagePath, {
                        folder: 'user_profiles',
                    });
                    // Store the URL from Cloudinary
                    imageUrl = uploadResponse.secure_url;
                    console.log(`Profile image uploaded: ${imageUrl}`);
                }
                catch (error) {
                    console.error('Error uploading profile image to Cloudinary:', error);
                    throw new Error('Failed to upload profile image');
                }
            }
            // Update user details in the database
            const updatedUser = yield prisma.user.update({
                where: {
                    UserID: userID,
                },
                data: {
                    Name: name,
                    Email: email,
                    Role: role,
                    ProfileImageUrl: imageUrl || undefined,
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
            yield this.sendEmail(email, 'Password Reset Code', `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #ffffff; text-align: center; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px;">
        <h2 style="color: #e76f51; font-size: 2rem;">Password Reset Code</h2>
        <p style="color: #555; font-size: 1.2rem;">We received a request to reset your password.</p>
        <p style="color: #555; font-size: 1.2rem;">Your password reset code is: <strong style="font-size: 1.5rem; color: #333;">${resetCode}</strong></p>
        <p style="color: #555; font-size: 1.2rem;">The code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
        <p style="color: #555; font-size: 1.2rem;">Best regards,<br /><strong>${this.companyName} Team</strong></p>
      </div>`);
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
    // Step 3: Reset the password
    setNewPassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Setting new password for email: ${email}`);
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield prisma.user.update({
                where: { Email: email },
                data: {
                    Password: hashedPassword,
                    ResetCode: null, // Clear the reset code
                    ResetCodeExpiry: null,
                },
            });
            // Send success email after password reset
            console.log(`Sending password reset confirmation email to ${email}`);
            yield this.sendEmail(email, 'Password Reset Successful', `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #ffffff; text-align: center; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px;">
    <h2 style="color: #2a9d8f; font-size: 2rem;">Password Reset Successful</h2>
    <p style="color: #555; font-size: 1.2rem;">Your password has been successfully updated.</p>
    <p style="color: #555; font-size: 1.2rem;">If you didn't make this change, please contact support immediately.</p>
    <p style="color: #555; font-size: 1.2rem;">Best regards,<br /><strong>${this.companyName} Team</strong></p>
  </div>`);
            console.log('Password reset confirmation email sent');
            return { message: 'Password reset successfully' }; // Only returning a success message
        });
    }
}
exports.default = new UsersService();
