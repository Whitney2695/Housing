import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import { CustomRequest } from '../middleware/authMiddleware'; // Import CustomRequest interface for middleware

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

class MortgageService {
  private brevoApiKey = process.env.BREVO_API_KEY as string;
  private brevoSenderEmail = process.env.BREVO_SENDER_EMAIL as string;
  private companyName = 'Haven Builders';
  private logoUrl = 'http://localhost:5000/images/house.jpg';

  constructor() {
    console.log('MortgageService initialized.');
  }

  // Mortgage Calculation
  private calculateMortgage(loanAmount: number, interestRate: number, loanTermYears: number) {
    console.log('Calculating mortgage with:', { loanAmount, interestRate, loanTermYears });

    if (interestRate <= 0 || loanAmount <= 0 || loanTermYears <= 0) {
      throw new Error('Invalid loan parameters. Ensure all values are greater than zero.');
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const monthlyPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    console.log('Mortgage calculated successfully.');
    return { monthlyPayment, totalPayment, totalInterest };
  }

  // Send Email using Brevo
  private async sendEmail(to: string, subject: string, content: string) {
    try {
      console.log(`Sending email to ${to}...`);
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
      console.error('Failed to send email:', error.response?.data?.message || error.message);
    }
  }

  // Create Mortgage
async createMortgage(mortgageDetails: any, req: CustomRequest = {} as CustomRequest) {
  try {
    console.log('Creating new mortgage...');

    const existingMortgage = await prisma.mortgage.findFirst({
      where: {
        UserID: mortgageDetails.userId,
        projectId: mortgageDetails.projectId || null,
      },
    });

    if (existingMortgage) {
      throw new Error('Mortgage exists for this user and project');
    }

    let interestRate = mortgageDetails.interestRate;

    if (mortgageDetails.projectId) {
      const project = await prisma.project.findUnique({
        where: { ProjectID: mortgageDetails.projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      interestRate = project.InterestRate || mortgageDetails.interestRate;
    }

    const { monthlyPayment, totalPayment, totalInterest } = this.calculateMortgage(
      mortgageDetails.loanAmount,
      interestRate,
      mortgageDetails.loanTermYears
    );

    const newMortgage = await prisma.mortgage.create({
      data: {
        UserID: mortgageDetails.userId,
        Income: mortgageDetails.income,
        LoanAmount: mortgageDetails.loanAmount,
        InterestRate: interestRate,
        LoanTermYears: mortgageDetails.loanTermYears,
        MonthlyPayment: monthlyPayment,
        TotalPayment: totalPayment,
        TotalInterest: totalInterest,
        CreditScore: mortgageDetails.creditScore,
        IsEligible: true,
        CalculatedAt: new Date(),
        projectId: mortgageDetails.projectId || null,
      },
    });

    console.log('Mortgage created successfully:', newMortgage);

    // Retrieve the email and name
    let userEmail = req.user?.email;
    let userName = req.user?.name;

    if (!userEmail || !userName) {
      const user = await prisma.user.findUnique({
        where: { UserID: mortgageDetails.userId },
        select: { Email: true, Name: true },
      });

      if (!user || !user.Email || !user.Name) {
        throw new Error('User email or name not found.');
      }

      userEmail = user.Email;
      userName = user.Name;
    }

    // Send confirmation email
    const subject = 'Mortgage Application Submitted Successfully';
    const content = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2C3E50;">Dear ${userName},</h2>
        <p>Your mortgage application has been successfully submitted. Here are the details:</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Loan Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.LoanAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Interest Rate:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.InterestRate}%</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Monthly Payment:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.MonthlyPayment}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Payment:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.TotalPayment}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Interest:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${newMortgage.TotalInterest}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Thank you for choosing <strong>${this.companyName}</strong>!</p>
        <img src="${this.logoUrl}" alt="${this.companyName} Logo" style="width: 150px; margin-top: 20px;" />
      </div>
    `;

    await this.sendEmail(userEmail, subject, content);

    return newMortgage;
  } catch (error: any) {
    console.error('Error creating mortgage:', error.message);
    throw { error: error.message || error };
  }
}


  // Get Mortgage by ID
  async getMortgageById(mortgageId: string) {
    console.log(`Fetching mortgage with ID: ${mortgageId}...`);
    const mortgage = await prisma.mortgage.findUnique({ where: { MortgageID: mortgageId } });
    if (!mortgage) throw new Error('Mortgage not found');
    return mortgage;
  }

  // Get All Mortgages
  async getAllMortgages() {
    console.log('Fetching all mortgages...');
    return await prisma.mortgage.findMany();
  }

// Update Mortgage
async updateMortgage(mortgageId: string, mortgageDetails: any) {
  try {
    console.log(`Updating mortgage with ID: ${mortgageId}...`);
    const existingMortgage = await prisma.mortgage.findUnique({
      where: { MortgageID: mortgageId },
    });

    if (!existingMortgage) {
      throw new Error('Mortgage not found');
    }

    let interestRate = mortgageDetails.interestRate;
    if (mortgageDetails.projectId) {
      const project = await prisma.project.findUnique({
        where: { ProjectID: mortgageDetails.projectId },
      });
      if (!project) {
        throw new Error('Project not found');
      }
      interestRate = project.InterestRate;
    }

    const { monthlyPayment, totalPayment, totalInterest } = this.calculateMortgage(
      mortgageDetails.loanAmount,
      interestRate,
      mortgageDetails.loanTermYears
    );

    const updatedMortgage = await prisma.mortgage.update({
      where: { MortgageID: mortgageId },
      data: {
        Income: mortgageDetails.income,
        LoanAmount: mortgageDetails.loanAmount,
        InterestRate: interestRate,
        LoanTermYears: mortgageDetails.loanTermYears,
        MonthlyPayment: monthlyPayment,
        TotalPayment: totalPayment,
        TotalInterest: totalInterest,
        CreditScore: mortgageDetails.creditScore,
      },
    });

    console.log('Mortgage updated successfully.');

    // Retrieve the email and name of the user
    const user = await prisma.user.findUnique({
      where: { UserID: existingMortgage.UserID },
      select: { Email: true, Name: true },
    });

    if (!user || !user.Email || !user.Name) {
      throw new Error('User email or name not found.');
    }

    const subject = 'Mortgage Updated Successfully';
    const content = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2C3E50;">Dear ${user.Name},</h2>
        <p>Your mortgage details have been successfully updated. Here are the updated details:</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Loan Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.LoanAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Interest Rate:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.InterestRate}%</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Monthly Payment:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.MonthlyPayment}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Payment:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.TotalPayment}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f4f4f4;"><strong>Total Interest:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updatedMortgage.TotalInterest}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Thank you for choosing <strong>${this.companyName}</strong>!</p>
        <img src="${this.logoUrl}" alt="${this.companyName} Logo" style="width: 150px; margin-top: 20px;" />
      </div>
    `;
    
    await this.sendEmail(user.Email, subject, content);

    return updatedMortgage;
  } catch (error: any) {
    console.error('Error updating mortgage:', error.message);
    throw { error: error.message || error };
  }
}

  // Delete Mortgage
  async deleteMortgage(mortgageId: string) {
    try {
      console.log(`Deleting mortgage with ID: ${mortgageId}...`);
      const deletedMortgage = await prisma.mortgage.delete({ where: { MortgageID: mortgageId } });
      console.log('Mortgage deleted successfully.');
      return deletedMortgage;
    } catch (error: any) {
      console.error('Error deleting mortgage:', error.message);
      throw { error: error.message || error };
    }
  }
}



export default new MortgageService();
