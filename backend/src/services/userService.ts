import axios from 'axios';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

class UsersService {
  private brevoApiKey = process.env.BREVO_API_KEY as string; // Ensure this is set in your .env file
  private brevoSenderEmail = process.env.BREVO_SENDER_EMAIL as string; // Sender email for Brevo
  private companyName = 'Haven Builders'; // Company name for email customization
  private logoUrl = 'http://localhost:5000/images/house.jpg';

  // Create a new user
  async createUser(name: string, email: string, password: string, role: UserRole = UserRole.user) {
    console.log('Starting user creation process');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed password for ${email}`);

    const user = await prisma.user.create({
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
    await this.sendEmail(
      email,
      'Welcome to HavenHomes!',
      `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; text-align: center; width: 100%; margin: 0px; border-radius: 8px;">
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
      </div>`
    );

    console.log('Registration email sent');
    return user;
  }

  // Send an email using Brevo
  private async sendEmail(to: string, subject: string, content: string) {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: this.brevoSenderEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: content,
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Email sent successfully: ${response.status}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error('Failed to send email:', errorMessage);
      throw new Error(`Email sending failed: ${errorMessage}`);
    }
  }

  // Get user by ID
  async getUserById(userID: string) {
    console.log(`Fetching user with ID: ${userID}`);
    const user = await prisma.user.findUnique({
      where: {
        UserID: userID,
      },
    });
    console.log(user ? `User found: ${user.Email}` : 'User not found');
    return user;
  }

  // Get all users
  async getAllUsers() {
    console.log('Fetching all users');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    return users;
  }

  // Reset user password
  async resetPassword(userID: string, newPassword: string) {
    console.log(`Resetting password for user ID: ${userID}`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: {
        UserID: userID,
      },
      data: {
        Password: hashedPassword,
      },
    });

    console.log(`Password updated for user ID: ${userID}`);
    return updatedUser;
  }

  // Update user details (excluding password)
  async updateUser(userID: string, name?: string, email?: string, role?: UserRole) {
    console.log(`Updating user ID: ${userID}`);
    const updatedUser = await prisma.user.update({
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
  }

  // Delete user
  async deleteUser(userID: string) {
    console.log(`Deleting user ID: ${userID}`);
    await prisma.user.delete({
      where: {
        UserID: userID,
      },
    });

    console.log(`User ID: ${userID} deleted successfully`);
    return { message: 'User deleted successfully' };
  }

  // Step 1: Generate reset code and send email
  async generateResetCode(email: string) {
    console.log(`Generating reset code for email: ${email}`);
    const user = await prisma.user.findUnique({ where: { Email: email } });
    if (!user) {
      throw new Error('User not found');
    }

    const resetCode = crypto.randomBytes(3).toString('hex'); // 6-character code
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    console.log(`Generated reset code: ${resetCode}`);
    await prisma.user.update({
      where: { Email: email },
      data: {
        ResetCode: resetCode,
        ResetCodeExpiry: expiryTime,
      },
    });

    // Send email with the reset code
    console.log(`Sending reset code to ${email}`);
    await this.sendEmail(
      email,
      'Password Reset Code',
      `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #ffffff; text-align: center; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px;">
        <h2 style="color: #e76f51; font-size: 2rem;">Password Reset Code</h2>
        <p style="color: #555; font-size: 1.2rem;">We received a request to reset your password.</p>
        <p style="color: #555; font-size: 1.2rem;">Your password reset code is: <strong style="font-size: 1.5rem; color: #333;">${resetCode}</strong></p>
        <p style="color: #555; font-size: 1.2rem;">The code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
        <p style="color: #555; font-size: 1.2rem;">Best regards,<br /><strong>${this.companyName} Team</strong></p>
      </div>`
    );

    console.log('Password reset email sent');
    return resetCode;
  }

  // Step 2: Verify the reset code
  async verifyResetCode(email: string, code: string) {
    console.log(`Verifying reset code for email: ${email}`);
    const user = await prisma.user.findUnique({ where: { Email: email } });
    if (!user || user.ResetCode !== code || (user.ResetCodeExpiry && new Date() > user.ResetCodeExpiry)) {
      console.log('Reset code invalid or expired');
      return false;
    }

    console.log('Reset code verified successfully');
    return true;
  }

  // Step 3: Reset the password
  // Step 3: Reset the password
async setNewPassword(email: string, newPassword: string) {
  console.log(`Setting new password for email: ${email}`);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { Email: email },
    data: {
      Password: hashedPassword,
      ResetCode: null, // Clear the reset code
      ResetCodeExpiry: null,
    },
  });

  // Send success email after password reset
  console.log(`Sending password reset confirmation email to ${email}`);
  await this.sendEmail(
    email,
  'Password Reset Successful',
  `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #ffffff; text-align: center; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px;">
    <h2 style="color: #2a9d8f; font-size: 2rem;">Password Reset Successful</h2>
    <p style="color: #555; font-size: 1.2rem;">Your password has been successfully updated.</p>
    <p style="color: #555; font-size: 1.2rem;">If you didn't make this change, please contact support immediately.</p>
    <p style="color: #555; font-size: 1.2rem;">Best regards,<br /><strong>${this.companyName} Team</strong></p>
  </div>`
  );

  console.log('Password reset confirmation email sent');
  return { message: 'Password reset successfully' }; // Only returning a success message
}
}

export default new UsersService();
