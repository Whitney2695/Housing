import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

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
  async createMortgage(mortgageDetails: any) {
    try {
      console.log('Creating new mortgage...');

      // Check if the user already has a mortgage for the same project
      const existingMortgage = await prisma.mortgage.findFirst({
        where: {
          UserID: mortgageDetails.userId,
          projectId: mortgageDetails.projectId || null,
        },
      });

      if (existingMortgage) {
        console.error('Mortgage already exists for this user and project.');
        throw new Error('Mortgage already exists for this user and project');
      }

      let interestRate = mortgageDetails.interestRate;

      if (mortgageDetails.projectId) {
        const project = await prisma.project.findUnique({
          where: { ProjectID: mortgageDetails.projectId },
        });

        if (!project) {
          console.error('Project not found.');
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
      return newMortgage;
    } catch (error: any) {
      console.error('Error creating mortgage:', error.message);
      throw new Error('Mortgage creation failed');
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
      const existingMortgage = await prisma.mortgage.findUnique({ where: { MortgageID: mortgageId } });

      if (!existingMortgage) {
        console.error('Mortgage not found.');
        throw new Error('Mortgage not found');
      }

      let interestRate = mortgageDetails.interestRate;
      if (mortgageDetails.projectId) {
        const project = await prisma.project.findUnique({ where: { ProjectID: mortgageDetails.projectId } });
        if (!project) {
          console.error('Project not found.');
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

      console.log('Mortgage updated successfully:', updatedMortgage);

      // Send email after successful update
      const subject = 'Your Mortgage Details Have Been Updated';
      const content = `
        <p>Dear Customer,</p>
        <p>Your mortgage details have been successfully updated. Here are your new mortgage details:</p>
        <p><strong>Loan Amount:</strong> ${updatedMortgage.LoanAmount}</p>
        <p><strong>Interest Rate:</strong> ${updatedMortgage.InterestRate}%</p>
        <p><strong>Monthly Payment:</strong> ${updatedMortgage.MonthlyPayment}</p>
        <p><strong>Total Payment:</strong> ${updatedMortgage.TotalPayment}</p>
        <p><strong>Total Interest:</strong> ${updatedMortgage.TotalInterest}</p>
        <p>If you have any questions, please contact us at support@havenbuilders.com.</p>
        <p>Thank you for choosing Haven Builders!</p>
        <img src="${this.logoUrl}" alt="${this.companyName} Logo" />
      `;

      // Send the email to a static address (e.g., support or admin email)
      const staticEmail = 'support@havenbuilders.com'; // Replace with your desired email address
      await this.sendEmail(staticEmail, subject, content);

      return updatedMortgage;
    } catch (error: any) {
      console.error('Error updating mortgage:', error.message);
      throw new Error('Mortgage update failed');
    }
  }

  // Delete Mortgage
  async deleteMortgage(mortgageId: string) {
    try {
      console.log(`Deleting mortgage with ID: ${mortgageId}...`);
      const deletedMortgage = await prisma.mortgage.delete({ where: { MortgageID: mortgageId } });
      console.log('Mortgage deleted successfully:', deletedMortgage);
      return deletedMortgage;
    } catch (error: any) {
      console.error('Error deleting mortgage:', error.message);
      throw new Error('Mortgage deletion failed');
    }
  }
}

export default new MortgageService();
