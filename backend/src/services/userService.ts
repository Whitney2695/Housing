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

  async createUser(name: string, email: string, password: string, role: UserRole = UserRole.user) {
    console.log('Starting user creation process'); // Log the start of the process
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

    console.log(`User created successfully: ${user.Email}`); // Log successful creation

    // Send email after successful registration
    console.log(`Sending registration email to ${email}`);
    await this.sendEmail(
      email,
      'Registration Successful',
      `Hello ${name},\n\nYou have successfully registered!`
    );

    console.log('Registration email sent'); // Log email sent status
    return user;
  }

  async sendEmail(to: string, subject: string, content: string) {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: this.brevoSenderEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: `<p>${content.replace(/\n/g, '<br>')}</p>`,
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
      // General error handling
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
      `Your password reset code is: ${resetCode}`
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
  async setNewPassword(email: string, newPassword: string) {
    console.log(`Setting new password for email: ${email}`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
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
      `Your password has been successfully updated.`
    );

    console.log('Password reset confirmation email sent');
    return updatedUser;
  }
}

export default new UsersService();
